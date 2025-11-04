import { db } from './config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

// Obtener toda una colección
export const getCollection = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Obtener un documento específico
export const getDocument = async (collectionName, id) => {
  const ref = doc(db, collectionName, id);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Agregar un nuevo documento
export const addDocument = async (collectionName, data, customId = null) => {
  if (customId) {
    // Si se proporciona un ID personalizado, usar setDoc
    const docRef = doc(db, collectionName, customId);
    await setDoc(docRef, data);
    return customId;
  } else {
    // Si no, usar addDoc para generar ID automático
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  }
};

// Actualizar un documento existente
export const updateDocument = async (collectionName, id, data) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, data);
};

// Eliminar un documento
export const deleteDocument = async (collectionName, id) => {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
};

// Consulta con filtros (query)
export const queryCollection = async (collectionName, conditions = []) => {
  const collectionRef = collection(db, collectionName);
  const queryConstraints = conditions.map(condition => {
    if (condition.type === 'where') {
      return where(condition.field, condition.operator, condition.value);
    }
    if (condition.type === 'orderBy') {
      return orderBy(condition.field, condition.direction);
    }
    if (condition.type === 'limit') {
      return limit(condition.value);
    }
    return null;
  }).filter(Boolean);

  const q = query(collectionRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Exportar referencias directas para casos avanzados
export { db, collection, query, where, getDocs };