import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getCourseById, 
  getCourseProgress, 
  isUserEnrolled,
  enrollUserInCourse 
} from '../../services/CoursesService.mjs';
import { 
  AcademicCapIcon,
  ClockIcon,
  SignalIcon,
  PlayIcon,
  CheckCircleIcon,
  BookOpenIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del curso
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      if (user) {
        // Verificar si está inscrito
        const isEnrolled = await isUserEnrolled(user.uid, courseId);
        setEnrolled(isEnrolled);

        // Cargar progreso si está inscrito
        if (isEnrolled) {
          const progressData = await getCourseProgress(user.uid, courseId);
          setProgress(progressData);
        }
      }
    } catch (error) {
      console.error('Error al cargar curso:', error);
      alert('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      await enrollUserInCourse(user.uid, courseId);
      alert('¡Te has inscrito exitosamente al curso!');
      setEnrolled(true);
      loadCourseData();
    } catch (error) {
      console.error('Error al inscribirse:', error);
      alert('Error al inscribirse al curso');
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    navigate(`/dashboard/course-viewer/${courseId}`);
  };

  const getLevelText = (level) => {
    const levels = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado'
    };
    return levels[level] || level;
  };

  const getTotalLessons = () => {
    if (!course?.modules) return 0;
    return course.modules.reduce((total, module) => {
      return total + (module.lessons?.length || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Curso no encontrado</h3>
        <div className="mt-6">
          <button
            onClick={() => navigate('/dashboard/courses')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de volver */}
      <button
        onClick={() => navigate('/dashboard/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Volver a Mis Cursos
      </button>

      {/* Encabezado del curso */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg overflow-hidden">
        <div className="px-6 py-12 sm:px-12">
          <div className="max-w-4xl">
            {/* Categoría */}
            {course.category && (
              <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-100 bg-blue-800 bg-opacity-50 rounded-full mb-4">
                {course.category}
              </span>
            )}
            
            {/* Título */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {course.title}
            </h1>
            
            {/* Descripción corta */}
            <p className="text-xl text-blue-100 mb-6">
              {course.shortDescription}
            </p>

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              {course.level && (
                <div className="flex items-center">
                  <SignalIcon className="w-5 h-5 mr-2" />
                  <span>{getLevelText(course.level)}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span>{course.duration}</span>
                </div>
              )}
              {course.modules && (
                <div className="flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2" />
                  <span>{getTotalLessons()} lecciones</span>
                </div>
              )}
            </div>

            {/* Progreso si está inscrito */}
            {enrolled && progress && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-white mb-2">
                  <span className="text-sm font-medium">Tu progreso</span>
                  <span className="text-sm font-medium">{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-blue-800 bg-opacity-50 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="mt-8">
              {enrolled ? (
                <button
                  onClick={handleStartCourse}
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  {progress && progress.progressPercentage > 0 ? 'Continuar Curso' : 'Comenzar Curso'}
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                  {enrolling ? 'Inscribiendo...' : 'Inscribirse al Curso'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del curso */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Descripción completa */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de este curso</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* Contenido del curso */}
          {course.modules && course.modules.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Contenido del curso
              </h2>
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                    </div>
                    {module.lessons && module.lessons.length > 0 && (
                      <ul className="divide-y divide-gray-200">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const isCompleted = progress?.completedLessonIds?.includes(lesson.id);
                          return (
                            <li key={lessonIndex} className="px-4 py-3 hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {isCompleted ? (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3"></div>
                                  )}
                                  <span className="text-sm text-gray-700">{lesson.title}</span>
                                </div>
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500">{lesson.duration}</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar con información adicional */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Detalles del curso
            </h3>
            
            <div className="space-y-4">
              {course.level && (
                <div className="flex items-start">
                  <SignalIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nivel</p>
                    <p className="text-sm text-gray-600">{getLevelText(course.level)}</p>
                  </div>
                </div>
              )}

              {course.duration && (
                <div className="flex items-start">
                  <ClockIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duración</p>
                    <p className="text-sm text-gray-600">{course.duration}</p>
                  </div>
                </div>
              )}

              {course.modules && (
                <div className="flex items-start">
                  <BookOpenIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Contenido</p>
                    <p className="text-sm text-gray-600">
                      {course.modules.length} módulos • {getTotalLessons()} lecciones
                    </p>
                  </div>
                </div>
              )}

              {enrolled && progress && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tu progreso</p>
                      <p className="text-sm text-gray-600">
                        {progress.completedLessons} de {progress.totalLessons} lecciones completadas
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de acción en sidebar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              {enrolled ? (
                <button
                  onClick={handleStartCourse}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  {progress && progress.progressPercentage > 0 ? 'Continuar' : 'Comenzar'}
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                  {enrolling ? 'Inscribiendo...' : 'Inscribirse'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

