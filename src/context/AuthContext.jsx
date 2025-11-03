import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import appFirebase from '../api/firebase/config';
import { getDocument } from '../api/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userRoles, setUserRoles] = useState(null); // null indica que aún no se han cargado
  const [loading, setLoading] = useState(true);
  const auth = getAuth(appFirebase);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Obtener datos del usuario desde Firestore
          const userDoc = await getDocument('users', firebaseUser.uid);
          setUserData(userDoc);

          // Obtener roles del usuario
          if (userDoc) {
            const userRolesQuery = query(
              collection(db, 'user_roles'),
              where('userId', '==', firebaseUser.uid)
            );
            const userRolesSnapshot = await getDocs(userRolesQuery);
            
            // Obtener los detalles de cada rol
            const rolesPromises = userRolesSnapshot.docs.map(async (doc) => {
              const userRoleData = doc.data();
              const roleDoc = await getDocument('roles', userRoleData.roleId);
              return roleDoc;
            });
            
            const roles = await Promise.all(rolesPromises);
            const validRoles = roles.filter(role => role !== null);
            setUserRoles(validRoles.length > 0 ? validRoles : []); // Array vacío si no tiene roles, null solo al inicio
          } else {
            setUserRoles([]); // Usuario autenticado pero sin datos, array vacío
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          setUserRoles([]); // En caso de error, establecer como array vacío
        }
      } else {
        setUserData(null);
        setUserRoles(null); // Usuario no autenticado, volver a null
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // Función helper para verificar si el usuario tiene un rol específico
  const hasRole = (roleName) => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    return userRoles.some(role => role.name === roleName);
  };

  // Función helper para verificar si el usuario es admin
  const isAdmin = () => hasRole('admin');

  const value = {
    user,
    userData,
    userRoles,
    loading,
    auth,
    hasRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

