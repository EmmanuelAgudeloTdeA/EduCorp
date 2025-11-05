import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/UsersService.mjs';
import { getLearningStyleById } from '../../services/LearningStylesService.mjs';
import { 
  UserIcon, 
  AcademicCapIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [learningStyle, setLearningStyle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos del usuario
      const userInfo = await getUserById(user.uid);
      setUserData(userInfo);

      // Cargar estilo de aprendizaje si existe
      if (userInfo?.learningStyleId) {
        const style = await getLearningStyleById(userInfo.learningStyleId);
        setLearningStyle(style);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTest = () => {
    navigate('/learning-style-test');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col items-center">
              {/* Avatar */}
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <UserIcon className="w-16 h-16 text-white" />
              </div>

              {/* Nombre */}
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {userData?.displayName || userData?.name || 'Usuario'}
              </h2>

              {/* Email */}
              <p className="text-gray-600 text-center mb-6">
                {user?.email}
              </p>

              {/* Fecha de registro */}
              <div className="w-full pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  <span>
                    Miembro desde {userData?.createdAt 
                      ? new Date(userData.createdAt).toLocaleDateString('es-ES', { 
                          month: 'long', 
                          year: 'numeric' 
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estilo de Aprendizaje */}
        <div className="lg:col-span-2">
          {learningStyle ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SparklesIcon className="w-6 h-6 text-white mr-2" />
                    <h3 className="text-xl font-bold text-white">
                      Tu Estilo de Aprendizaje
                    </h3>
                  </div>
                  <button
                    onClick={handleRetakeTest}
                    className="flex items-center px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-black text-sm font-medium rounded-lg transition-colors"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1" />
                    Hacer de nuevo
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Nombre del estilo */}
                <div className="mb-6">
                  <h4 className="text-3xl font-bold text-blue-600 mb-2">
                    {learningStyle.name}
                  </h4>
                  {learningStyle.shortName && (
                    <p className="text-lg text-gray-600">
                      {learningStyle.shortName}
                    </p>
                  )}
                </div>

                {/* Descripción */}
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Qué significa?
                  </h5>
                  <p className="text-gray-700 leading-relaxed">
                    {learningStyle.description}
                  </p>
                </div>

                {/* Características */}
                {learningStyle.characteristics && (
                  <div className="mb-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-3">
                      Características principales:
                    </h5>
                    <div className="bg-white rounded-lg p-4">
                      <ul className="space-y-2">
                        {(Array.isArray(learningStyle.characteristics) 
                          ? learningStyle.characteristics 
                          : learningStyle.characteristics.split('\n')
                        ).filter(c => c && c.trim()).map((char, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-gray-700">{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recomendaciones */}
                {learningStyle.recommendations && (
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">
                      💡 Recomendaciones:
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      {learningStyle.recommendations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // No tiene estilo de aprendizaje asignado
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aún no has realizado el test de estilo de aprendizaje
                </h3>
                <p className="text-gray-600 mb-6">
                  Descubre cómo aprendes mejor y personaliza tu experiencia de aprendizaje.
                </p>
                <button
                  onClick={handleRetakeTest}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <AcademicCapIcon className="w-5 h-5 mr-2" />
                  Realizar Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Información de la Cuenta
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <p className="text-gray-900">
              {userData?.displayName || userData?.name || 'No especificado'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Registro
            </label>
            <p className="text-gray-900">
              {userData?.createdAt 
                ? new Date(userData.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estilo de Aprendizaje Asignado
            </label>
            <p className="text-gray-900">
              {learningStyle ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {learningStyle.name}
                </span>
              ) : (
                <span className="text-gray-500">No asignado</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
