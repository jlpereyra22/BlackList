// src/queries/Observados.js
import { normalizarConjunto } from "../lib/normalizar";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);
// ⚠️ EXACTO como está en Firestore (O mayúscula)
const COL = "Observados";

// -- helper: mapear campos a un shape estándar para la UI
function mapDoc(d) {
  const data = d.data() || {};
  // soportar snake_case y camelCase
  const createdAt = data.created_at ?? data.createdAt ?? null;
  const updatedAt = data.updated_at ?? data.updatedAt ?? null;
  const owner = data.owner_uid ?? data.owner ?? null;

  return {
    id: d.id,
    persona: data.persona ?? "",
    oficina: data.oficina ?? "",
    socios: data.socios ?? "",
    observaciones: data.observaciones ?? "",
    fecha: data.fecha ?? null,
    createdAt,
    updatedAt,
    owner,
    // por si tu normalizador espera el objeto entero
    ...data,
  };
}

// ===== Lectura puntual (vista pública u otros usos) =====
export async function getAll() {
  // primero intentamos ordenar por created_at (como está en tu DB);
  // si falla (p.ej. índice de campo único), hacemos fallback sin orden
  try {
    const qRef = query(collection(db, COL), orderBy("created_at", "desc"));
    const snap = await getDocs(qRef);
    const items = snap.docs.map(mapDoc);
    return normalizarConjunto(items);
  } catch (_e) {
    const snap = await getDocs(collection(db, COL));
    const items = snap.docs.map(mapDoc);
    items.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    );
    return normalizarConjunto(items);
  }
}

// ===== Tiempo real (todos) para la vista pública =====
// ===== Tiempo real (todos) para la vista pública =====
export function subscribeAll(cb) {
  const qRef = query(collection(db, COL), orderBy("created_at", "desc"));

  let unsub = onSnapshot(
    qRef,
    (snap) => {
      const items = snap.docs.map(mapDoc);
      cb(items); // ← sin normalizar
    },
    (_err) => {
      // fallback simple: sin orderBy y ordenamos en memoria
      unsub?.();
      unsub = onSnapshot(collection(db, COL), (snap2) => {
        const items = snap2.docs.map(mapDoc);
        items.sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) -
            (a.createdAt?.toMillis?.() ?? 0)
        );
        cb(items); // ← sin normalizar
      });
    }
  );
  return () => unsub && unsub();
}


// ===== Tiempo real (solo del owner) para /admin =====
// IMPORTANTE: en /admin devolvemos items crudos (sin normalizador) para evitar errores
export function subscribeMine(ownerUid, cb) {
  const qIndexed = query(
    collection(db, COL),
    where("owner_uid", "==", ownerUid),
    orderBy("created_at", "desc")
  );
  const qFallback = query(
    collection(db, COL),
    where("owner_uid", "==", ownerUid)
  );

  // Intento con índice compuesto; si falla, paso a fallback
  let activeUnsub = onSnapshot(
    qIndexed,
    (snap) => {
      const items = snap.docs.map(mapDoc);
      cb(items); // ← sin normalizar, ya ordenados
    },
    (err) => {
      if (err?.code === "failed-precondition") {
        // índice aún no disponible → fallback sin orderBy
        activeUnsub?.();
        activeUnsub = onSnapshot(qFallback, (snap2) => {
          const items = snap2.docs.map(mapDoc);
          items.sort(
            (a, b) =>
              (b.createdAt?.toMillis?.() ?? 0) -
              (a.createdAt?.toMillis?.() ?? 0)
          );
          cb(items); // ← sin normalizar
        });
      } else {
        console.error("subscribeMine error:", err);
      }
    }
  );

  return () => {
    if (activeUnsub) activeUnsub();
  };
}

// ===== Escritura (consistente con tu DB actual: snake_case) =====
export async function create(item, { owner } = {}) {
  const payload = {
    persona: item.persona ?? "",
    oficina: item.oficina ?? "",
    socios: item.socios ?? "",
    observaciones: item.observaciones ?? "",
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
