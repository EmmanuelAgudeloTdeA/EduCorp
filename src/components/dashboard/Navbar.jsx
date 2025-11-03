import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { Link, useMatches } from "react-router-dom";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";


const Navbar = () => {
  const { user, auth } = useAuth();
  const matches = useMatches();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle =
    matches
      .filter((match) => match.handle?.title)
      .map((match) => match.handle.title)
      .pop() || "Dashboard";

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="w-full p-4 px-6 flex items-center justify-between min-h-1 bg-white shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center relative" ref={dropdownRef}>
        {/* Botón del perfil */}
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex items-center space-x-2">
            <UserIcon className="w-6 h-6 text-gray-700" />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.email?.split("@")[0]}
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Menú desplegable */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
            {/* Información del usuario */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
            </div>

            {/* Opciones del menú */}
            <div className="py-2">
              <Link to="/dashboard/profile" onClick={() => {
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <UserCircleIcon className="w-5 h-5 mr-3 text-gray-500" />
                Mi Perfil
              </Link>
             

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Aquí puedes agregar la navegación a configuración
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                Configuración
              </button>
            </div>

            {/* Cerrar sesión */}
            <div className="border-t border-gray-200 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
