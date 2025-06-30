
import type { Vehicle, Operator, Trip, Customer, Zone, PredefinedArea } from '@/types';
import type { Polygon } from 'geojson';

export const customers: Customer[] = [
    { id: 'C001', name: 'Alice Williams', phone: '555-0101', pendingDebt: 0 },
    { id: 'C002', name: 'Bob Brown', phone: '555-0102', pendingDebt: 25.50 },
    { id: 'C003', name: 'Charlie Davis', phone: '555-0103', pendingDebt: 0 },
    { id: 'C004', name: 'Diana Miller', phone: '555-0104', pendingDebt: 0 },
    { id: 'C005', name: 'Ethan Wilson', phone: '555-0105', pendingDebt: 15.00 },
    { id: 'C006', name: 'Fiona Garcia', phone: '555-0106', pendingDebt: 0 },
];

export const operators: Operator[] = [
  {
    id: 'O001',
    name: 'John Doe',
    role: 'Dispatcher',
    shift: 'Day',
    status: 'Active',
    servicesToday: 15,
    avgAssignmentTime: 5,
    maxIdleTime: 20,
    activeServices: 3,
  },
  {
    id: 'O002',
    name: 'Jane Smith',
    role: 'Dispatcher',
    shift: 'Night',
    status: 'Active',
    servicesToday: 12,
    avgAssignmentTime: 7,
    maxIdleTime: 15,
    activeServices: 2,
  },
  {
    id: 'O003',
    name: 'Mike Johnson',
    role: 'Dispatcher',
    shift: 'Day',
    status: 'On Leave',
    servicesToday: 0,
    avgAssignmentTime: 0,
    maxIdleTime: 0,
    activeServices: 0,
  },
  {
    id: 'O004',
    name: 'Emily White',
    role: 'Supervisor',
    shift: 'Day',
    status: 'Active',
    servicesToday: 0,
    avgAssignmentTime: 0,
    maxIdleTime: 0,
    activeServices: 0,
  },
  {
    id: 'O005',
    name: 'Admin User',
    role: 'Admin',
    shift: 'Admin',
    status: 'Active',
    servicesToday: 0,
    avgAssignmentTime: 0,
    maxIdleTime: 0,
    activeServices: 0,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: 'V001',
    name: 'Red Fury',
    unitNumber: '101',
    color: 'Red',
    licensePlate: 'UB-01-A4',
    model: 'Toyota Prius',
    operator: 'John Doe',
    status: 'Available',
    lastMaintenance: '2024-05-10',
    insuranceDueDate: '2025-01-15',
    latitude: -24.791, // Inside Center zone
    longitude: -65.412,
  },
  {
    id: 'V002',
    name: 'Night Rider',
    unitNumber: '102',
    color: 'Black',
    licensePlate: 'AB-CD-12',
    model: 'Honda Civic',
    operator: 'Jane Smith',
    status: 'Busy',
    lastMaintenance: '2024-06-01',
    insuranceDueDate: '2025-03-20',
    latitude: -24.780, // Inside North zone
    longitude: -65.411,
  },
  {
    id: 'V003',
    name: 'The Ghost',
    unitNumber: '103',
    color: 'White',
    licensePlate: 'XY-123-Z',
    model: 'Ford Transit',
    operator: 'Mike Johnson',
    status: 'Out of Service',
    lastMaintenance: '2024-04-22',
    insuranceDueDate: '2024-11-30',
  },
  {
    id: 'V004',
    name: 'Crimson Bolt',
    unitNumber: '201',
    color: 'Red',
    licensePlate: 'GH-45-KL',
    model: 'Tesla Model 3',
    operator: 'Emily White',
    status: 'Maintenance',
    lastMaintenance: '2024-07-15',
    insuranceDueDate: '2024-09-01',
  },
  {
    id: 'V005',
    name: 'Black Pearl',
    unitNumber: '202',
    color: 'Black',
    licensePlate: 'MN-67-OP',
    model: 'Toyota Camry',
    operator: 'Chris Green',
    status: 'Available',
    lastMaintenance: '2024-07-01',
    insuranceDueDate: '2025-02-28',
    latitude: -24.796, // Inside South zone
    longitude: -65.425,
  },
];

export const recentTrips: Trip[] = [
  {
    id: 'T001',
    customer: customers[0],
    vehicle: vehicles[0],
    operator: operators[0],
    status: 'Completed',
    startTime: '2024-07-20T09:00:00Z',
    endTime: '2024-07-20T09:25:00Z',
    origin: '123 Main St',
    destination: '456 Oak Ave',
  },
  {
    id: 'T002',
    customer: customers[1],
    vehicle: vehicles[1],
    operator: operators[1],
    status: 'In Progress',
    startTime: '2024-07-20T10:15:00Z',
    endTime: null,
    origin: '789 Pine Ln',
    destination: '101 Maple Dr',
  },
  {
    id: 'T003',
    customer: customers[2],
    vehicle: vehicles[4],
    operator: operators[0],
    status: 'Assigned',
    startTime: '2024-07-20T11:00:00Z',
    endTime: null,
    origin: '212 Birch Rd',
    destination: '333 Cedar Blvd',
  },
    {
    id: 'T004',
    customer: customers[3],
    vehicle: vehicles[0],
    operator: operators[0],
    status: 'Completed',
    startTime: '2024-07-20T11:30:00Z',
    endTime: '2024-07-20T11:50:00Z',
    origin: '555 Elm St',
    destination: '666 Willow Way',
  },
  {
    id: 'T005',
    customer: customers[4],
    vehicle: vehicles[1],
    operator: operators[1],
    status: 'In Progress',
    startTime: '2024-07-20T12:05:00Z',
    endTime: null,
    origin: '777 Spruce Ave',
    destination: '888 Poplar Ct',
  },
  {
    id: 'T006',
    customer: customers[5],
    vehicle: vehicles[4],
    operator: operators[0],
    status: 'Cancelled',
    startTime: '2024-07-20T13:00:00Z',
    endTime: null,
    origin: '999 Aspen Dr',
    destination: '111 Redwood Pkwy',
  },
  {
    id: 'T007',
    customer: customers[0],
    vehicle: vehicles[0],
    operator: operators[0],
    status: 'In Tray',
    startTime: '2024-07-21T14:00:00Z',
    endTime: null,
    origin: '1 Market St',
    destination: '200 Embarcadero',
  }
];


// Predefined geographical areas that can be activated as zones.
export const predefinedAreas: PredefinedArea[] = [
  {
    id: 'area-center',
    name: 'Center',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-65.420, -24.785],
          [-65.400, -24.785],
          [-65.400, -24.800],
          [-65.420, -24.800],
          [-65.420, -24.785]
        ]
      ]
    }
  },
  {
    id: 'area-north',
    name: 'North District',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-65.420, -24.770],
          [-65.400, -24.770],
          [-65.400, -24.785],
          [-65.420, -24.785],
          [-65.420, -24.770]
        ]
      ]
    }
  },
  {
    id: 'area-south',
    name: 'South District',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [-65.435, -24.800],
          [-65.415, -24.800],
          [-65.415, -24.815],
          [-65.435, -24.815],
          [-65.435, -24.800]
        ]
      ]
    }
  }
];
