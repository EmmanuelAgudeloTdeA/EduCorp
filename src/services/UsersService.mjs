import { 
  getDocument, 
  updateDocument, 
  getCollection, 
  addDocument, 
  deleteDocument,
  queryCollection 
} from '../api/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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

/**
 * Obtiene un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Datos del usuario
 */
export const getUserById = async (userId) => {
  try {
    return await getDocument('users', userId);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
};

/**
 * Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<string>} ID del usuario creado
 */
export const createUser = async (userData) => {
  let secondaryApp = null;
  
  try {
    // Crear una instancia secundaria de Firebase para no cerrar la sesión del admin
    secondaryApp = initializeApp({
      apiKey: "AIzaSyArj-AUlB8YDDnVXcSgdffDCqn0NKuVBGA",
      authDomain: "educorp-67222.firebaseapp.com",
      projectId: "educorp-67222",
      storageBucket: "educorp-67222.firebasestorage.app",
      messagingSenderId: "957217691651",
      appId: "1:957217691651:web:e8ca9a5d70655477e21636"
    }, 'Secondary');

    const secondaryAuth = getAuth(secondaryApp);

    // Crear usuario en Firebase Auth usando la instancia secundaria
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      userData.email, 
      userData.password
    );

    const user = userCredential.user;

    // Crear documento en Firestore
    const userDoc = {
      email: userData.email,
      displayName: userData.displayName || userData.email.split('@')[0],
      name: userData.name || userData.displayName || '',
      learningStyleId: userData.learningStyleId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addDocument('users', userDoc, user.uid);

    // Asignar rol por defecto (estudiante)
    const roles = await queryCollection('roles', [
      { type: 'where', field: 'name', operator: '==', value: 'student' }
    ]);

    if (roles.length > 0) {
      await addDocument('user_roles', {
        userId: user.uid,
        roleId: roles[0].id,
        assignedAt: new Date().toISOString()
      });
    }

    // Cerrar sesión en la instancia secundaria
    await secondaryAuth.signOut();

    return user.uid;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  } finally {
    // Eliminar la app secundaria si existe
    if (secondaryApp) {
      try {
        await secondaryApp.delete();
      } catch (deleteError) {
        console.error('Error al eliminar app secundaria:', deleteError);
      }
    }
  }
};

/**
 * Actualizar un usuario existente
 * @param {string} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<void>}
 */
export const updateUser = async (userId, userData) => {
  try {
    const updateData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };

    // Remover campos que no se deben actualizar
    delete updateData.password;
    delete updateData.email; // El email no se puede cambiar fácilmente

    await updateDocument('users', userId, updateData);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
};

/**
 * Eliminar un usuario completamente
 * @param {string} userId - ID del usuario
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  try {
    // Eliminar inscripciones del usuario
    const enrollments = await queryCollection('enrollments', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);
    
    for (const enrollment of enrollments) {
      await deleteDocument('enrollments', enrollment.id);
    }

    // Eliminar progreso del usuario
    const progressRecords = await queryCollection('user_progress', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);
    
    for (const progress of progressRecords) {
      await deleteDocument('user_progress', progress.id);
    }

    // Eliminar roles del usuario
    const userRoles = await queryCollection('user_roles', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);
    
    for (const userRole of userRoles) {
      await deleteDocument('user_roles', userRole.id);
    }

    // Finalmente, eliminar el documento del usuario
    await deleteDocument('users', userId);

    // Nota: No eliminamos el usuario de Firebase Auth para evitar problemas de autenticación
    // El usuario ya no podrá acceder porque su documento en Firestore no existe
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    throw error;
  }
};

/**
 * Obtener cursos inscritos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Cursos inscritos
 */
export const getUserEnrollments = async (userId) => {
  try {
    const enrollments = await queryCollection('enrollments', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);

    // Obtener detalles de cada curso
    const coursesPromises = enrollments.map(async (enrollment) => {
      const course = await getDocument('courses', enrollment.courseId);
      return {
        ...enrollment,
        course
      };
    });

    return await Promise.all(coursesPromises);
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    return [];
  }
};

/**
 * Inscribir usuario en un curso
 * @param {string} userId - ID del usuario
 * @param {string} courseId - ID del curso
 * @returns {Promise<string>} ID de la inscripción
 */
export const enrollUserInCourse = async (userId, courseId) => {
  try {
    // Verificar si ya está inscrito
    const existingEnrollments = await queryCollection('enrollments', [
      { type: 'where', field: 'userId', operator: '==', value: userId },
      { type: 'where', field: 'courseId', operator: '==', value: courseId }
    ]);

    if (existingEnrollments.length > 0) {
      throw new Error('El usuario ya está inscrito en este curso');
    }

    const enrollment = {
      userId,
      courseId,
      enrolledAt: new Date().toISOString(),
      status: 'active'
    };

    const enrollmentId = await addDocument('enrollments', enrollment);

    // Crear registro de progreso inicial
    const initialProgress = {
      userId,
      courseId,
      completedLessons: 0,
      totalLessons: 0,
      progressPercentage: 0,
      completedLessonIds: [],
      lastAccessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await addDocument('user_progress', initialProgress);

    return enrollmentId;
  } catch (error) {
    console.error('Error al inscribir usuario:', error);
    throw error;
  }
};

/**
 * Desinscribir usuario de un curso
 * @param {string} userId - ID del usuario
 * @param {string} courseId - ID del curso
 * @returns {Promise<void>}
 */
export const unenrollUserFromCourse = async (userId, courseId) => {
  try {
    const enrollments = await queryCollection('enrollments', [
      { type: 'where', field: 'userId', operator: '==', value: userId },
      { type: 'where', field: 'courseId', operator: '==', value: courseId }
    ]);

    if (enrollments.length === 0) {
      throw new Error('No se encontró la inscripción');
    }

    await deleteDocument('enrollments', enrollments[0].id);
  } catch (error) {
    console.error('Error al desinscribir usuario:', error);
    throw error;
  }
};

