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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { recentTrips } from '@/lib/mock-data';
import { MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { NewTripSheet } from '@/components/new-trip-sheet';

export default function TripsPage() {
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

  return (
    <>
      <PageHeader
        title="Trip Manager"
        description="Facilitate trip creation and track existing journeys."
      >
        <NewTripSheet />
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
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
              {recentTrips.map(trip => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <div className="font-medium">{trip.customer.name}</div>
                  </TableCell>
                  <TableCell>
                     <div className="font-medium">{trip.origin}</div>
                     <div className="text-sm text-muted-foreground">{trip.destination}</div>
                  </TableCell>
                  <TableCell>{trip.vehicle.name} ({trip.vehicle.licensePlate})</TableCell>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Track on Map</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel Trip</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
