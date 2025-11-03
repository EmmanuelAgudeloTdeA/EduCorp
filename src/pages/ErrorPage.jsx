import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/auth/Button";

const ErrorPage = () => {
  return (
    <div className="w-full h-screen flex justify-center items-center flex-col gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col justify-start items-center gap-6 w-1/2">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-gray-600">La página que buscas no existe.</p>
        <Link to="/dashboard">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
