'use client';
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
import { operators } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OperatorsPage() {
  const { role } = useAppContext();

  if (role !== 'Admin') {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">You do not have permission to view this page. Please contact an administrator if you believe this is an error.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Operator Management"
        description="Register, edit, and manage operators."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Operator
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map(operator => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium">{operator.name}</TableCell>
                  <TableCell>{operator.role}</TableCell>
                  <TableCell>{operator.shift}</TableCell>
                  <TableCell>
                    <Badge
                      variant={operator.status === 'Active' ? 'secondary' : 'outline'}
                      className={operator.status === 'Active' ? "text-green-700 border-green-200 bg-green-50" : ""}
                    >
                      {operator.status}
                    </Badge>
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
                        <DropdownMenuItem>View Log</DropdownMenuItem>
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
