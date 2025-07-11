'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditZoneDialog } from '@/components/edit-zone-dialog';
import ZoneGridEditor from '@/components/zone-grid-editor';
import type { GridConfig, ZoneDefinition } from '@/types';
import { areCellsConnected, generateGridLayer } from '@/lib/grid-utils';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/context/AppContext';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones-v2';
const TOTAL_GRID_WIDTH = 0.2; // degrees longitude
const TOTAL_GRID_HEIGHT = 0.2; // degrees latitude

export default function ZonesPage() {
  const { currentUser } = useAppContext();
  const [zones, setZones] = useState<ZoneDefinition[]>([]);
  const [cellAssignments, setCellAssignments] = useState<
    Record<string, string | null>
  >({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [rows, setRows] = useState(100);
  const [cols, setCols] = useState(100);

  const gridConfig = useMemo<GridConfig>(
    () => ({
      rows,
      cols,
      center: { lat: -24.7859, lng: -65.4117 },
      cellWidth: TOTAL_GRID_WIDTH / cols,
      cellHeight: TOTAL_GRID_HEIGHT / rows,
    }),
    [rows, cols]
  );

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const {
          zones: savedZones,
          cellAssignments: savedAssignments,
          gridConfig: savedGridConfig,
        } = JSON.parse(savedData);
        if (savedZones) {
          setZones(savedZones);
        }
        if (savedAssignments) {
          setCellAssignments(savedAssignments);
        }
        if (savedGridConfig) {
          setRows(savedGridConfig.rows);
          setCols(savedGridConfig.cols);
        }
      }
    } catch (error) {
      console.error('Failed to parse zones from localStorage', error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        const dataToSave = JSON.stringify({
          zones,
          cellAssignments,
          gridConfig,
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
      } catch (error) {
        console.error('Failed to save zones to localStorage', error);
      }
    }
  }, [zones, cellAssignments, gridConfig, isMounted]);

  const gridData = useMemo(() => {
    return generateGridLayer(gridConfig, zones, cellAssignments, selectedCells);
  }, [gridConfig, zones, cellAssignments, selectedCells]);

  const handleCellClick = useCallback(
    (cellId: string) => {
      if (cellAssignments[cellId]) {
        toast({
          variant: 'destructive',
          title: 'Celda Ya Asignada',
          description:
            'Esta celda pertenece a otra zona. Debes desasignarla primero.',
        });
        return;
      }

      setSelectedCells((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(cellId)) {
          newSelection.delete(cellId);
        } else {
          newSelection.add(cellId);
        }
        return newSelection;
      });
    },
    [cellAssignments, toast]
  );

  const handleCreateZoneClick = () => {
    if (selectedCells.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No hay Celdas Seleccionadas',
        description: 'Por favor, selecciona una o más celdas para formar una zona.',
      });
      return;
    }
    if (!areCellsConnected(Array.from(selectedCells))) {
      toast({
        variant: 'destructive',
        title: 'Selección no Conectada',
        description:
          'Todas las celdas seleccionadas deben ser adyacentes para formar una única zona.',
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSaveZone = (name: string, color: string) => {
    const newZoneId = `zone-${Date.now()}`;
    const newZone: ZoneDefinition = {
      id: newZoneId,
      name,
      color,
      cellIds: Array.from(selectedCells),
    };

    setZones((prev) => [...prev, newZone]);
    setCellAssignments((prev) => {
      const newAssignments = { ...prev };
      selectedCells.forEach((cellId) => {
        newAssignments[cellId] = newZoneId;
      });
      return newAssignments;
    });

    setSelectedCells(new Set());
    setIsDialogOpen(false);
    toast({
      title: 'Zona Creada',
      description: `La zona "${name}" ha sido creada exitosamente.`,
    });
  };

  const handleDeleteZone = (zoneIdToDelete: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneIdToDelete));
    setCellAssignments((prev) => {
      const newAssignments = { ...prev };
      const zoneToDelete = zones.find((z) => z.id === zoneIdToDelete);
      if (zoneToDelete) {
        zoneToDelete.cellIds.forEach((cellId) => {
          if (newAssignments[cellId] === zoneIdToDelete) {
            newAssignments[cellId] = null;
          }
        });
      }
      return newAssignments;
    });
    toast({ title: 'Zona Eliminada' });
  };

  if (!currentUser || !['Admin', 'Supervisor'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No tienes permiso para ver esta página. Por favor, contacta a un
              administrador si crees que esto es un error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Gestión de Zonas"
        description="Define áreas operativas para tu flota usando un sistema de cuadrícula."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Controles de Zona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecciona celdas en la cuadrícula para crear una nueva zona operativa.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Filas</Label>
                  <Input
                    id="rows"
                    type="number"
                    value={rows}
                    onChange={(e) =>
                      setRows(Math.max(1, Number(e.target.value)))
                    }
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cols">Columnas</Label>
                  <Input
                    id="cols"
                    type="number"
                    value={cols}
                    onChange={(e) =>
                      setCols(Math.max(1, Number(e.target.value)))
                    }
                    placeholder="100"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateZoneClick}
                className="w-full"
                disabled={selectedCells.size === 0}
              >
                Crear Zona desde Selección ({selectedCells.size})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zonas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              {zones.length > 0 ? (
                <ul className="space-y-2">
                  {zones.map((zone) => (
                    <li
                      key={zone.id}
                      className="flex items-center justify-between p-2 rounded-md bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="font-medium">{zone.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aún no hay zonas creadas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {isMounted ? (
            <ZoneGridEditor
              gridData={gridData}
              onCellClick={handleCellClick}
            />
          ) : (
            <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Cargando Mapa...</p>
            </div>
          )}
        </div>
      </div>
      <EditZoneDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={(name, color) => handleSaveZone(name, color)}
        zone={null}
      />
    </>
  );
}
