// components/Header.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import Cookies from "universal-cookie";
import { auth } from "../firebase-config";
import "../styles/Header.css";

const cookies = new Cookies();

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    // cookies.remove("username");
    navigate("/");
  };

  // Do not show on login page
  if (location.pathname === "/") return null;

  return (
    <div className="header-container">
      <button className="logout-btn" onClick={handleLogout}>Logout :0</button>
    </div>
  );
}

export default Header;