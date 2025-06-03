import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import React, { useRef, useState, useEffect } from "react";
import { Chat } from "./components/Chat";
import { Drawings } from "./components/Drawings";
import { MusicPlayer } from "./components/MusicPlayer";
import { auth, db } from "./firebase-config";
import Cookies from "universal-cookie";
import "./styles/App.css";
import "./styles/Chat.css";
import { sendSystemMessage, uploadDrawing } from "./server";

const cookies = new Cookies();
const colors = [
  "red", "orange", "yellow", "green", "blue", "purple", "pink", "brown", "black"
];

export const Chatroom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room || cookies.get("room");
  const uid = auth.currentUser?.uid || cookies.get("uid");
  const username = cookies.get("username") || "Anonymous";

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");

  const strokeWidths = {
    pen: 0.3,
    pencil: 3.0,
    marker: 5.0,
    brush: 7.5,
  };

  const hasSentJoinMessage = useRef(false);

  useEffect(() => {
    const sendJoinMessage = async () => {
      if (!room || !username || hasSentJoinMessage.current) return;
  
      hasSentJoinMessage.current = true;
  
      // HERE
        await sendSystemMessage({ room, text: `${username} joined the room` });
      };
    sendJoinMessage();
  }, [room, username]);
  

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

  const saveCanvasImage = async () => {
    const canvas = canvasRef.current;
    const imageDataUrl = canvas.toDataURL("image/png");
  await uploadDrawing({
    image: imageDataUrl,
    room,
    user: username,
    uid,
  });
    clearCanvas();
  };

  const leaveRoom = async () => {
    cookies.set("room", ""); 
    await sendSystemMessage({ room, text: `${username} left the room` });
    navigate("/"); // go back to room select
  };

  if (!room || room == "") {
    navigate("/");
    return null;
  }

  return (
    <>
      <Header />
      <div className="chatroom-container">
        <header className="chatroom-header">
          <h3>Room: {room}</h3>
        </header>

        <div className="chatroom-main">
          {/*Sidebar*/}
          <div className="sidebar">
            <div className="music-player">
              < MusicPlayer />
            </div>

            <div className="bottom-sidebar">
              <div className="drawing-tools">
                  <div className="tool-buttons">
                    {["pen", "pencil", "marker", "brush", "eraser"].map((t) => (
                      <button
                        key={t}
                        className="tool-button"
                        onClick={() => setTool(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="color-buttons">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={color === c ? "selected" : ""}
                        style={{ 
                          backgroundColor: c,
                          outline: color === c ? "3px solid white" : "none"
                        }}
                      ></button>
                    ))}
                  </div>
              </div>
            </div>

        <div className="setting-buttons">
          <button className="tool-button" onClick={saveCanvasImage}>
            Send Drawing
          </button>
          <button className="tool-button" onClick={clearCanvas}>
            Clear Drawing Pad
          </button>
          <button className="tool-button" onClick={leaveRoom}>
            Leave Room
          </button>
          </div>
        </div>

          {/* Left panel */}
          <div className="left-panel">
            <div className="drawings-scroll">
              <Drawings room={room} />
            </div>

            <div className="canvas-area">
              <canvas
                ref={canvasRef}
                width={550}
                height={250}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="drawing-canvas"
              />
            </div>
          </div>

          {/* Right panel */}
          <div className="right-panel">
            <Chat room={room} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatroom;
