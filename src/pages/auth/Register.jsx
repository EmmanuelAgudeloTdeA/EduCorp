import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { firebaseApp } from "../../config/firebase";
import { Bounce, toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Card from "../../components/auth/Card";
import Input from "../../components/auth/Input";
import Button from "../../components/auth/Button";

const auth = getAuth(firebaseApp);

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden", {
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
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Cuenta creada exitosamente", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "Error al crear la cuenta";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo ya está registrado";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña debe tener al menos 6 caracteres";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Correo electrónico inválido";
      }

      toast.error(errorMessage, {
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
      title="Crear Cuenta" 
      subtitle="Regístrate en EduCorp"
    >
      <form className="mt-8 space-y-6" onSubmit={handleRegister}>
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
          
          <Input
            type="password"
            id="confirmPassword"
            label="Confirmar Contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Button type="submit">
            Crear Cuenta
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">¿Ya tienes cuenta? </span>
          <Link to="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </Card>
  );
};

export default Register;