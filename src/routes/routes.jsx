import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getDocument } from "../api/firebase/firestore";
import Auth from "../layouts/Auth";
import Dashboard from "../layouts/Dashboard";
import RoleBasedRoute from "../components/common/RoleBasedRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Home from "../pages/dashboard/Home";
import Profile from "../pages/dashboard/Profile";
import Courses from "../pages/dashboard/Courses";
import CourseDetail from "../pages/dashboard/CourseDetail";
import CourseViewer from "../pages/dashboard/CourseViewer";
import MyProgress from "../pages/dashboard/MyProgress";
import LearningStyleTest from "../pages/LearningStyleTest";
import Users from "../pages/dashboard/admin/Users";
import CoursesManagement from "../pages/dashboard/admin/CoursesManagement";
import Analytics from "../pages/dashboard/admin/Analytics";
import Settings from "../pages/dashboard/admin/Settings";
import ErrorPage from "../pages/ErrorPage";


// Componente para manejar la redirección desde la raíz
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth/login" replace />;
};

const AuthOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/auth/login" replace />;

  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin, userRoles } = useAuth();
  const [checkingStyle, setCheckingStyle] = useState(true);
  const [hasStyle, setHasStyle] = useState(null);

  useEffect(() => {
    const checkLearningStyle = async () => {
      if (!user) {
        setCheckingStyle(false);
        return;
      }

      // Esperar a que los roles estén cargados antes de verificar
      // Si userRoles está undefined o null, aún no se han cargado
      if (userRoles === null || userRoles === undefined) {
        console.log('Esperando a que se carguen los roles...');
        setCheckingStyle(true); // Mantener en carga mientras se obtienen roles
        return;
      }

      console.log('Roles del usuario:', userRoles);

      // Si es admin, no es obligatorio tener estilo de aprendizaje
      // Verificar directamente en el array de roles
      const adminRole = userRoles.find(role => role && role.name === 'admin');
      if (adminRole) {
        console.log('✅ Usuario es admin, no requiere estilo de aprendizaje');
        setHasStyle(true);
        setCheckingStyle(false);
        return;
      }

      console.log('❌ Usuario NO es admin, verificando estilo de aprendizaje...');

      // Para usuarios no admin, verificar si tienen estilo de aprendizaje
      const userData = await getDocument("users", user.uid);
      console.log('Usuario no es admin, verificando estilo de aprendizaje:', userData?.learningStyleId);
      setHasStyle(!!userData?.learningStyleId);
      setCheckingStyle(false);
    };

    if (!loading && user) {
      checkLearningStyle();
    } else if (!loading && !user) {
      setCheckingStyle(false);
    }
  }, [user, loading, userRoles]);

  if (loading || checkingStyle) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!hasStyle) {
    return <Navigate to="/learning-style-test" replace />;
  }

  return children;
};

// Rutas públicas: si el usuario ya está autenticado, redirige al dashboard
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/* ==========================
          RUTAS
   ========================== */

export const routers = createBrowserRouter([
  // Redirección base con verificación de autenticación
  {
    path: "/",
    element: <RootRedirect />,
  },

  // Rutas de autenticación
  {
    path: "/auth",
    element: (
      <PublicRoute>
        <Auth />
      </PublicRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  // Test de estilo de aprendizaje (solo autenticado)
  {
    path: "/learning-style-test",
    element: (
      <AuthOnlyRoute>
        <LearningStyleTest />
      </AuthOnlyRoute>
    ),
  },

  // Dashboard (requiere estilo de aprendizaje)
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
        handle: { title: "Inicio" },
      },
      {
        path: "profile",
        element: <Profile />,
        handle: { title: "Mi Perfil" },
      },
      {
        path: "courses",
        element: <Courses />,
        handle: { title: "Mis Cursos" },
      },
      {
        path: "course-detail/:courseId",
        element: <CourseDetail />,
        handle: { title: "Detalle del Curso" },
      },
      {
        path: "course-viewer/:courseId",
        element: <CourseViewer />,
        handle: { title: "Visor del Curso" },
      },
      {
        path: "my-progress",
        element: <MyProgress />,
        handle: { title: "Mi Progreso" },
      },
      // Rutas de administración (solo accesibles por admin)
      {
        path: "admin/users",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Users />
          </RoleBasedRoute>
        ),
        handle: { title: "Gestión de Usuarios" },
      },
      {
        path: "admin/courses-management",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <CoursesManagement />
          </RoleBasedRoute>
        ),
        handle: { title: "Gestión de Cursos" },
      },
      {
        path: "admin/analytics",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Analytics />
          </RoleBasedRoute>
        ),
        handle: { title: "Analíticas" },
      },
      {
        path: "admin/settings",
        element: (
          <RoleBasedRoute allowedRoles={["admin"]}>
            <Settings />
          </RoleBasedRoute>
        ),
        handle: { title: "Configuración" },
      },
    ],
  },

  // Página de error
  {
    path: "*",
    element: <ErrorPage />,
  },
]);