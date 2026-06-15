import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { firestoreCollectionName } from '../firebase';

/**
 * Verifica si una cédula ya está registrada en la base de datos
 * @param {string} cedula - Número de cédula a verificar
 * @returns {Promise<boolean>} - true si existe, false si no
 */
export const isCedulaRegistered = async (cedula) => {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase no configurado, omitiendo validación de cédula');
    return false;
  }

  try {
    const q = query(
      collection(db, firestoreCollectionName),
      where('cedula', '==', cedula),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error verificando cédula:', error);
    // En caso de error, permitimos el registro pero registramos el error
    return false;
  }
};

/**
 * Verifica si un email ya está registrado en la base de datos
 * @param {string} email - Email a verificar
 * @returns {Promise<boolean>} - true si existe, false si no
 */
export const isEmailRegistered = async (email) => {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase no configurado, omitiendo validación de email');
    return false;
  }

  try {
    const q = query(
      collection(db, firestoreCollectionName),
      where('correo', '==', email.toLowerCase()),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error verificando email:', error);
    // En caso de error, permitimos el registro pero registramos el error
    return false;
  }
};

/**
 * Valida ambos campos simultáneamente
 * @param {Object} data - { cedula, correo }
 * @returns {Promise<Object>} - { cedulaExiste, emailExiste }
 */
export const checkExistingUser = async (data) => {
  const [cedulaExists, emailExists] = await Promise.all([
    isCedulaRegistered(data.cedula),
    isEmailRegistered(data.correo)
  ]);
  
  return { cedulaExiste: cedulaExists, emailExiste: emailExists };
};