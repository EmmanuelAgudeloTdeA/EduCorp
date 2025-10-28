import React from 'react';
import { NavLink } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseApp } from '../../config/firebase';

const auth = getAuth(firebaseApp);

const Sidebar = () => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <aside className="dashboard-sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/dashboard" end>
            Inicio
          </NavLink>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
