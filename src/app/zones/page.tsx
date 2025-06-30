'use client';

import { useState, useCallback } from 'react';
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
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const canEditZones = ['Admin', 'Supervisor'].includes(role);

  const handleFeaturesUpdate = useCallback(
    (updatedFeatures: Feature<Polygon>[]) => {
      setZones(currentZones => {
        const updatedIds = new Set(updatedFeatures.map(f => f.id));
        
        // Update existing zones or add new ones
        const newZones = updatedFeatures.map(feature => {
          const existingZone = currentZones.find(z => z.id === feature.id);
          if (existingZone) {
            return { ...existingZone, geometry: feature.geometry };
          }
          return {
            id: feature.id as string,
            name: `New Zone ${feature.id?.substring(0, 4)}`,
            color: getRandomColor(),
            geometry: feature.geometry,
          };
        });

        // Filter out deleted zones
        return newZones.filter(z => updatedIds.has(z.id));
      });
    },
    []
  );

  const handleCreateZone = () => {
    alert('To create a new zone, use the polygon drawing tool on the map.');
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones(currentZones => currentZones.filter(z => z.id !== zoneId));
  };

  const handleSaveZone = (updatedZone: Zone) => {
    setZones(currentZones =>
      currentZones.map(z => (z.id === updatedZone.id ? updatedZone : z))
    );
    setEditingZone(null);
  };
  
  if (!canEditZones) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">You do not have permission to manage zones. Please contact an administrator.</p>
                </CardContent>
            </Card>
        </div>
    )
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
                    selectedZoneId === zone.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedZoneId(zone.id)}
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
            zones={zones}
            onUpdate={handleFeaturesUpdate}
            onSelect={setSelectedZoneId}
            selectedZoneId={selectedZoneId}
          />
        </div>
      </div>
      <EditZoneDialog
        zone={editingZone}
        isOpen={!!editingZone}
        onOpenChange={isOpen => !isOpen && setEditingZone(null)}
        onSave={handleSaveZone}
      />
    </>
  );
}
