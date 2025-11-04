import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  getCourseById, 
  getCourseProgress,
  markLessonComplete,
  isUserEnrolled
} from '../../services/CoursesService.mjs';
import { 
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  PlayCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId, user]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Verificar si está inscrito
      const enrolled = await isUserEnrolled(user.uid, courseId);
      if (!enrolled) {
        alert('No estás inscrito en este curso');
        navigate(`/dashboard/course-detail/${courseId}`);
        return;
      }

      // Cargar datos del curso
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      // Cargar progreso
      const progressData = await getCourseProgress(user.uid, courseId);
      setProgress(progressData);

      // Si hay progreso previo, intentar continuar desde la última lección
      if (progressData && progressData.lastLessonId) {
        findLessonPosition(courseData, progressData.lastLessonId);
      }
    } catch (error) {
      console.error('Error al cargar curso:', error);
      alert('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };

  const findLessonPosition = (courseData, lessonId) => {
    if (!courseData.modules) return;
    
    for (let moduleIdx = 0; moduleIdx < courseData.modules.length; moduleIdx++) {
      const module = courseData.modules[moduleIdx];
      if (!module.lessons) continue;
      
      const lessonIdx = module.lessons.findIndex(lesson => lesson.id === lessonId);
      if (lessonIdx !== -1) {
        setCurrentModuleIndex(moduleIdx);
        setCurrentLessonIndex(lessonIdx);
        return;
      }
    }
  };

  const getCurrentLesson = () => {
    if (!course?.modules?.[currentModuleIndex]?.lessons?.[currentLessonIndex]) {
      return null;
    }
    return course.modules[currentModuleIndex].lessons[currentLessonIndex];
  };

  const getCurrentModule = () => {
    if (!course?.modules?.[currentModuleIndex]) {
      return null;
    }
    return course.modules[currentModuleIndex];
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessonIds?.includes(lessonId) || false;
  };

  const handleMarkComplete = async () => {
    const currentLesson = getCurrentLesson();
    if (!currentLesson || markingComplete) return;

    try {
      setMarkingComplete(true);
      await markLessonComplete(user.uid, courseId, currentLesson.id);
      
      // Recargar progreso
      const updatedProgress = await getCourseProgress(user.uid, courseId);
      setProgress(updatedProgress);
      
      // Avanzar automáticamente a la siguiente lección
      if (canGoNext()) {
        setTimeout(() => {
          handleNextLesson();
        }, 500);
      }
    } catch (error) {
      console.error('Error al marcar como completada:', error);
      alert('Error al marcar la lección como completada');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex((prevModule.lessons?.length || 1) - 1);
    }
  };

  const handleNextLesson = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return;

    if (currentLessonIndex < (currentModule.lessons?.length || 0) - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < (course.modules?.length || 0) - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const handleSelectLesson = (moduleIdx, lessonIdx) => {
    setCurrentModuleIndex(moduleIdx);
    setCurrentLessonIndex(lessonIdx);
  };

  const canGoPrevious = () => {
    return currentModuleIndex > 0 || currentLessonIndex > 0;
  };

  const canGoNext = () => {
    const currentModule = getCurrentModule();
    if (!currentModule) return false;
    
    return (
      currentLessonIndex < (currentModule.lessons?.length || 0) - 1 ||
      currentModuleIndex < (course.modules?.length || 0) - 1
    );
  };

  const getModuleProgress = (module) => {
    if (!module.lessons || !progress?.completedLessonIds) return 0;
    
    const completedCount = module.lessons.filter(lesson => 
      progress.completedLessonIds.includes(lesson.id)
    ).length;
    
    return Math.round((completedCount / module.lessons.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
        <h3 className="text-lg font-medium text-gray-900">Curso no encontrado</h3>
        <button
          onClick={() => navigate('/dashboard/courses')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Volver a Mis Cursos
        </button>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();
  const currentModule = getCurrentModule();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/dashboard/course-detail/${courseId}`)}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">
                  Progreso: {progress?.progressPercentage || 0}%
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              <BookOpenIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video and Content Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-black">
                {course.videoUrl ? (
                  <video
                    key={currentLesson?.id || 'intro'}
                    controls
                    className="w-full h-full"
                    src={currentLesson?.videoUrl || course.videoUrl}
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-700">
                    <div className="text-center">
                      <PlayCircleIcon className="w-20 h-20 mx-auto mb-4 text-white opacity-50" />
                      <p className="text-lg">No hay video disponible</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500">
                  <span>Módulo {currentModuleIndex + 1}</span>
                  <ChevronRightIcon className="w-4 h-4 mx-2" />
                  <span>Lección {currentLessonIndex + 1}</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentLesson?.title || 'Introducción al curso'}
                </h2>

                {/* Module Name */}
                <p className="text-sm font-medium text-blue-600">
                  {currentModule?.title}
                </p>

                {/* Description */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {currentLesson?.description || course.description}
                  </p>
                </div>

                {/* Complete Button and Navigation */}
                <div className="pt-6 border-t border-gray-200 space-y-4">
                  {/* Complete Button */}
                  {currentLesson && (
                    <div>
                      {isLessonCompleted(currentLesson.id) ? (
                        <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                          <CheckCircleIconSolid className="w-6 h-6 mr-2" />
                          <span className="font-medium">✓ Lección completada</span>
                        </div>
                      ) : (
                        <button
                          onClick={handleMarkComplete}
                          disabled={markingComplete}
                          className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                        >
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          {markingComplete ? 'Marcando...' : 'Marcar como completada'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handlePreviousLesson}
                      disabled={!canGoPrevious()}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Lección anterior
                    </button>
                    <button
                      onClick={handleNextLesson}
                      disabled={!canGoNext()}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente lección
                      <ChevronRightIcon className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className={`lg:col-span-1 ${showSidebar ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Contenido del curso</h3>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                  <span>{progress?.completedLessons || 0} / {progress?.totalLessons || 0} lecciones</span>
                  <span className="font-semibold text-blue-600">{progress?.progressPercentage || 0}%</span>
                </div>
                {/* Overall Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress?.progressPercentage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {course.modules?.map((module, moduleIdx) => (
                  <div key={moduleIdx} className="border-b border-gray-200">
                    <div className="p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        Módulo {moduleIdx + 1}: {module.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{module.lessons?.length || 0} lecciones</span>
                        <span>{getModuleProgress(module)}% completado</span>
                      </div>
                      {/* Module Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${getModuleProgress(module)}%` }}
                        ></div>
                      </div>
                    </div>

                    {module.lessons?.map((lesson, lessonIdx) => {
                      const isCompleted = isLessonCompleted(lesson.id);
                      const isCurrent = moduleIdx === currentModuleIndex && lessonIdx === currentLessonIndex;
                      
                      return (
                        <button
                          key={lessonIdx}
                          onClick={() => handleSelectLesson(moduleIdx, lessonIdx)}
                          className={`w-full text-left p-4 hover:bg-blue-50 transition-colors border-l-4 ${
                            isCurrent 
                              ? 'bg-blue-50 border-blue-600' 
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="shrink-0 mt-0.5">
                              {isCompleted ? (
                                <CheckCircleIconSolid className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                isCurrent ? 'text-blue-600' : 'text-gray-700'
                              }`}>
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
