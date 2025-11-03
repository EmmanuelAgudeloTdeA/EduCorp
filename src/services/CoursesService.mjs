import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument,
  queryCollection 
} from '../api/firebase/firestore.js';

/**
 * Obtener todos los cursos activos
 */
export const getAllCourses = async () => {
  try {
    const courses = await queryCollection('courses', [
      { type: 'where', field: 'isActive', operator: '==', value: true },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' }
    ]);
    return courses;
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    return [];
  }
};

/**
 * Obtener un curso específico por ID
 */
export const getCourseById = async (courseId) => {
  try {
    return await getDocument('courses', courseId);
  } catch (error) {
    console.error('Error obteniendo curso:', error);
    return null;
  }
};

/**
 * Obtener cursos en los que está inscrito un usuario
 */
export const getUserEnrollments = async (userId) => {
  try {
    const enrollments = await queryCollection('enrollments', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);

    // Obtener detalles de cada curso
    const coursesPromises = enrollments.map(async (enrollment) => {
      const course = await getCourseById(enrollment.courseId);
      return {
        ...enrollment,
        course
      };
    });

    return await Promise.all(coursesPromises);
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    return [];
  }
};

/**
 * Obtener el progreso del usuario en sus cursos
 */
export const getUserProgress = async (userId) => {
  try {
    const progress = await queryCollection('user_progress', [
      { type: 'where', field: 'userId', operator: '==', value: userId }
    ]);

    // Obtener detalles de cada curso
    const progressWithCourses = await Promise.all(
      progress.map(async (prog) => {
        const course = await getCourseById(prog.courseId);
        return {
          ...prog,
          course
        };
      })
    );

    return progressWithCourses;
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
    return [];
  }
};

/**
 * Obtener cursos en progreso (con progreso > 0 y < 100)
 */
export const getUserCoursesInProgress = async (userId) => {
  try {
    const allProgress = await getUserProgress(userId);
    return allProgress.filter(
      (prog) => prog.progressPercentage > 0 && prog.progressPercentage < 100
    );
  } catch (error) {
    console.error('Error obteniendo cursos en progreso:', error);
    return [];
  }
};

/**
 * Obtener cursos completados (progreso = 100)
 */
export const getUserCompletedCourses = async (userId) => {
  try {
    const allProgress = await getUserProgress(userId);
    return allProgress.filter((prog) => prog.progressPercentage === 100);
  } catch (error) {
    console.error('Error obteniendo cursos completados:', error);
    return [];
  }
};

/**
 * Obtener cursos pendientes (inscritos pero sin progreso)
 */
export const getUserPendingCourses = async (userId) => {
  try {
    const enrollments = await getUserEnrollments(userId);
    const progress = await getUserProgress(userId);

    // Encontrar cursos inscritos sin progreso
    const pendingCourses = enrollments.filter(
      (enrollment) =>
        !progress.some((prog) => prog.courseId === enrollment.courseId)
    );

    return pendingCourses;
  } catch (error) {
    console.error('Error obteniendo cursos pendientes:', error);
    return [];
  }
};

/**
 * Obtener estadísticas generales del usuario
 */
export const getUserStatistics = async (userId) => {
  try {
    const enrollments = await getUserEnrollments(userId);
    const progress = await getUserProgress(userId);
    const completed = progress.filter((prog) => prog.progressPercentage === 100);
    const inProgress = progress.filter(
      (prog) => prog.progressPercentage > 0 && prog.progressPercentage < 100
    );
    const pending = enrollments.filter(
      (enrollment) =>
        !progress.some((prog) => prog.courseId === enrollment.courseId)
    );

    return {
      totalCursos: enrollments.length,
      cursosCompletados: completed.length,
      cursosEnProgreso: inProgress.length,
      cursosPendientes: pending.length
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      totalCursos: 0,
      cursosCompletados: 0,
      cursosEnProgreso: 0,
      cursosPendientes: 0
    };
  }
};

/**
 * Inscribir a un usuario en un curso
 */
export const enrollUserInCourse = async (userId, courseId) => {
  try {
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
      lastAccessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    await addDocument('user_progress', initialProgress);

    return enrollmentId;
  } catch (error) {
    console.error('Error inscribiendo usuario:', error);
    throw error;
  }
};

/**
 * Actualizar el progreso de un usuario en un curso
 */
export const updateUserProgress = async (userId, courseId, progressData) => {
  try {
    // Buscar el progreso existente
    const progressRecords = await queryCollection('user_progress', [
      { type: 'where', field: 'userId', operator: '==', value: userId },
      { type: 'where', field: 'courseId', operator: '==', value: courseId }
    ]);

    if (progressRecords.length === 0) {
      throw new Error('No se encontró registro de progreso');
    }

    const progressId = progressRecords[0].id;

    // Calcular porcentaje de progreso
    const progressPercentage = progressData.totalLessons > 0
      ? Math.round((progressData.completedLessons / progressData.totalLessons) * 100)
      : 0;

    await updateDocument('user_progress', progressId, {
      ...progressData,
      progressPercentage,
      lastAccessedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error actualizando progreso:', error);
    throw error;
  }
};

