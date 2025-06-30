
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, Trash2, Edit, CheckCircle } from 'lucide-react';
import { type Zone } from '@/types';
import { predefinedAreas } from '@/lib/mock-data';
import { EditZoneDialog } from '@/components/edit-zone-dialog';
import { useAppContext } from '@/context/AppContext';
import Map, { Source, Layer, Popup } from 'react-map-gl';
import type { FeatureCollection } from 'geojson';

export default function ZonesPage() {
  const { role } = useAppContext();
  const [activeZones, setActiveZones] = useState<Zone[]>([]);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<{name: string, lng: number, lat: number} | null>(null);

  const canEditZones = ['Admin', 'Supervisor'].includes(role);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedZones = localStorage.getItem('fleet-manager-zones');
      if (savedZones) {
        setActiveZones(JSON.parse(savedZones));
      }
    } catch (error) {
      console.error('Failed to load zones from localStorage.', error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('fleet-manager-zones', JSON.stringify(activeZones));
      } catch (error) {
        console.error('Failed to save zones to localStorage.', error);
      }
    }
  }, [activeZones, isMounted]);

  const handleActivate = (area: { id: string; name: string; }) => {
    const predefined = predefinedAreas.find(p => p.id === area.id);
    if (!predefined) return;

    const newZone: Zone = {
      id: predefined.id,
      name: predefined.name,
      geometry: predefined.geometry,
      color: '#3b82f6', // Default color
    };
    setEditingZone(newZone);
  };

  const handleDeactivate = (zoneId: string) => {
    setActiveZones((current) => current.filter((z) => z.id !== zoneId));
  };

  const handleEdit = (zone: Zone) => {
    setEditingZone(zone);
  };

  const handleSave = (updatedZone: Zone) => {
    const isNew = !activeZones.some((z) => z.id === updatedZone.id);
    if (isNew) {
      setActiveZones((current) => [...current, updatedZone]);
    } else {
      setActiveZones((current) =>
        current.map((z) => (z.id === updatedZone.id ? updatedZone : z))
      );
    }
    setEditingZone(null);
  };

  const onDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEditingZone(null);
    }
  };

  const availableAreas = isMounted
    ? predefinedAreas.filter(
        (area) => !activeZones.some((zone) => zone.id === area.id)
      )
    : [];

  const allAreasFc: FeatureCollection | null = isMounted ? {
    type: 'FeatureCollection',
    features: predefinedAreas.map((area) => ({
      id: area.id,
      type: 'Feature',
      properties: {
        name: activeZones.find(z => z.id === area.id)?.name || area.name,
        color: activeZones.find(z => z.id === area.id)?.color || '#888888',
        opacity: activeZones.some(z => z.id === area.id) ? 0.3 : 0.1
      },
      geometry: area.geometry,
    })),
  } : null;

  if (!canEditZones) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle className="text-center">Access Denied</CardTitle></CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You do not have permission to manage zones. Please contact an administrator.
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
        description="Activate and configure predefined geographical areas."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-6">
           <Card>
            <CardHeader>
              <CardTitle>Active Zones</CardTitle>
              <CardDescription>
                These are the zones currently used for dispatching.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeZones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: `${zone.color}80`, borderColor: zone.color }} />
                      <span className="font-medium">{zone.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(zone)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeactivate(zone.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {activeZones.length === 0 && <p className="text-center text-muted-foreground py-4">No active zones.</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Available Areas</CardTitle>
              <CardDescription>
                Predefined areas that can be activated as zones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-3 rounded-lg">
                    <span className="font-medium text-muted-foreground">{area.name}</span>
                    <Button variant="outline" size="sm" onClick={() => handleActivate(area)}><CheckCircle className="mr-2 h-4 w-4" />Activate</Button>
                  </div>
                ))}
                {availableAreas.length === 0 && <p className="text-center text-muted-foreground py-4">All areas are active.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="h-[calc(100vh-14rem)] min-h-[500px] w-full">
             <Map
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                initialViewState={{ longitude: -65.4117, latitude: -24.7859, zoom: 12 }}
                style={{ width: '100%', height: '100%', borderRadius: 'var(--radius)' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                interactiveLayerIds={allAreasFc ? ['zone-fills'] : []}
                onMouseMove={(e) => {
                    if (e.features && e.features.length > 0) {
                        const feature = e.features[0];
                        setHoveredZone({
                            name: feature.properties?.name,
                            lng: e.lngLat.lng,
                            lat: e.lngLat.lat
                        });
                    }
                }}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {allAreasFc && (
                  <Source id="zones" type="geojson" data={allAreasFc}>
                    <Layer id="zone-fills" type="fill" source="zones" paint={{ 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'opacity'] }} />
                    <Layer id="zone-borders" type="line" source="zones" paint={{ 'line-color': ['get', 'color'], 'line-width': 2 }} />
                  </Source>
                )}
                {hoveredZone && (
                  <Popup longitude={hoveredZone.lng} latitude={hoveredZone.lat} offset={24} closeButton={false} className="font-sans">
                    <div className="font-medium">{hoveredZone.name}</div>
                  </Popup>
                )}
             </Map>
           </Card>
        </div>
      </div>
      <EditZoneDialog
        zone={editingZone}
        isOpen={!!editingZone}
        onOpenChange={onDialogChange}
        onSave={handleSave}
      />
    </>
  );
}
