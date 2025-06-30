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

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    zones.length > 0 ? zones[0].id : null
  );

  const handleFeaturesUpdate = useCallback(
    (updatedFeatures: Feature<Polygon>[]) => {
      // In a real application, you would handle creating, updating,
      // and deleting zones based on the features returned from the map editor.
      console.log('Map features have changed:', updatedFeatures);
      // For this prototype, we just log the changes.
    },
    []
  );
  
  const selectedZone = zones.find(z => z.id === selectedZoneId);

  return (
    <>
      <PageHeader
        title="Zone Management"
        description="Draw and manage geographical zones for vehicle assignment."
      >
        <Button onClick={() => alert('TODO: Implement new zone creation')}>
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
                      style={{ backgroundColor: `${zone.color}80` }} // 50% opacity
                    />
                    <span className="font-medium">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => alert(`TODO: Edit ${zone.name}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                       onClick={() => alert(`TODO: Delete ${zone.name}`)}
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
          />
        </div>
      </div>
    </>
  );
}
