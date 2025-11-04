import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { 
  getUserEnrollments,
  getUserProgress,
  getUserStatistics 
} from '../../services/CoursesService.mjs';

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [statistics, setStatistics] = useState({
    totalCursos: 0,
    cursosEnProgreso: 0,
    cursosCompletados: 0,
    cursosPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in-progress, completed, pending

  useEffect(() => {
    if (user) {
      loadUserCourses();
    }
  }, [user]);

  const loadUserCourses = async () => {
    try {
      setLoading(true);
      
      // Cargar inscripciones
      const enrollmentsData = await getUserEnrollments(user.uid);
      setEnrollments(enrollmentsData);

      // Cargar progreso de todos los cursos
      const progressData = await getUserProgress(user.uid);
      const progressById = {};
      progressData.forEach(prog => {
        progressById[prog.courseId] = prog;
      });
      setProgressMap(progressById);

      // Cargar estadísticas
      const stats = await getUserStatistics(user.uid);
      setStatistics(stats);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseStatus = (courseId) => {
    const progress = progressMap[courseId];
    // Si no hay progreso o el progreso es 0, es "pendiente/por empezar"
    if (!progress || progress.progressPercentage === 0) return 'pending';
    // Si está completado al 100%
    if (progress.progressPercentage === 100) return 'completed';
    // Si tiene progreso pero no está completado
    if (progress.progressPercentage > 0 && progress.progressPercentage < 100) return 'in-progress';
    return 'pending';
  };

  const getFilteredCourses = () => {
    if (filter === 'all') return enrollments;
    return enrollments.filter(enrollment => {
      const status = getCourseStatus(enrollment.courseId);
      if (filter === 'in-progress') return status === 'in-progress';
      if (filter === 'completed') return status === 'completed';
      if (filter === 'pending') return status === 'pending';
      return true;
    });
  };

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/course-detail/${courseId}`);
  };

  const handleStartCourse = (e, courseId) => {
    e.stopPropagation();
    navigate(`/dashboard/course-viewer/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  const filteredCourses = getFilteredCourses();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mis Cursos</h1>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cursos</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalCursos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Progreso</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.cursosEnProgreso}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completados</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.cursosCompletados}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <PlayIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Por Empezar</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.cursosPendientes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'in-progress'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En Progreso
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completados
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Por Empezar
          </button>
        </div>
      </div>

      {/* Lista de cursos */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filter === 'all' 
                ? 'No tienes cursos asignados' 
                : 'No hay cursos en esta categoría'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Contacta con tu administrador para que te asigne cursos.'
                : 'Cambia de filtro para ver otros cursos.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;

            const progress = progressMap[course.id];
            const progressPercentage = progress?.progressPercentage || 0;
            const status = getCourseStatus(course.id);

            return (
              <div
                key={enrollment.id}
                onClick={() => handleCourseClick(course.id)}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <AcademicCapIcon className="w-16 h-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {status === 'completed' && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Completado
                      </span>
                    )}
                    {status === 'in-progress' && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        En progreso
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  {course.category && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 rounded mb-2">
                      {course.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.shortDescription || course.description}
                  </p>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span className="font-semibold">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressPercentage === 100 ? 'bg-green-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {course.duration && (
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {course.level === 'beginner' && 'Principiante'}
                        {course.level === 'intermediate' && 'Intermedio'}
                        {course.level === 'advanced' && 'Avanzado'}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => handleStartCourse(e, course.id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlayIcon className="w-4 h-4 mr-2" />
                      {progressPercentage > 0 ? 'Continuar' : 'Comenzar'}
                    </button>
                    <button
                      onClick={() => handleCourseClick(course.id)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
