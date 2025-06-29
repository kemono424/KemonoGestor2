import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Car, Users, Activity } from 'lucide-react';
import { recentTrips, vehicles } from '@/lib/mock-data';
import VehicleMap from '@/components/vehicle-map';

export default function DashboardPage() {
  const onlineVehicles = vehicles.filter(v => v.status === 'Online').length;
  const activeTrips = recentTrips.filter(t => t.status === 'In Progress').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Online</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineVehicles}</div>
            <p className="text-xs text-muted-foreground">out of {vehicles.length} total vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeTrips}</div>
            <p className="text-xs text-muted-foreground">currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Operators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">ready for assignment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Trip Activity</CardTitle>
            <CardDescription>An overview of the latest trips.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrips.slice(0, 5).map(trip => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="font-medium">{trip.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{trip.destination}</div>
                    </TableCell>
                    <TableCell>{trip.vehicle.model}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          trip.status === 'Completed'
                            ? 'default'
                            : trip.status === 'In Progress'
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="capitalize"
                      >
                        {trip.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Live Vehicle Locations</CardTitle>
            <CardDescription>Real-time tracking of all online vehicles.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 w-full p-0">
             <VehicleMap vehicles={vehicles} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
