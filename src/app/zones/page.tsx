
'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { EditZoneDialog } from '@/components/edit-zone-dialog';
import ZoneGridEditor from '@/components/zone-grid-editor';
import type { GridConfig, ZoneDefinition } from '@/types';
import { areCellsConnected } from '@/lib/grid-utils';
import { useToast } from '@/hooks/use-toast';
import { Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import type { ViewState } from 'react-map-gl';

const LOCAL_STORAGE_KEY = 'fleet-grid-zones';

const INITIAL_GRID_CONFIG: GridConfig = {
  rows: 20,
  cols: 20,
  center: { lat: -24.7859, lng: -65.4117 },
  cellSize: 0.005, // Approx 500 meters
};

const ZOOM_FACTOR = 1.2;

export default function ZonesPage() {
  const [gridConfig, setGridConfig] = useState<GridConfig>(INITIAL_GRID_CONFIG);
  const [zones, setZones] = useState<ZoneDefinition[]>([]);
  const [cellAssignments, setCellAssignments] = useState<Record<string, string | null>>({});
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [viewState, setViewState] = useState<ViewState>({
    longitude: INITIAL_GRID_CONFIG.center.lng,
    latitude: INITIAL_GRID_CONFIG.center.lat,
    zoom: 12,
    pitch: 0,
    bearing: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { gridConfig: savedGrid, zones: savedZones, cellAssignments: savedAssignments } = JSON.parse(savedData);
        if (savedGrid && savedZones && savedAssignments) {
          setGridConfig(savedGrid);
          setViewState(prev => ({ ...prev, longitude: savedGrid.center.lng, latitude: savedGrid.center.lat }));
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

  const handleGridMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    setGridConfig(prevConfig => {
      const moveStep = prevConfig.cellSize;
      let { lat, lng } = prevConfig.center;
      switch (direction) {
        case 'up': lat += moveStep; break;
        case 'down': lat -= moveStep; break;
        case 'left': lng -= moveStep; break;
        case 'right': lng += moveStep; break;
      }
      const newCenter = { lat, lng };
      setViewState(prev => ({ ...prev, longitude: newCenter.lng, latitude: newCenter.lat }));
      return { ...prevConfig, center: newCenter };
    });
  };

  const handleGridZoom = (direction: 'in' | 'out') => {
    setGridConfig(prevConfig => {
      const newCellSize = direction === 'in' ? prevConfig.cellSize / ZOOM_FACTOR : prevConfig.cellSize * ZOOM_FACTOR;
      // Changing scale is destructive
      setZones([]);
      setCellAssignments({});
      setSelectedCells(new Set());
      toast({ title: "Grid Rescaled", description: "Zones have been cleared due to grid scale change." });
      return { ...prevConfig, cellSize: newCellSize };
    });
  };
  
  const handleDimensionChange = (dimension: 'rows' | 'cols', value: number) => {
    if (isNaN(value) || value <= 0) return;
    // Changing dimensions is destructive
    setZones([]);
    setCellAssignments({});
    setSelectedCells(new Set());
    toast({ title: "Grid Resized", description: "Zones have been cleared due to grid dimension change." });
    setGridConfig(c => ({...c, [dimension]: value}));
  };
  
  const handleCoordinateChange = (coord: 'lat' | 'lng', valueAsString: string) => {
      const value = parseFloat(valueAsString);
      if(!isNaN(value)) {
          setGridConfig(c => {
            const newCenter = { ...c.center, [coord]: value };
            setViewState(prev => ({ ...prev, longitude: newCenter.lng, latitude: newCenter.lat }));
            return {
                ...c,
                center: newCenter
            }
          });
      }
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
    if (!areCellsConnected(Array.from(selectedCells))) {
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
  
  const handleMapMove = useCallback((evt: { viewState: ViewState }) => {
    setViewState(evt.viewState);
  }, []);

  return (
    <>
      <PageHeader
        title="Zone Management"
        description="Define operational areas for your fleet using a grid system."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
                <CardTitle>Grid Controls</CardTitle>
                <CardDescription>Position and scale the grid on the map.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-center block">Position</Label>
                    <div className="flex justify-center">
                        <Button variant="outline" size="icon" onClick={() => handleGridMove('up')} aria-label="Move grid up"><ArrowUp className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleGridMove('left')} aria-label="Move grid left"><ArrowLeft className="h-4 w-4" /></Button>
                        <div className="w-10 h-10" />
                        <Button variant="outline" size="icon" onClick={() => handleGridMove('right')} aria-label="Move grid right"><ArrowRight className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex justify-center">
                        <Button variant="outline" size="icon" onClick={() => handleGridMove('down')} aria-label="Move grid down"><ArrowDown className="h-4 w-4" /></Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="lat">Center Latitude</Label>
                        <Input id="lat" type="number" step="0.0001" value={gridConfig.center.lat.toFixed(4)} onChange={e => handleCoordinateChange('lat', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lng">Center Longitude</Label>
                        <Input id="lng" type="number" step="0.0001" value={gridConfig.center.lng.toFixed(4)} onChange={e => handleCoordinateChange('lng', e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-center block">Scale (Cell Size: {gridConfig.cellSize.toFixed(5)})</Label>
                    <div className="flex justify-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleGridZoom('out')} aria-label="Zoom out grid"><Minus className="h-4 w-4"/></Button>
                        <Button variant="outline" size="icon" onClick={() => handleGridZoom('in')} aria-label="Zoom in grid"><Plus className="h-4 w-4"/></Button>
                    </div>
                </div>
                
                 <div className="grid grid-cols-2 gap-4 border-t pt-6">
                    <div className="space-y-2">
                      <Label htmlFor="rows">Rows</Label>
                      <Input id="rows" type="number" value={gridConfig.rows} onChange={e => handleDimensionChange('rows', parseInt(e.target.value, 10))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cols">Columns</Label>
                      <Input id="cols" type="number" value={gridConfig.cols} onChange={e => handleDimensionChange('cols', parseInt(e.target.value, 10))} />
                    </div>
                </div>
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
              viewState={viewState}
              onMapMove={handleMapMove}
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
