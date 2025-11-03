import { getDocument, updateDocument, getCollection } from '../api/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase/config';

/**
 * Obtiene los roles de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Array de roles
 */
export const getUserRoles = async (userId) => {
  try {
    const userRolesQuery = query(
      collection(db, 'user_roles'),
      where('userId', '==', userId)
    );
    const userRolesSnapshot = await getDocs(userRolesQuery);
    
    const rolesPromises = userRolesSnapshot.docs.map(async (doc) => {
      const userRoleData = doc.data();
      const roleDoc = await getDocument('roles', userRoleData.roleId);
      return roleDoc;
    });
    
    const roles = await Promise.all(rolesPromises);
    return roles.filter(role => role !== null);
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    throw error;
  }
};

/**
 * Verifica si un usuario tiene un rol específico
 * @param {string} userId - ID del usuario
 * @param {string} roleName - Nombre del rol
 * @returns {Promise<boolean>}
 */
export const userHasRole = async (userId, roleName) => {
  try {
    const roles = await getUserRoles(userId);
    return roles.some(role => role.name === roleName);
  } catch (error) {
    console.error('Error al verificar rol del usuario:', error);
    return false;
  }
};

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>} Array de usuarios
 */
export const getAllUsers = async () => {
  try {
    return await getCollection('users');
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

/**
 * Actualiza el estilo de aprendizaje de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} learningStyleId - ID del estilo de aprendizaje
 * @returns {Promise<void>}
 */
export const updateUserLearningStyle = async (userId, learningStyleId) => {
  try {
    await updateDocument('users', userId, {
      learningStyleId,
      learningStyleAssignedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al actualizar estilo de aprendizaje:', error);
    throw error;
  }
};

