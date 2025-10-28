import "./App.css";

import { firebaseApp } from "./config/firebase.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Login from "./pages/auth/Login.jsx";
import { useState } from "react";
import Dashboard from "./layouts/Dashboard.jsx";
import Auth from "./layouts/Auth.jsx";

const auth = getAuth(firebaseApp);

function App() {

  const [user, setUser] = useState(null);
  
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      setUser(firebaseUser);
    } else {
      setUser(null);
    }
  });

  return <>{user ? <Dashboard email={user.email}/> : <Auth />}</>;
}

export default App;
