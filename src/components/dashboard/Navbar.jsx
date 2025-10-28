import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="dashboard-navbar">
      <div className="navbar-brand">
        <h2>EduCorp</h2>
      </div>
      <div className="navbar-user">
        <span>{user?.email}</span>
      </div>
    </nav>
  );
};

export default Navbar;
