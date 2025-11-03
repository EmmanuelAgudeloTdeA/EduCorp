import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  HomeIcon, 
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { isAdmin, hasRole } = useAuth();
  
  // Items del menú que todos pueden ver
  const commonMenuItems = [
    {
      to: "/dashboard",
      icon: HomeIcon,
      label: "Inicio",
      end: true,
    },
    {
      to: "/dashboard/courses",
      icon: AcademicCapIcon,
      label: "Mis Cursos",
    },
    {
      to: "/dashboard/my-progress",
      icon: BookOpenIcon,
      label: "Mi Progreso",
    },
  ];
  
  // Items solo para administradores
  const adminMenuItems = [
    {
      to: "/dashboard/admin/users",
      icon: UsersIcon,
      label: "Gestión de Usuarios",
    },
    {
      to: "/dashboard/admin/courses-management",
      icon: DocumentTextIcon,
      label: "Gestión de Cursos",
    },
    {
      to: "/dashboard/admin/analytics",
      icon: ChartBarIcon,
      label: "Analíticas",
    },
    {
      to: "/dashboard/admin/settings",
      icon: CogIcon,
      label: "Configuración",
    },
  ];

  return (
    <aside className="w-64 bg-gray-100 h-screen shrink-0 flex flex-col overflow-hidden">
      <div className="w-full p-4 flex items-center justify-center min-h-16 shrink-0">
        <h1 className="text-2xl font-bold text-blue-600">EduCorp</h1>
      </div>
      
      <nav className="w-full p-4 space-y-2 overflow-y-auto flex-1">
        {/* Items comunes para todos los usuarios */}
        {commonMenuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}

        {/* Separador y sección de admin */}
        {isAdmin() && (
          <>
            <div className="my-4 border-t border-gray-300"></div>
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                Administración
              </span>
            </div>
            {adminMenuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
