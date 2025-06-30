import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Users, Activity, DollarSign } from 'lucide-react';
import { vehicles, operators, recentTrips, zones } from '@/lib/mock-data';
import VehicleMap from '@/components/vehicle-map';
import { NewTripForm } from '@/components/new-trip-form';

export default function DashboardPage() {
  const onlineVehicles = vehicles.filter(v => v.status === 'Available').length;
  const activeTrips = recentTrips.filter(t => t.status === 'In Progress').length;
  const totalRevenue = recentTrips
    .filter(t => t.status === 'Completed')
    .reduce((sum, trip) => sum + 25, 0); // Mock revenue
  const availableOperators = operators.filter(o => o.status === 'Active').length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles Available</CardTitle>
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
            <div className="text-2xl font-bold">+{availableOperators}</div>
            <p className="text-xs text-muted-foreground">ready for assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">based on completed trips</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create a New Trip</CardTitle>
            <CardDescription>
              The system can auto-assign the nearest vehicle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewTripForm />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Vehicle Locations</CardTitle>
            <CardDescription>Real-time tracking of all available vehicles.</CardDescription>
          </CardHeader>
          <CardContent className="h-[480px] w-full p-0">
             <VehicleMap vehicles={vehicles} zones={zones} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
