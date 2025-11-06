import { 
  getCollection, 
  getDocument, 
  addDocument, 
  updateDocument 
} from '../api/firebase/firestore';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../api/firebase/config';

/**
 * Obtiene todos los estilos de aprendizaje disponibles
 * @returns {Promise<Array>} Array de estilos de aprendizaje
 */
export const getAllLearningStyles = async () => {
  try {
    return await getCollection('learning_styles');
  } catch (error) {
    console.error('Error al obtener estilos de aprendizaje:', error);
    throw error;
  }
};

/**
 * Obtiene un estilo de aprendizaje por ID
 * @param {string} styleId - ID del estilo de aprendizaje
 * @returns {Promise<Object|null>}
 */
export const getLearningStyleById = async (styleId) => {
  try {
    return await getDocument('learning_styles', styleId);
  } catch (error) {
    console.error('Error al obtener estilo de aprendizaje:', error);
    throw error;
  }
};

/**
 * Obtiene el test de estilo de aprendizaje (assessment)
 * @param {string} assessmentType - Tipo de assessment (ej: 'learning_style_test')
 * @returns {Promise<Object|null>}
 */
export const getLearningStyleAssessment = async (assessmentType = 'learning_style_test') => {
  try {
    const assessmentsQuery = query(
      collection(db, 'assessments'),
      where('type', '==', assessmentType),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(assessmentsQuery);
    
    if (snapshot.empty) return null;
    
    const assessment = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    
    // Obtener las preguntas del assessment
    const questionsQuery = query(
      collection(db, 'questions'),
      where('assessmentId', '==', assessment.id)
    );
    const questionsSnapshot = await getDocs(questionsQuery);
    
    const questionsPromises = questionsSnapshot.docs.map(async (doc) => {
      const questionData = { id: doc.id, ...doc.data() };
      
      // Obtener las opciones de cada pregunta
      const choicesQuery = query(
        collection(db, 'choices'),
        where('questionId', '==', doc.id)
      );
      const choicesSnapshot = await getDocs(choicesQuery);
      const choices = choicesSnapshot.docs.map(choiceDoc => ({
        id: choiceDoc.id,
        ...choiceDoc.data()
      }));
      
      // Ordenar las opciones por 'order' o 'position'
      choices.sort((a, b) => (a.order || a.position || 0) - (b.order || b.position || 0));
      
      return { ...questionData, choices };
    });
    
    const questions = await Promise.all(questionsPromises);
    
    // Ordenar las preguntas por 'order' o 'position'
    questions.sort((a, b) => (a.order || a.position || 0) - (b.order || b.position || 0));
    
    return { ...assessment, questions };
  } catch (error) {
    console.error('Error al obtener assessment de estilo de aprendizaje:', error);
    throw error;
  }
};

/**
 * Guarda un intento de assessment
 * @param {Object} attemptData - Datos del intento
 * @returns {Promise<string>} ID del intento creado
 */
export const saveAssessmentAttempt = async (attemptData) => {
  try {
    const attemptId = await addDocument('assessment_attempts', {
      ...attemptData,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });
    return attemptId;
  } catch (error) {
    console.error('Error al guardar intento de assessment:', error);
    throw error;
  }
};

/**
 * Guarda las respuestas de un intento
 * @param {string} attemptId - ID del intento
 * @param {Array} answers - Array de respuestas
 * @returns {Promise<void>}
 */
export const saveAttemptAnswers = async (attemptId, answers) => {
  try {
    const promises = answers.map(answer => 
      addDocument('attempt_answers', {
        attemptId,
        ...answer,
        answeredAt: new Date().toISOString(),
      })
    );
    await Promise.all(promises);
  } catch (error) {
    console.error('Error al guardar respuestas del intento:', error);
    throw error;
  }
};

/**
 * Calcula el estilo de aprendizaje basado en las respuestas
 * @param {Array} answers - Array de respuestas con sus choices
 * @returns {Promise<string>} ID del estilo de aprendizaje calculado
 */
export const calculateLearningStyle = async (answers) => {
  try {
    console.log('📊 Calculando estilo de aprendizaje con respuestas:', answers);
    
    // Contar puntos por estilo de aprendizaje
    const styleScores = {};
    
    answers.forEach((answer, index) => {
      console.log(`Respuesta ${index + 1}:`, answer);
      const styleId = answer.learningStyleId;
      if (styleId) {
        styleScores[styleId] = (styleScores[styleId] || 0) + (answer.points || 1);
        console.log(`  ✓ Sumando ${answer.points || 1} punto(s) a estilo ${styleId}`);
      } else {
        console.warn(`  ⚠️ Respuesta sin learningStyleId:`, answer);
      }
    });
    
    console.log('Puntuaciones por estilo:', styleScores);
    
    // Encontrar el estilo con mayor puntuación
    let maxScore = 0;
    let dominantStyleId = null;
    
    Object.entries(styleScores).forEach(([styleId, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantStyleId = styleId;
      }
    });
    
    console.log(`Estilo dominante: ${dominantStyleId} con ${maxScore} puntos`);
    
    if (!dominantStyleId) {
      throw new Error('No se encontraron respuestas con learningStyleId válido');
    }
    
    return dominantStyleId;
  } catch (error) {
    console.error('Error al calcular estilo de aprendizaje:', error);
    throw error;
  }
};

/**
 * Guarda el estilo de aprendizaje del usuario
 * @param {string} userId - ID del usuario
 * @param {string} styleId - ID del estilo de aprendizaje
 * @param {string} attemptId - ID del intento
 * @returns {Promise<string>} ID del registro creado
 */
export const saveUserLearningStyle = async (userId, styleId, attemptId) => {
  try {
    return await addDocument('user_learning_style', {
      userId,
      learningStyleId: styleId,
      assessmentAttemptId: attemptId,
      assignedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error al guardar estilo de aprendizaje del usuario:', error);
    throw error;
  }
};

