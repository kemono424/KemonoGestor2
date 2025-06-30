
import type { Polygon } from 'geojson';

export type VehicleStatus = 'Available' | 'Busy' | 'Maintenance' | 'Out of Service';

export interface Vehicle {
  id: string;
  name: string; // e.g. "Taxi 01"
  unitNumber: string; // e.g. "101"
  color: string;
  licensePlate: string;
  model: string;
  operator: string;
  status: VehicleStatus;
  lastMaintenance: string;
  insuranceDueDate?: string;
  latitude?: number;
  longitude?: number;
}

export type OperatorStatus = 'Active' | 'On Leave' | 'Inactive';
export type UserRole = 'Admin' | 'Supervisor' | 'Dispatcher';

export interface Operator {
  id: string;
  name: string;
  role: UserRole;
  shift: 'Day' | 'Night' | 'Admin';
  status: OperatorStatus;
  // stats
  servicesToday: number;
  avgAssignmentTime: number; // in minutes
  maxIdleTime: number; // in minutes
  activeServices: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    pendingDebt: number; // in currency
}

export type TripStatus = 'In Tray' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  customer: Customer;
  vehicle: Vehicle;
  operator: Operator;
  status: TripStatus;
  startTime: string;
  endTime: string | null;
  origin: string;
  destination: string;
}

export interface GridConfig {
  rows: number;
  cols: number;
  center: { lat: number; lng: number };
  cellSize: number;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  color: string;
  cellIds: string[];
}
