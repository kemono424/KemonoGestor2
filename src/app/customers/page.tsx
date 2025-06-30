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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { customers, recentTrips } from '@/lib/mock-data';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EditCustomerDialog } from '@/components/edit-customer-dialog';
import { CustomerHistoryDialog } from '@/components/customer-history-dialog';
import type { Customer } from '@/types';

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState<Customer[]>(customers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleViewHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsHistoryOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    const customerIndex = customers.findIndex(
      (c) => c.id === updatedCustomer.id
    );
    if (customerIndex !== -1) {
      customers[customerIndex] = updatedCustomer;
    }
    recentTrips.forEach((trip) => {
      if (trip.customer && trip.customer.id === updatedCustomer.id) {
        trip.customer = updatedCustomer;
      }
    });
    setCustomersData((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    setIsEditOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <>
      <PageHeader
        title="Customer Management"
        description="View and manage customer information."
      >
        <div className="flex items-center space-x-2">
          <Input placeholder="Filter by name or ID..." className="w-64" />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customersData.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        customer.pendingDebt > 0 ? 'destructive' : 'secondary'
                      }
                    >
                      ${customer.pendingDebt.toFixed(2)}
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
                        <DropdownMenuItem
                          onClick={() => handleViewHistory(customer)}
                        >
                          View Trip History
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditCustomer(customer)}
                        >
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Customer
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

      <CustomerHistoryDialog
        customer={selectedCustomer}
        isOpen={isHistoryOpen}
        onOpenChange={(open) => {
          setIsHistoryOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
      />
      <EditCustomerDialog
        customer={selectedCustomer}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
    </>
  );
}
