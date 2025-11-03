import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente para proteger rutas basadas en roles
 * @param {Object} props
 * @param {Array<string>} props.allowedRoles - Array de nombres de roles permitidos
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si tiene acceso
 * @param {string} props.redirectTo - Ruta a la que redirigir si no tiene acceso
 */
const RoleBasedRoute = ({ 
  allowedRoles = [], 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { userRoles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasAccess = allowedRoles.some(allowedRole =>
    userRoles.some(userRole => userRole.name === allowedRole)
  );

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleBasedRoute;

