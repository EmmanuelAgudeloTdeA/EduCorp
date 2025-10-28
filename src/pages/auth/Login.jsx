import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { firebaseApp } from "../../config/firebase";
import { Bounce, toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Card from "../../components/auth/Card";
import Input from "../../components/auth/Input";
import Button from "../../components/auth/Button";

const auth = getAuth(firebaseApp);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (e) {
      toast.error('Correo o contraseña incorrecto', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  return (
    <Card 
      title="Iniciar Sesión" 
      subtitle="Accede a tu cuenta de EduCorp"
    >
      <form className="mt-8 space-y-6" onSubmit={handleLogin}>
        <div className="rounded-md space-y-4">
          <Input
            type="email"
            id="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input
            type="password"
            id="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Button type="submit">
            Iniciar Sesión
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">¿No tienes cuenta? </span>
          <Link to="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
            Regístrate aquí
          </Link>
        </div>
      </form>
    </Card>
  );
};

export default Login;
