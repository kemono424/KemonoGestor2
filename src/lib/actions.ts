'use server';

import type { Operator, Vehicle, Customer, Trip } from '@/types';
import admin from '@/lib/firebase-admin';

export async function addOperator(
  operatorData: Partial<Operator>
): Promise<{ success: boolean; message: string; newId: string }> {
  if (!operatorData.username || !operatorData.password) {
    return {
      success: false,
      message: 'El usuario y la contraseña son obligatorios.',
      newId: '',
    };
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: operatorData.username,
      password: operatorData.password,
      displayName: operatorData.name,
    });

    // TODO: Aquí también guardarías el perfil del operador en Firestore
    console.log('Server Action: Creando usuario en Firebase Auth', userRecord.uid);

    return {
      success: true,
      message: 'Operador creado exitosamente en Firebase Auth.',
      newId: userRecord.uid,
    };
  } catch (error: any) {
    console.error('Error al crear operador en Firebase Auth:', error);
    let message = 'Ocurrió un error al crear el operador.';
    if (error.code === 'auth/email-already-exists') {
      message = 'El correo electrónico ya está en uso por otra cuenta.';
    } else if (error.code === 'auth/invalid-password') {
      message =
        'La contraseña no es válida. Debe tener al menos 6 caracteres.';
    }
    return { success: false, message, newId: '' };
  }
}

export async function deleteOperator(
  operatorId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await admin.auth().deleteUser(operatorId);
    console.log('Server Action: Eliminando usuario de Firebase Auth', operatorId);
    // TODO: Aquí también eliminarías el perfil del operador de Firestore
    return {
      success: true,
      message: 'Operador eliminado de Firebase Auth.',
    };
  } catch (error: any) {
    console.error('Error al eliminar operador de Firebase Auth:', error);
    return {
      success: false,
      message: 'No se pudo eliminar al operador de Firebase Auth.',
    };
  }
}

export async function updateOperator(
  operatorData: Partial<Operator>
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Actualizando operador', operatorData);
  // TODO: Implementar la lógica de actualización en Firestore
  // Ejemplo: const docRef = doc(db, 'operators', operatorData.id); await updateDoc(docRef, operatorData);
  return { success: true, message: 'Operador actualizado (simulado).' };
}

export async function updateCustomer(
  customerData: Partial<Customer>
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Actualizando cliente', customerData);
  // TODO: Implementar la lógica de actualización en Firestore
  return { success: true, message: 'Cliente actualizado (simulado).' };
}

export async function deleteCustomer(
  customerId: string
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Eliminando cliente', customerId);
  // TODO: Implementar la lógica de eliminación en Firestore
  return { success: true, message: 'Cliente eliminado (simulado).' };
}

export async function addVehicle(
  vehicleData: Partial<Vehicle>
): Promise<{ success: boolean; message: string; newId: string }> {
  const newId = `V${Date.now()}`;
  console.log('Server Action: Añadiendo vehículo', { ...vehicleData, id: newId });
  // TODO: Implementar la lógica de creación en Firestore
  return {
    success: true,
    message: 'Vehículo añadido (simulado).',
    newId,
  };
}

export async function updateVehicle(
  vehicleData: Partial<Vehicle>
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Actualizando vehículo', vehicleData);
  // TODO: Implementar la lógica de actualización en Firestore
  return { success: true, message: 'Vehículo actualizado (simulado).' };
}

export async function updateTrip(
  tripData: Partial<Trip>
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Actualizando viaje', tripData);
  // TODO: Implementar la lógica de actualización en Firestore
  return { success: true, message: 'Viaje actualizado (simulado).' };
}
