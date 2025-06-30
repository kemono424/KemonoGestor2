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
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { recentTrips, type Trip } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Assigned':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default: // In Tray
      return 'outline';
  }
};

const AssignVehicleDialog = ({ tripId }: { tripId: string }) => {
  const [searchUnit, setSearchUnit] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAssign = () => {
    if (searchUnit.trim() === '') {
      alert('Please enter a unit number.');
      return;
    }
    alert(`Assigning vehicle with unit #${searchUnit} to trip ${tripId}.`);
    setSearchUnit('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={e => e.preventDefault()}>
          Assign Vehicle
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Vehicle</DialogTitle>
          <DialogDescription>
            Find a vehicle by unit number to assign to this trip.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by unit number..."
              className="pl-10"
              value={searchUnit}
              onChange={e => setSearchUnit(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAssign}>
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TripsTable = ({ trips }: { trips: Trip[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Customer</TableHead>
        <TableHead>Origin / Destination</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Start Time</TableHead>
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
            {trip.status !== 'In Tray'
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
            {format(new Date(trip.startTime), 'MMM d, h:mm a')}
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
                {trip.status === 'In Tray' ? (
                  <AssignVehicleDialog tripId={trip.id} />
                ) : (
                  <>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Track on Map</DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem className="text-destructive">
                  Cancel Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function TripsPage() {
  const tripsInTray = recentTrips.filter(trip => trip.status === 'In Tray');
  const otherTrips = recentTrips.filter(trip => trip.status !== 'In Tray');

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
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Trip History</TabsTrigger>
          <TabsTrigger value="tray">
            Assignment Tray
            {tripsInTray.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {tripsInTray.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardContent className="pt-6">
              <TripsTable trips={otherTrips} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tray">
          <Card>
            <CardContent className="pt-6">
              {tripsInTray.length > 0 ? (
                <TripsTable trips={tripsInTray} />
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
    </>
  );
}
