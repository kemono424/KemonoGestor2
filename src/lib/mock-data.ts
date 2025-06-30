'use server';

// NOTA: Este archivo ahora actúa como una capa de servicio de datos simulada.
// En una aplicación real, las funciones aquí consultarían una base de datos (por ejemplo, Firestore).

import type { Vehicle, Operator, Trip, Customer, UserRole } from '@/types';
import admin from '@/lib/firebase-admin';

// These arrays are now empty and will be filled from a database in a real scenario
const customers: Customer[] = [];
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
  
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const operators: Operator[] = listUsersResult.users.map(userRecord => {
      // Usamos el rol de los custom claims como fuente de verdad.
      // Si un usuario fue creado manualmente en la consola, no tendrá un rol.
      // Le asignamos 'Operador' por defecto.
      let role: UserRole = (userRecord.customClaims?.role as UserRole) || 'Operador';

      // Para el caso especial del admin, si su email empieza con 'admin@', 
      // lo forzamos a ser Admin para facilitar la configuración inicial.
      if (userRecord.email?.startsWith('admin')) {
        role = 'Admin';
      }

      return {
        id: userRecord.uid,
        name: userRecord.displayName || userRecord.email || 'Sin Nombre',
        role: role,
        username: userRecord.email!,
        avatarUrl: userRecord.photoURL,
        // --- Provide sensible defaults for data not stored in Auth ---
        shift: role === 'Admin' ? 'Admin' : 'Día',
        status: 'Activo',
        servicesToday: 0,
        avgAssignmentTime: 0,
        maxIdleTime: 0,
        activeServices: 0,
      };
    });
    return operators;
  } catch (error) {
    console.error("Error al obtener operadores desde Firebase Auth:", error);
    return []; // Devolver un array vacío en caso de error para prevenir fallos.
  }
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
