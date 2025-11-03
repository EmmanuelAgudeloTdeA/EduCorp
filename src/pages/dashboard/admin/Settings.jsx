import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra las configuraciones de la plataforma
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Nombre de la plataforma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Plataforma
            </label>
            <input
              type="text"
              defaultValue="EduCorp"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email de contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              placeholder="contacto@educorp.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Configuración de notificaciones */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-gray-700">
                  Notificar a los usuarios sobre nuevos cursos
                </span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-gray-700">
                  Enviar recordatorios de cursos pendientes
                </span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm text-gray-700">
                  Notificar sobre logros obtenidos
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>

      {/* Sección de zona peligrosa */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200">
        <div className="p-6 border-b border-red-200">
          <h2 className="text-xl font-semibold text-red-600">Zona Peligrosa</h2>
          <p className="mt-1 text-sm text-gray-500">
            Acciones irreversibles que requieren confirmación
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Resetear todos los datos</h3>
              <p className="text-sm text-gray-500">
                Elimina todos los usuarios, cursos y progreso. Esta acción no se puede deshacer.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Resetear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

