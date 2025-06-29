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
import { vehicles } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';

export default function VehiclesPage() {
  return (
    <>
      <PageHeader
        title="Vehicle Manager"
        description="Register, track, and manage all vehicles in your fleet."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map(vehicle => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.operator}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.status === 'Online'
                          ? 'secondary'
                          : vehicle.status === 'Maintenance'
                          ? 'destructive'
                          : 'outline'
                      }
                      className={vehicle.status === 'Online' ? 'text-green-700 border-green-200 bg-green-50' : ''}
                    >
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(vehicle.lastMaintenance), 'MMM d, yyyy')}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View on Map</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
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
