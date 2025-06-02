import { auth, provider } from './firebase-config.js';
import { signInWithPopup } from 'firebase/auth';
import React, { useEffect} from "react";
import './styles/Login.css';
import './styles/App.css';
// import { useState } from 'react';

import Cookies from 'universal-cookie'
const cookies = new Cookies();
function Login() {

  useEffect(() => {
      const collageImages = [
        { src: "/assets/jake.png", className: "img-top-left" },
        { src: "/assets/face.png", className: "img-top-right" },
        { src: "/assets/face_carrot.png", className: "img-bottom-left" },
        { src: "/assets/ball.png", className: "img-bottom-right" },
        { src: "/assets/derp.png", className: "img-center-left" },
        { src: "/assets/coolcat.png", className: "img-center-right" }
      ];

      const addedImages = collageImages.map(imgData => {
        const img = document.createElement("img");
        img.src = imgData.src;
        img.className = `collage-image ${imgData.className}`;
        img.alt = "collage sticker";
        document.body.appendChild(img);
        return img;
      });

      return () => {
        addedImages.forEach(img => document.body.removeChild(img));
      };
    }, []);
    
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      cookies.set("uid", result.user.uid);

      let savedUsername = cookies.get("username");
      if (!savedUsername) {
        const enteredUsername = "Anonymous" + Math.floor(Math.random() * 999);
        cookies.set("username", enteredUsername);
      }

      // Firebase auth will handle the redirect logic in App.js
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login">
      <div className="login-content">
        <h1>welcome to 1000 words</h1>
        <button onClick={signInWithGoogle}>google sign in</button>
      </div>
    </div>
  );
}


export default Login;
