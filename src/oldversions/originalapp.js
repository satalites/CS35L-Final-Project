import React, { useState, useRef  } from 'react';
import './styles/App.css';
import { Auth } from './oldversions/Auth'
import { Chat } from './components/Chat'
import { Drawings } from './components/Drawings'
import { signOut } from 'firebase/auth'
import { addDoc, serverTimestamp, collection } from 'firebase/firestore' 
import Cookies from 'universal-cookie'
import { auth, db } from "./firebase-config"
import doraemonGif from './assets/doraemon.gif'

const cookies = new Cookies();
const colors = [
  "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black"
];
let newUsername = "";

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null)
  const messagesRef = collection(db, "messages");
  const imagesRef = collection(db, "images");

  const roomInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const ctxRef = useRef(null);
  const uid = auth.currentUser?.uid || cookies.get("uid");

  const strokeWidths = {
    pen: 0.3,
    pencil: 3.0,
    marker: 5.0,
    brush: 7.5,
  };

  const startDrawing = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;

    if (tool !== "eraser") {
      ctx.lineWidth = strokeWidths[tool] || 1.0;
      ctx.strokeStyle = color;
    }
  };


  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;


    if (tool === "eraser") {
      ctx.clearRect(
        e.nativeEvent.offsetX - 10,
        e.nativeEvent.offsetY - 10,
        20,
        20
      );
    } else {
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    }
  };


  const stopDrawing = () => {
    setDrawing(false);
  };


  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };


  const switchToPencil = () => {
    setTool("pencil");
  };


  const switchToEraser = () => {
    setTool("eraser");
  };
  

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    if(room){
      leaveRoom();
    }
    setRoom(null);
  };

  const changeName = () => {
    newUsername = nameInputRef.current.value;
    cookies.set("username", newUsername);
  }

  const leaveRoom = async (e) => {
    await addDoc(messagesRef, {
      text: cookies.get("username") + " left chat",
      createdAt: serverTimestamp(),
      user: "CHATG0D",
      room: room,
      uid: "IgFDnls934dsyhs3otFHIRe87uV2",
    });
    setRoom(null);
  }

  const joinRoom = async (e) => {
    const roomValue = roomInputRef.current.value;
    setRoom(roomValue);

    console.log("JOINED ROOM");
    await addDoc(messagesRef, {
      text: cookies.get("username") + " joined chat",
      createdAt: serverTimestamp(),
      user: "CHATG0D",
      room: roomValue,
    });
  }

  const saveCanvasImage = async () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL("image/png");
    await addDoc(imagesRef, {
      image: imageDataUrl,
      createdAt:serverTimestamp(),
      user: cookies.get("username"),
      room: room,
      uid: uid,
    });
    clearCanvas();
  }


  if(!isAuth){
    return (
      <div>
        <Auth setIsAuth={setIsAuth}/>
      </div>
      );
  }
  return (
      <>
      <head>
        <link rel="icon" href="assets/bluebladee.png"/>
        <link rel="stylesheet" href="./App.css" />
        <title>1000words</title>
      </head>
        {room ? (
          <div className="main-room">
  <div className="drawing-area">
  <div className="drawings-scroll">
    <Drawings room={room} />
  </div>

  <div className="canvas-controls">
    <canvas
      ref={canvasRef}
      width={550}
      height={250}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
    
    <div className="tools">
      <button onClick={() => setTool("pen")}>Pen</button>
      <button onClick={() => setTool("pencil")}>Pencil</button>
      <button onClick={() => setTool("marker")}>Marker</button>
      <button onClick={() => setTool("brush")}>Paint Brush</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>

      <div className="color-buttons">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              backgroundColor: c,
              color: c === "yellow" ? "black" : "white",
              border: color === c ? "2px solid #333" : "none",
              marginRight: "5px",
              padding: "5px 10px",
              borderRadius: "5px"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <button onClick={clearCanvas}>Clear</button>
      <button onClick={saveCanvasImage}>Send Drawing</button>
      <button onClick={leaveRoom}>Leave Room ☘︎</button>
      <div className="sign-out">
        <button onClick={signUserOut}>Sign Out</button>
      </div>
    </div>
  </div>
</div>

    <div className="chat-area">
      <Chat room={room} />
    </div>
  </div>
          
        ) : (
        <div class="room">
            <label>
              ᓚ₍⑅^- .-^₎ -ᶻ 𝗓 𐰁✧ <br></br>
              Enter Room Name:
              </label>
            <input ref={roomInputRef}/>
            
            <button onClick={joinRoom}> ≽^•⩊•^≼ enter chatroom ₍^. .^₎⟆</button>
            <label>
              <br></br>
              Enter Username:
              </label>
            <input ref={nameInputRef}/>
            
            <button onClick={changeName}> submit name ＊*•̩̩͙✩•̩̩͙*˚</button>
           <div class="button-container">
              <div className="sign-out">
              <button onClick={() => setRoom("lobby1")}>Room1</button>
              <button onClick={() => setRoom("lobby2")}>Room2</button>
              <button onClick={() => setRoom("lobby3")}>Room3</button>
              <button onClick={() => setRoom("lobby4")}>Room4</button>


                <button onClick={signUserOut}>sign out</button>
              </div>
            </div>
            <div class = "gif-container">
              <img src ={doraemonGif} alt="Doraemon" class="doraemon"></img>
            </div>
        </div>
        )}
      </>
  );
}

export default App;
