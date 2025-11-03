import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getUserCoursesInProgress,
  getUserPendingCourses,
  getUserStatistics 
} from '../../services/CoursesService.mjs';
import { 
  AcademicCapIcon, 
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, userData, loading: authLoading } = useAuth();
  const scrollContainerRef = useRef(null);
  
  // Estado para controlar la carga inicial
  const [isLoading, setIsLoading] = useState(true);
  const [cursosEnProgreso, setCursosEnProgreso] = useState([]);
  const [cursosPendientes, setCursosPendientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    totalCursos: 0,
    cursosCompletados: 0,
    cursosPendientes: 0,
    cursosEnProgreso: 0
  });

  // Efecto para cargar datos de Firebase
  useEffect(() => {
    const loadData = async () => {
      if (!authLoading && user?.uid) {
        try {
          const [progressData, pendingData, stats] = await Promise.all([
            getUserCoursesInProgress(user.uid),
            getUserPendingCourses(user.uid),
            getUserStatistics(user.uid)
          ]);
          
          // Mapear los datos al formato esperado por la UI
          const mappedProgress = progressData.map(item => ({
            id: item.courseId,
            nombre: item.course?.title || 'Curso sin título',
            descripcion: item.course?.description || '',
            progreso: item.progressPercentage || 0,
            leccionActual: `Lección ${item.completedLessons} de ${item.totalLessons}`,
            imagen: item.course?.image || '📚',
            totalLecciones: item.totalLessons || 0
          }));

          const mappedPending = pendingData.map(item => ({
            id: item.courseId,
            nombre: item.course?.title || 'Curso sin título',
            estudiantes: 0, // Este dato no está en la BD actual
            imagen: item.course?.image || '📚'
          }));
          
          setCursosEnProgreso(mappedProgress);
          setCursosPendientes(mappedPending);
          setEstadisticas(stats);
          setIsLoading(false);
        } catch (error) {
          console.error('Error cargando datos:', error);
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [authLoading, user]);

  // Función para hacer scroll del carrusel
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Ancho aproximado de una card + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };


  // Obtener nombre completo del usuario
  const nombreCompleto = userData 
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    : 'Usuario';

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header con información del usuario */}
      <div className="text-black rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              ¡Bienvenido de nuevo, {nombreCompleto}! 
            </h1>
            <p className="mt-2 opacity-90 flex items-center space-x-2">
              <span>{user?.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cursos</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadisticas.totalCursos}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AcademicCapIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadisticas.cursosCompletados}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadisticas.cursosEnProgreso}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <ChartBarIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {estadisticas.cursosPendientes}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ClockIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Cursos en progreso */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Mis Cursos en Progreso
          </h2>
          <div className="flex items-center space-x-3">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {cursosEnProgreso.length} cursos activos
            </span>
            {/* Botones de navegación del carrusel */}
            {cursosEnProgreso.length > 4 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => scroll('left')}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  aria-label="Siguiente"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Carrusel de cards de cursos */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {cursosEnProgreso.map((curso) => (
              <div 
                key={curso.id} 
                className="flex-none w-72 snap-start bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                {/* Header de la card */}
                <div className="h-24 bg-blue-600 flex items-center justify-center relative">
                  <div className="text-4xl">{curso.imagen}</div>
                  <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-full">
                    <span className="text-xs font-semibold text-gray-900">
                      {curso.leccionActual.split(' ')[1]}/{curso.totalLecciones}
                    </span>
                  </div>
                </div>

                {/* Contenido de la card */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                    {curso.nombre}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 h-8">
                    {curso.descripcion}
                  </p>

                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Progreso</span>
                      <span className="text-xs font-bold text-blue-600">{curso.progreso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${curso.progreso}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botón de continuar */}
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1">
                    <span>Continuar</span>
                    <svg 
                      className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicador de scroll (sombras en los bordes) */}
          {cursosEnProgreso.length > 4 && (
            <>
              <div className="absolute left-0 top-0 bottom-4 w-8 bg-linear-to-r from-white to-transparent pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-4 w-8 bg-linear-to-l from-white to-transparent pointer-events-none"></div>
            </>
          )}
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cursos pendientes */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Cursos Pendientes
            </h2>
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
              {cursosPendientes.length} cursos
            </span>
          </div>
          <div className="space-y-3">
            {cursosPendientes.map((curso) => (
              <div 
                key={curso.id} 
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-xl">
                    {curso.imagen}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {curso.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {curso.estudiantes} estudiantes inscritos
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Comenzar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Completaste "Introducción a APIs"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hace 2 horas
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
              <div className="bg-blue-100 p-2 rounded-lg">
                <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nuevo curso disponible: "TypeScript Pro"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hace 5 horas
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-4 border-b border-gray-100">
              <div className="bg-orange-100 p-2 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Alcanzaste 70% en "React Avanzado"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hace 1 día
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ClockIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Recordatorio: Continúa "Node.js y Express"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hace 2 días
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;