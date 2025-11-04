import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getLearningStyleAssessment,
  saveAssessmentAttempt,
  saveAttemptAnswers,
  calculateLearningStyle,
  saveUserLearningStyle,
  getLearningStyleById
} from '../services/LearningStylesService.mjs';
import { updateUserLearningStyle } from '../services/UsersService.mjs';
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const LearningStyleTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [learningStyleResult, setLearningStyleResult] = useState(null);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const data = await getLearningStyleAssessment();
      
      if (!data || !data.questions || data.questions.length === 0) {
        setError('No se encontró el test de estilo de aprendizaje. Contacta al administrador.');
        setLoading(false);
        return;
      }
      
      setAssessment(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar el assessment:', error);
      setError('Error al cargar el test. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, choiceId, choice) => {
    setAnswers({
      ...answers,
      [questionId]: {
        questionId,
        choiceId,
        learningStyleId: choice.learningStyleId,
        points: choice.points || 1,
      }
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Verificar que todas las preguntas estén respondidas
    const unansweredQuestions = assessment.questions.filter(
      q => !answers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      alert(`Por favor responde todas las preguntas. Faltan ${unansweredQuestions.length} pregunta(s).`);
      return;
    }

    try {
      setSubmitting(true);

      // 1. Guardar el intento
      const attemptId = await saveAssessmentAttempt({
        userId: user.uid,
        assessmentId: assessment.id,
        status: 'completed',
        score: 0,
      });

      // 2. Guardar las respuestas
      const answersArray = Object.values(answers);
      await saveAttemptAnswers(attemptId, answersArray);

      // 3. Calcular el estilo de aprendizaje
      const styleId = await calculateLearningStyle(answersArray);

      if (!styleId) {
        throw new Error('No se pudo determinar el estilo de aprendizaje');
      }

      // 4. Guardar el estilo de aprendizaje del usuario
      await saveUserLearningStyle(user.uid, styleId, attemptId);

      // 5. Actualizar el documento del usuario
      await updateUserLearningStyle(user.uid, styleId);

      // 6. Obtener información del estilo de aprendizaje
      const learningStyle = await getLearningStyleById(styleId);
      setLearningStyleResult(learningStyle);

      // 7. Mostrar alert con el resultado
      alert(`¡Felicitaciones! 🎉\n\nTu estilo de aprendizaje es: ${learningStyle.name}\n\nAhora tu experiencia de aprendizaje será personalizada según tus preferencias.`);

      // 8. Mostrar resultado
      setShowResult(true);
    } catch (error) {
      console.error('Error al enviar el test:', error);
      alert('Error al procesar el test. Por favor, intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return null;
  }

  // Pantalla de resultado
  if (showResult && learningStyleResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Confetti Effect */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-6 animate-bounce">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              ¡Test Completado! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              Hemos identificado tu estilo de aprendizaje
            </p>
          </div>

          {/* Result Card */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-6">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white text-center">
                Tu estilo de aprendizaje es:
              </h2>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Learning Style Name */}
              <div className="text-center mb-6">
                <h3 className="text-4xl font-bold text-blue-600 mb-2">
                  {learningStyleResult.name}
                </h3>
                {learningStyleResult.shortName && (
                  <p className="text-lg text-gray-500">
                    ({learningStyleResult.shortName})
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Qué significa esto?
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {learningStyleResult.description}
                </p>
              </div>

              {/* Characteristics */}
              {learningStyleResult.characteristics && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Características principales:
                  </h4>
                  <ul className="space-y-2">
                    {(Array.isArray(learningStyleResult.characteristics) 
                      ? learningStyleResult.characteristics 
                      : learningStyleResult.characteristics.split('\n')
                    ).filter(c => c && c.trim()).map((char, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-gray-700">{char}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {learningStyleResult.recommendations && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    💡 Recomendaciones para ti:
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {learningStyleResult.recommendations}
                  </p>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  🚀 Siguientes pasos
                </h4>
                <p className="text-gray-700 mb-4">
                  Ahora que conoces tu estilo de aprendizaje, nuestro sistema personalizará 
                  el contenido de tus cursos para adaptarse mejor a tu forma de aprender.
                </p>
                <p className="text-sm text-gray-600">
                  Puedes ver tu estilo de aprendizaje en cualquier momento desde tu perfil.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={handleGoToDashboard}
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
            >
              Ir al Dashboard
              <ChevronRightIcon className="w-6 h-6 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla del test
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  const allQuestionsAnswered = assessment.questions.every(q => answers[q.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 rounded-full p-4">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test de Estilo de Aprendizaje
          </h1>
          <p className="text-gray-600">
            Pregunta {currentQuestionIndex + 1} de {assessment.questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleAnswerSelect(currentQuestion.id, choice.id, choice)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id]?.choiceId === choice.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    answers[currentQuestion.id]?.choiceId === choice.id
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id]?.choiceId === choice.id && (
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className={`flex-1 ${
                    answers[currentQuestion.id]?.choiceId === choice.id
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-700'
                  }`}>
                    {choice.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2" />
            Anterior
          </button>

          <div className="text-sm text-gray-500">
            {Object.keys(answers).length} de {assessment.questions.length} respondidas
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || submitting}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                !allQuestionsAnswered || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  Finalizar Test
                  <CheckCircleIcon className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                !answers[currentQuestion.id]
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              }`}
            >
              Siguiente
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningStyleTest;
