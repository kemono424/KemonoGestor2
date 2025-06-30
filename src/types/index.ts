import type { Polygon } from 'geojson';

export type VehicleStatus = 'Libre' | 'En descanso' | 'Ocupado' | 'En camino' | 'En espera' | 'Fuera de servicio';

export interface Vehicle {
  id: string;
  name: string; // e.g. "Taxi 01"
  unitNumber: string; // e.g. "101"
  color: string;
  licensePlate: string;
  model: string;
  operator: string;
  username: string;
  password: string;
  status: VehicleStatus;
  joinDate: string;
  latitude?: number;
  longitude?: number;
}

export type OperatorStatus = 'Activo' | 'De Licencia' | 'Inactivo';
export type UserRole = 'Admin' | 'Supervisor' | 'Operador';

export interface Operator {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
  avatarUrl?: string;
  shift: 'Día' | 'Noche' | 'Admin';
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
    notes?: string;
}

export type TripStatus = 'En Bandeja' | 'Programado' | 'Asignado' | 'En Progreso' | 'Completado' | 'Cancelado';

export interface Trip {
  id: string;
  customer: Customer;
  vehicle: Vehicle | null;
  operator: Operator | null;
  status: TripStatus;
  requestTime: string; // The time the trip was created
  scheduledTime: string | null; // The time the trip is scheduled for, if applicable
  endTime: string | null;
  origin: string;
  destination: string;
  isRecurring?: boolean;
  recurringDays?: number;
  originCoords?: [number, number];
  destinationCoords?: [number, number];
  notes?: string;
  price?: number;
}

export interface GridConfig {
  rows: number;
  cols: number;
  center: { lat: number; lng: number };
  cellWidth: number;
  cellHeight: number;
}

export interface ZoneDefinition {
  id: string;
  name:string;
  color: string;
  cellIds: string[];
}

export interface PricingConfig {
  baseFare: number;
  perKilkilometer: number;
  perStop: number;
}
