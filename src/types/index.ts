export type VehicleStatus = 'Online' | 'Offline' | 'Maintenance';

export interface Vehicle {
  id: string;
  licensePlate: string;
  model: string;
  operator: string;
  status: VehicleStatus;
  lastMaintenance: string;
}

export type OperatorStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Operator {
  id: string;
  name: string;
  role: string;
  shift: 'Day' | 'Night' | 'Admin';
  status: OperatorStatus;
}

export type TripStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Trip {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  vehicle: Vehicle;
  operator: Operator;
  status: TripStatus;
  startTime: string;
  endTime: string | null;
  origin: string;
  destination: string;
}

export type UserRole = 'Admin' | 'Dispatcher';
