'use client';

import { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { zones as mockZones, type Zone } from '@/lib/mock-data';
import ZoneMapEditor from '@/components/zone-map-editor';
import type { Feature, Polygon } from 'geojson';
import { EditZoneDialog } from '@/components/edit-zone-dialog';
import { useAppContext } from '@/context/AppContext';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export default function ZonesPage() {
  const { role } = useAppContext();
  const [zones, setZones] = useState<Zone[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [drawInstance, setDrawInstance] = useState<any>(null);

  const canEditZones = ['Admin', 'Supervisor'].includes(role);

  // Load zones from localStorage on mount, or initialize with mock data
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedZones = localStorage.getItem('fleet-manager-zones');
      if (savedZones) {
        setZones(JSON.parse(savedZones));
      } else {
        setZones(mockZones);
      }
    } catch (error) {
      console.error("Failed to access localStorage. Using mock data.", error);
      setZones(mockZones);
    }
  }, []);

  // Save zones to localStorage whenever they change, after initial mount
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('fleet-manager-zones', JSON.stringify(zones));
      } catch (error) {
        console.error("Failed to save zones to localStorage.", error);
      }
    }
  }, [zones, isMounted]);

  // Effect to sync zones state with the map features
  useEffect(() => {
    if (drawInstance && isMounted) {
      const featureIdsOnMap = drawInstance.getAll().features.map((f: Feature) => f.id);
      
      // Don't resync if a new feature was just drawn and is being edited
      if (featureIdsOnMap.includes(editingZone?.id ?? '')) {
         const unsavedFeature = drawInstance.get(editingZone!.id);
         if(unsavedFeature && unsavedFeature.properties.name === undefined) {
            return;
         }
      }

      drawInstance.deleteAll();
      if (zones.length > 0) {
        const features = zones.map(z => ({
          id: z.id,
          type: 'Feature' as const,
          properties: { name: z.name, color: z.color },
          geometry: z.geometry,
        }));
        drawInstance.add({ type: 'FeatureCollection', features });
      }
    }
  }, [zones, drawInstance, isMounted, editingZone]);


  const handleMapUpdate = useCallback(
    (event: { type: string; features: Feature<Polygon>[] }) => {
      if (!drawInstance) return;

      const { type, features } = event;

      if (type === 'draw.create') {
        const newFeature = features[0];
        const newZone: Zone = {
          id: newFeature.id as string,
          name: 'New Zone',
          color: getRandomColor(),
          geometry: newFeature.geometry,
        };
        setEditingZone(newZone);
      } else if (type === 'draw.update') {
        setZones((currentZones) =>
          currentZones.map((zone) => {
            const updatedFeature = features.find((f) => f.id === zone.id);
            if (updatedFeature) {
              return { ...zone, geometry: updatedFeature.geometry };
            }
            return zone;
          })
        );
      } else if (type === 'draw.delete') {
        const deletedIds = new Set(features.map((f) => f.id as string));
        setZones((currentZones) =>
          currentZones.filter((z) => !deletedIds.has(z.id))
        );
      } else if (type === 'draw.selectionchange') {
         const selectedIds = drawInstance.getSelectedIds();
         if (selectedIds.length > 0) {
            setSelectedZoneId(selectedIds[0]);
         } else {
            setSelectedZoneId(null);
         }
      }
    },
    [drawInstance]
  );

  const handleCreateZone = () => {
    if (drawInstance) {
      drawInstance.changeMode('draw_polygon');
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    if (drawInstance) {
      drawInstance.delete([zoneId]);
    }
  };

  const handleSaveZone = (updatedZone: Zone) => {
    const isNew = !zones.some(z => z.id === updatedZone.id);
    if(isNew) {
      setZones(current => [...current, updatedZone]);
    } else {
      setZones(currentZones =>
        currentZones.map(z => (z.id === updatedZone.id ? updatedZone : z))
      );
    }
    
    if (drawInstance) {
        drawInstance.setFeatureProperty(updatedZone.id, 'name', updatedZone.name);
        drawInstance.setFeatureProperty(updatedZone.id, 'color', updatedZone.color);
    }
    setEditingZone(null);
  };
  
  const onDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      const isNewUnsaved = editingZone?.name === 'New Zone';
      if (isNewUnsaved && drawInstance && editingZone) {
        handleDeleteZone(editingZone.id);
      }
      setEditingZone(null);
    }
  }

  if (!canEditZones) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You do not have permission to manage zones. Please contact an
              administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Zone Management"
        description="Draw and manage geographical zones for vehicle assignment."
      >
        <Button onClick={handleCreateZone}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Zone
        </Button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>All Zones</CardTitle>
            <CardDescription>
              Select a zone to view details or click a shape on the map.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {zones.map(zone => (
                <div
                  key={zone.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedZoneId === zone.id
                      ? 'bg-muted'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    setSelectedZoneId(zone.id)
                    if (drawInstance) {
                      try {
                        drawInstance.changeMode('simple_select', { featureIds: [zone.id] });
                      } catch (error) {
                        console.error("Error changing mode:", error)
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-sm border"
                      style={{ backgroundColor: `${zone.color}80` }}
                    />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingZone(zone);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-2">
          <ZoneMapEditor
            onUpdate={handleMapUpdate}
            setDrawInstance={setDrawInstance}
          />
        </div>
      </div>
      <EditZoneDialog
        zone={editingZone}
        isOpen={!!editingZone}
        onOpenChange={onDialogChange}
        onSave={handleSaveZone}
      />
    </>
  );
}
