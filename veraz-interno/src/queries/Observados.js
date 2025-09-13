// src/queries/Observados.js
import { normalizarConjunto } from '../lib/normalizar';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { app } from '../firebase';

const db = getFirestore(app);
// ⚠️ EXACTO como está en Firestore (O mayúscula)
const COL = 'Observados';

// -- helpers: mapear campos a un shape estándar para la UI
function mapDoc(d) {
  const data = d.data() || {};
  // soportar snake_case y camelCase
  const createdAt = data.created_at ?? data.createdAt ?? null;
  const updatedAt = data.updated_at ?? data.updatedAt ?? null;
  const owner     = data.owner_uid  ?? data.owner     ?? null;

  return {
    id: d.id,
    persona: data.persona ?? '',
    oficina: data.oficina ?? '',
    socios: data.socios ?? '',
    observaciones: data.observaciones ?? '',
    fecha: data.fecha ?? null,
    createdAt,
    updatedAt,
    owner,
    // por si tu normalizador espera el objeto entero
    ...data,
  };
}

// ===== Lectura =====
export async function getAll() {
  // primero intentamos ordenar por created_at (como está en tu DB),
  // si falla (p.ej. índice), hacemos fallback sin orden
  try {
    const q = query(collection(db, COL), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    const items = snap.docs.map(mapDoc);
    return normalizarConjunto(items);
  } catch (e) {
    const snap = await getDocs(collection(db, COL));
    const items = snap.docs.map(mapDoc);
    // ordenar en memoria por si no pudimos con Firestore
    items.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
    return normalizarConjunto(items);
  }
}

// Tiempo real (opcional)
export function subscribeAll(cb) {
  // si querés orden server-side, asegurate de tener el campo created_at y el índice
  const qRef = query(collection(db, COL), orderBy('created_at', 'desc'));
  return onSnapshot(qRef, (snap) => {
    const items = snap.docs.map(mapDoc);
    cb(normalizarConjunto(items));
  }, (err) => {
    // fallback sin orden si la suscripción falla por índice
    const unsub = onSnapshot(collection(db, COL), (snap2) => {
      const items = snap2.docs.map(mapDoc).sort(
        (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
      );
      cb(normalizarConjunto(items));
    });
    return () => unsub();
  });
}

// ===== Escritura (consistente con tu DB actual: snake_case) =====
export async function create(item, { owner } = {}) {
  const payload = {
    persona: item.persona ?? '',
    oficina: item.oficina ?? '',
    socios: item.socios ?? '',
    observaciones: item.observaciones ?? '',
    fecha: item.fecha ?? null,
    owner_uid: owner ?? null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return { id: ref.id, ...payload };
}

export async function update(id, patch = {}) {
  const ref = doc(db, COL, id);
  const toSet = {
    ...(patch.persona !== undefined ? { persona: patch.persona } : {}),
    ...(patch.oficina !== undefined ? { oficina: patch.oficina } : {}),
    ...(patch.socios !== undefined ? { socios: patch.socios } : {}),
    ...(patch.observaciones !== undefined ? { observaciones: patch.observaciones } : {}),
    ...(patch.fecha !== undefined ? { fecha: patch.fecha } : {}),
    updated_at: serverTimestamp(),
  };
  await updateDoc(ref, toSet);
  return true;
}

export async function remove(id) {
  const ref = doc(db, COL, id);
  await deleteDoc(ref);
  return true;
}

// Alias opcional por compatibilidad con código viejo
export { getAll as obtenerObservados };
