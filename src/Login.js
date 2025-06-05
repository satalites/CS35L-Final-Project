import { auth, provider } from './firebase-config.js';
import { signInWithPopup } from 'firebase/auth';
import './styles/Login.css';
import './styles/App.css';
// import { useState } from 'react';
import userAdjectives from './components/userAdjectives.js';
import userNouns from './components/userNouns.js';

import Cookies from 'universal-cookie'
const cookies = new Cookies();

const collageImages = [
  { src: "/collage/sircat.png", className: "collage-img img1", alt: "Sir Cat" },
  { src: "/collage/face.png", className: "collage-img img2", alt: "Face" },
  { src: "/collage/deltarune.png", className: "collage-img img3", alt: "Deltarune" },
  { src: "/collage/meme.png", className: "collage-img img4", alt: "meme" },
  { src: "/collage/wii.png", className: "collage-img img6", alt: "wii" },
  { src: "/collage/ryuk.png", className: "collage-img img7", alt: "ryuk" },
  { src: "/collage/rain.png", className: "collage-img img8", alt: "rain" },
  { src: "/collage/roses.png", className: "collage-img img9", alt: "roses" },
  { src: "/collage/ball.png", className: "collage-img img10", alt: "ball" },
  { src: "/collage/angel.png", className: "collage-img img11", alt: "Angel" },
  { src: "/collage/burger.png", className: "collage-img img13", alt: "Burger" },
  // Add more as needed to match your collage
];

function Login() {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      cookies.set("uid", result.user.uid);

      let savedUsername = cookies.get("username");
      if (!savedUsername) {
        const adj = userAdjectives[Math.floor(Math.random() * userAdjectives.length)];
        const noun = userNouns[Math.floor(Math.random() * userNouns.length)];
        const generatedUsername = `${adj}${noun}${Math.floor(10 + Math.random() * 90)}`;

        cookies.set("username", generatedUsername);
      }

      // Firebase auth will handle the redirect logic in App.js
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login">
      <div className="collage-container">
        {collageImages.map((img, idx) => (
          <img key={idx} src={img.src} className={img.className} alt={img.alt} draggable="false" />
        ))}
      </div>
      <div className="login-content">
        <h1>WELCOME TO 1000WORDS</h1>
        <button onClick={signInWithGoogle}>Let's get drawing!</button>
      </div>
      {/* <h3>a picture is worth a 1000words</h3> */}
    </div>
  );
}


export default Login;