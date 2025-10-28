import { getAuth, signOut } from 'firebase/auth'
import React from 'react'
import { firebaseApp } from '../../config/firebase'
import { useAuth } from '../../context/AuthContext'

const auth = getAuth(firebaseApp)

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Bienvenido al Dashboard</h1>
      <p>Usuario: {user?.email}</p>
      <button type='button' onClick={() => signOut(auth)}>
        Cerrar sesión
      </button>
    </div>
  ) 
}

export default Home