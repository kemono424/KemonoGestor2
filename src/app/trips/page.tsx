
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { recentTrips, type Trip } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EditTripDialog } from '@/components/edit-trip-dialog';

const getStatusVariant = (status: TripStatus) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
    case 'Assigned':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    case 'Scheduled':
      return 'outline'; // A different color for scheduled
    default: // In Tray
      return 'outline';
  }
};

const TripsTable = ({
  trips,
  onEdit,
}: {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Customer</TableHead>
        <TableHead>Origin / Destination</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Time</TableHead>
        <TableHead>
          <span className="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {trips.map(trip => (
        <TableRow key={trip.id}>
          <TableCell>
            <div className="font-medium">{trip.customer.name}</div>
          </TableCell>
          <TableCell>
            <div className="font-medium">{trip.origin}</div>
            <div className="text-sm text-muted-foreground">
              {trip.destination}
            </div>
          </TableCell>
          <TableCell>
            {trip.vehicle
              ? `${trip.vehicle.name} (${trip.vehicle.licensePlate})`
              : 'Unassigned'}
          </TableCell>
          <TableCell>
            <Badge
              variant={getStatusVariant(trip.status)}
              className="capitalize"
            >
              {trip.status.toLowerCase()}
            </Badge>
          </TableCell>
          <TableCell>
            {trip.scheduledTime
              ? format(new Date(trip.scheduledTime), 'MMM d, h:mm a')
              : format(new Date(trip.requestTime), 'MMM d, h:mm a')}
              {trip.scheduledTime && <div className="text-xs text-muted-foreground">(Scheduled)</div>}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(trip)}>
                  Edit Trip
                </DropdownMenuItem>
                {trip.status === 'In Tray' && (
                  <DropdownMenuItem>Assign Manually</DropdownMenuItem>
                )}
                 {trip.status !== 'Completed' && trip.status !== 'Cancelled' && (
                   <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Cancel Trip
                    </DropdownMenuItem>
                   </>
                 )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(recentTrips);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const handleUpdateTrip = (updatedTrip: Trip) => {
    setTrips(currentTrips =>
      currentTrips.map(t => (t.id === updatedTrip.id ? updatedTrip : t))
    );
    setEditingTrip(null);
  };

  const tripsInTray = trips.filter(trip => trip.status === 'In Tray');
  const activeServices = trips.filter(trip => ['Assigned', 'In Progress', 'Scheduled'].includes(trip.status));

  return (
    <>
      <PageHeader
        title="Trip Manager"
        description="Facilitate trip creation and track existing journeys."
      >
        <Button asChild>
          <Link href="/">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Trip
          </Link>
        </Button>
      </PageHeader>
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Services</TabsTrigger>
          <TabsTrigger value="tray">
            In Tray
            {tripsInTray.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {tripsInTray.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <TripsTable trips={activeServices} onEdit={setEditingTrip} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tray">
          <Card>
            <CardContent className="pt-6">
              {tripsInTray.length > 0 ? (
                <TripsTable trips={tripsInTray} onEdit={setEditingTrip} />
              ) : (
                <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-muted">
                  <p className="text-center text-muted-foreground">
                    The assignment tray is empty.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {editingTrip && (
        <EditTripDialog
          trip={editingTrip}
          isOpen={!!editingTrip}
          onOpenChange={() => setEditingTrip(null)}
          onSave={handleUpdateTrip}
        />
      )}
    </>
  );
}
