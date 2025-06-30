// NOTA: Este archivo ahora actúa como una capa de servicio de datos simulada.
// En una aplicación real, las funciones aquí consultarían una base de datos (por ejemplo, Firestore).

import type { Vehicle, Operator, Trip, Customer } from '@/types';

const customers: Customer[] = [];

const operators: Operator[] = [
  {
    id: 'O005',
    name: 'Admin User',
    role: 'Admin',
    username: 'admin',
    password: 'password123',
    shift: 'Admin',
    status: 'Activo',
    servicesToday: 0,
    avgAssignmentTime: 0,
    maxIdleTime: 0,
    activeServices: 0,
    avatarUrl: 'https://placehold.co/128x128.png',
  },
];

const vehicles: Vehicle[] = [];

const recentTrips: Trip[] = [];

// --- DATA SERVICE FUNCTIONS ---
// In a real app, these would fetch from a database.

export async function getCustomers(): Promise<Customer[]> {
  // Simula un retraso de red
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Reemplazar con la consulta a Firestore
  // e.g., const snapshot = await getDocs(collection(db, "customers"));
  // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
  return Promise.resolve(customers);
}

export async function getOperators(): Promise<Operator[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Reemplazar con la consulta a Firestore
  return Promise.resolve(operators);
}

export async function getVehicles(): Promise<Vehicle[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Reemplazar con la consulta a Firestore
  return Promise.resolve(vehicles);
}

export async function getRecentTrips(): Promise<Trip[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // TODO: Reemplazar con la consulta a Firestore
  // Asegúrate de que los objetos anidados (cliente, vehículo) se resuelvan correctamente.
  return Promise.resolve(recentTrips);
}
