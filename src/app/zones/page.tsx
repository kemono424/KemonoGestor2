
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EditZoneDialog } from '@/components/edit-zone-dialog';
import ZoneGridEditor from '@/components/zone-grid-editor';
import type { GridConfig, ZoneDefinition } from '@/types';
import { areCellsConnected } from '@/lib/grid-utils';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones';

const INITIAL_GRID_CONFIG: GridConfig = {
  rows: 20,
  cols: 20,
  center: { lat: -24.7859, lng: -65.4117 },
  cellSize: 0.005, // Approx 500 meters
};

export default function ZonesPage() {
  const [gridConfig, setGridConfig] = useState<GridConfig>(INITIAL_GRID_CONFIG);
  const [tempConfig, setTempConfig] = useState<GridConfig>(INITIAL_GRID_CONFIG);
  const [zones, setZones] = useState<ZoneDefinition[]>([]);
  const [cellAssignments, setCellAssignments] = useState<Record<string, string | null>>({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { gridConfig: savedGrid, zones: savedZones, cellAssignments: savedAssignments } = JSON.parse(savedData);
        if (savedGrid && savedZones && savedAssignments) {
          setGridConfig(savedGrid);
          setTempConfig(savedGrid);
          setZones(savedZones);
          setCellAssignments(savedAssignments);
        }
      }
    } catch (error) {
      console.error("Failed to parse zones from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        const dataToSave = JSON.stringify({ gridConfig, zones, cellAssignments });
        localStorage.setItem(LOCAL_STORAGE_KEY, dataToSave);
      } catch (error) {
        console.error("Failed to save zones to localStorage", error);
      }
    }
  }, [gridConfig, zones, cellAssignments, isMounted]);

  const handleUpdateGrid = () => {
    setGridConfig(tempConfig);
    // Clear selections and assignments if grid changes
    setSelectedCells(new Set());
    setCellAssignments({});
    setZones([]);
    toast({ title: "Grid Updated", description: "The map grid has been reconfigured." });
  };

  const handleCellClick = useCallback((cellId: string) => {
    if (cellAssignments[cellId]) {
      toast({ variant: 'destructive', title: 'Cell Already Assigned', description: 'This cell belongs to another zone. You must unassign it first.' });
      return;
    }
    
    setSelectedCells(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(cellId)) {
        newSelection.delete(cellId);
      } else {
        newSelection.add(cellId);
      }
      return newSelection;
    });
  }, [cellAssignments, toast]);

  const handleCreateZoneClick = () => {
    if (selectedCells.size === 0) {
      toast({ variant: 'destructive', title: 'No Cells Selected', description: 'Please select one or more cells to form a zone.' });
      return;
    }
    if (!areCellsConnected(Array.from(selectedCells), gridConfig.rows, gridConfig.cols)) {
      toast({ variant: 'destructive', title: 'Selection Not Connected', description: 'All selected cells must be adjacent to form a single zone.' });
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
    
    setZones(prev => [...prev, newZone]);
    setCellAssignments(prev => {
      const newAssignments = { ...prev };
      selectedCells.forEach(cellId => {
        newAssignments[cellId] = newZoneId;
      });
      return newAssignments;
    });

    setSelectedCells(new Set());
    setIsDialogOpen(false);
    toast({ title: 'Zone Created', description: `Zone "${name}" has been successfully created.` });
  };

  const handleDeleteZone = (zoneIdToDelete: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneIdToDelete));
    setCellAssignments(prev => {
        const newAssignments = {...prev};
        const zoneToDelete = zones.find(z => z.id === zoneIdToDelete);
        if (zoneToDelete) {
            zoneToDelete.cellIds.forEach(cellId => {
                if (newAssignments[cellId] === zoneIdToDelete) {
                    newAssignments[cellId] = null;
                }
            });
        }
        return newAssignments;
    });
    toast({ title: 'Zone Deleted' });
  };


  return (
    <>
      <PageHeader
        title="Zone Management"
        description="Define operational areas for your fleet using a grid system."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>Grid Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rows">Rows</Label>
                  <Input id="rows" type="number" value={tempConfig.rows} onChange={e => setTempConfig(c => ({ ...c, rows: parseInt(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cols">Columns</Label>
                  <Input id="cols" type="number" value={tempConfig.cols} onChange={e => setTempConfig(c => ({ ...c, cols: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
               <Button onClick={handleUpdateGrid} className="w-full">Update Grid</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Zone Controls</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Select connected cells on the map to create a new operational zone.</p>
              <Button onClick={handleCreateZoneClick} className="w-full" disabled={selectedCells.size === 0}>
                Create Zone from Selection ({selectedCells.size})
              </Button>
            </CardContent>
          </Card>

          <Card>
             <CardHeader><CardTitle>Active Zones</CardTitle></CardHeader>
             <CardContent>
                {zones.length > 0 ? (
                    <ul className="space-y-2">
                        {zones.map(zone => (
                            <li key={zone.id} className="flex items-center justify-between p-2 rounded-md bg-muted">
                               <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: zone.color }} />
                                <span className="font-medium">{zone.name}</span>
                               </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteZone(zone.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No zones created yet.</p>
                )}
             </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {isMounted ? (
            <ZoneGridEditor
              gridConfig={gridConfig}
              zones={zones}
              cellAssignments={cellAssignments}
              selectedCells={selectedCells}
              onCellClick={handleCellClick}
            />
          ) : (
            <div className="h-[600px] w-full bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Loading Map...</p>
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

    