import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import "./styles/App.css";
import Login from "./Login";
import RoomSelect from "./RoomSelect";
import Chatroom from "./Chatroom";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>; // or a spinner

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/rooms" replace /> : <Login />}
        />
        <Route
          path="/rooms"
          element={user ? <RoomSelect /> : <Navigate to="/" replace />}
        />
        <Route path="/chat" element={<Chatroom />} />
      </Routes>
    </Router>
  );
}

export default App;