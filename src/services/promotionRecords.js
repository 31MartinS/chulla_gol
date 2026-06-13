import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, firestoreCollectionName, isFirebaseConfigured } from '../firebase';
import { getPrizeLabel } from '../utils/prize';

const normalizeText = (value, maxLength = 120) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);

const normalizeDigits = (value, maxLength = 10) =>
  String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, maxLength);

export const savePromotionRegistration = async ({ userData, gameResult }) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase no está configurado.');
  }

  const saves = Number(gameResult?.saves ?? 0);
  const total = Number(gameResult?.total ?? 2);
  const premio = getPrizeLabel(saves, total);

  const payload = {
    nombre: normalizeText(userData?.nombre, 80),
    celular: normalizeDigits(userData?.celular, 10),
    cedula: normalizeDigits(userData?.cedula, 10),
    correo: normalizeText(userData?.correo, 120).toLowerCase(),
    aceptaPoliticas: Boolean(userData?.aceptaPoliticas),
    aceptaPromociones: Boolean(userData?.aceptaPromociones),
    saves,
    total,
    esGanador: saves >= total,
    premio,
    createdAt: serverTimestamp(),
    source: 'web-promo',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  return addDoc(collection(db, firestoreCollectionName), payload);
};