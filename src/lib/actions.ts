'use server';

import type { Operator, Vehicle, Customer, Trip } from '@/types';
import admin from '@/lib/firebase-admin';

export async function addOperator(
  operatorData: Partial<Operator>
): Promise<{ success: boolean; message: string; newId?: string }> {
  if (!operatorData.name || !operatorData.username || !operatorData.password) {
    return {
      success: false,
      message: 'El nombre, usuario y la contraseña son obligatorios.',
    };
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: operatorData.username,
      password: operatorData.password,
      displayName: operatorData.name,
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Operador' });

    console.log('Server Action: Creando usuario en Firebase Auth', userRecord.uid);
    // TODO: Crear perfil del operador en Firestore con el UID como ID del documento.

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
    return { success: false, message };
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
): Promise<{ success: boolean; message: string; newId?: string }> {
  if (!vehicleData.username || !vehicleData.password) {
    return { success: false, message: 'El usuario y la contraseña son obligatorios.' };
  }
  
  const newId = `veh-${Date.now()}`;
  try {
    const userRecord = await admin.auth().createUser({
      email: vehicleData.username,
      password: vehicleData.password,
      displayName: vehicleData.name,
    });
    
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Vehicle', vehicleId: newId });
    
    console.log(`Server Action: Vehículo ${newId} y usuario de Auth ${userRecord.uid} creados.`);
    // TODO: Crear documento del vehículo en Firestore con el ID `newId`.
    
    return { success: true, message: 'Vehículo creado exitosamente.', newId };
  } catch (error: any) {
    console.error('Error creando vehículo/usuario en Auth:', error);
    let message = 'Ocurrió un error al crear el vehículo.';
    if (error.code === 'auth/email-already-exists') {
      message = 'El correo electrónico del vehículo ya está en uso.';
    }
    return { success: false, message };
  }
}

export async function updateVehicle(
  vehicleData: Partial<Vehicle>
): Promise<{ success: boolean; message: string }> {
  if (!vehicleData.id || !vehicleData.username) {
    return { success: false, message: 'Falta el ID del vehículo o el nombre de usuario.' };
  }
  
  try {
    // Si la contraseña se está actualizando, cámbiala en Firebase Auth.
    if (vehicleData.password) {
      const user = await admin.auth().getUserByEmail(vehicleData.username);
      await admin.auth().updateUser(user.uid, { password: vehicleData.password });
    }
    
    console.log('Server Action: Actualizando vehículo', vehicleData.id);
    // TODO: Actualizar el documento del vehículo en Firestore.
    
    return { success: true, message: 'Vehículo actualizado.' };
  } catch (error: any) {
    console.error('Error actualizando vehículo:', error);
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'El usuario asociado a este vehículo no se encontró en Firebase. No se pudo actualizar la contraseña.' };
    }
    return { success: false, message: 'Error al actualizar el vehículo.' };
  }
}

export async function deleteVehicle(
  vehicleId: string,
  username: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Busca al usuario por su email y lo elimina.
    const user = await admin.auth().getUserByEmail(username);
    await admin.auth().deleteUser(user.uid);
    
    console.log(`Server Action: Vehículo ${vehicleId} y usuario de Auth ${user.uid} eliminados.`);
    // TODO: Eliminar el documento del vehículo de Firestore.
    
    return { success: true, message: 'Vehículo y su cuenta eliminados.' };
  } catch (error: any) {
    console.error('Error eliminando vehículo:', error);
    if (error.code === 'auth/user-not-found') {
      // Si el usuario de Auth no existe, puede que solo necesitemos borrar el de Firestore.
      console.warn(`Usuario de Auth para ${username} no encontrado. Procediendo a eliminar solo el vehículo.`);
      // TODO: Eliminar el documento del vehículo de Firestore.
      return { success: true, message: 'Usuario de Auth no encontrado, se eliminó solo el registro del vehículo.' };
    }
    return { success: false, message: 'Error al eliminar el vehículo.' };
  }
}

export async function updateTrip(
  tripData: Partial<Trip>
): Promise<{ success: boolean; message: string }> {
  console.log('Server Action: Actualizando viaje', tripData);
  // TODO: Implementar la lógica de actualización en Firestore
  return { success: true, message: 'Viaje actualizado (simulado).' };
}
