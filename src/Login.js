import { auth, provider } from './firebase-config.js';
import { signInWithPopup } from 'firebase/auth';
import React from "react";
import './styles/Login.css';
import './styles/App.css';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const collageImages = [
  { src: "/collage/jake.png", className: "collage-img img1", alt: "Jake" },
  { src: "/collage/face.png", className: "collage-img img2", alt: "Face" },
  { src: "/collage/face_carrot.png", className: "collage-img img3", alt: "Face with carrot" },
  { src: "/collage/ball.png", className: "collage-img img4", alt: "Basketball court" },
  { src: "/collage/derp.png", className: "collage-img img5", alt: "Derp smiley" },
  { src: "/collage/coolcat.png", className: "collage-img img6", alt: "Cool Cat" },
  { src: "/collage/cat.png", className: "collage-img img7", alt: "Cat" },
  { src: "/collage/money.png", className: "collage-img img8", alt: "Money" },
  { src: "/collage/potato.png", className: "collage-img img9", alt: "Mr. Potato Head" },
  { src: "/collage/tree.png", className: "collage-img img10", alt: "Palm Tree" },
  { src: "/collage/angel.png", className: "collage-img img11", alt: "Angel" },
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
        const enteredUsername = "Anonymous" + Math.floor(Math.random() * 999);
        cookies.set("username", enteredUsername);
      }
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
    </div>
  );
}

export default Login;
