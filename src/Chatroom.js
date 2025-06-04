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
  const fullscreenCanvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [opacity, setOpacity] = useState(1);
  const [fullscreenMode, setFullscreenMode] = useState(false);

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

  // Helper function to convert color to RGBA with opacity
  const convertToRGBA = (colorName, opacity) => {
    const colorMap = {
      red: "255,0,0",
      orange: "255,165,0", 
      yellow: "255,255,0",
      green: "0,128,0",
      blue: "0,0,255",
      purple: "128,0,128",
      pink: "255,192,203",
      brown: "165,42,42",
      black: "0,0,0"
    };
    const rgb = colorMap[colorName] || "0,0,0";
    return `rgba(${rgb},${opacity})`;
  };

  // Helper function to get active canvas
  const getActiveCanvas = () => 
    fullscreenMode ? fullscreenCanvasRef.current : canvasRef.current;

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };
  

  const startDrawing = (e) => {
    setDrawing(true);
    
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;

    if (tool !== "eraser") {
      ctx.lineWidth = strokeWidths[tool] || 1.0;
      ctx.strokeStyle = convertToRGBA(color, opacity);
      ctx.lineCap = "round"; // Smoother line endings
      ctx.lineJoin = "round"; // Smoother line joins
    }
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    if (tool === "eraser") {
      ctx.clearRect(x - 10, y - 10, 20, 20);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath(); // Important: reset path for smoother drawing
      ctx.moveTo(x, y); // Move the "pen" to current mouse position
    }
  };

  const stopDrawing = () => {
    setDrawing(false);
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasImage = async () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
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

  // Fullscreen mode render
  if (fullscreenMode) {
    return (
      <div className="fullscreen-container">
        {/* Sidebar with tools and colors */}
        <div className="tool-sidebar" >
          <h3>Drawing Tools</h3>
            <div className="fullscreen-tools">
            {["pen", "pencil", "marker", "brush", "eraser"].map((t) => (
              <button
                key={t}
                className={`tool-button ${tool === t ? "active" : ""}`}
                onClick={() => setTool(t)}
               >
              {t}
            </button>
            ))}
          </div>

          <h4>Colors</h4>
        <div className="color-buttons-grid">
          {colors.map((color) => (
            <button
              key={color}
              className={'color-button ${color} ${color === color ? "selected" : ""}'}
              style={{ backgroundColor: color }}
              onClick={() => setColor(color)}
            />
          ))}
        </div>

        <h4>Opacity</h4>
        <input
          id="fullscreen-opacity-slider"
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />

         <div className="preview-container">
          <strong>Preview:</strong>
            <div
              className="preview-dot"
              style={{
              backgroundColor: color,
              opacity: opacity
             }}
          ></div>
        </div>


          <button className="action-button clear-button" onClick={clearCanvas}>
          Clear
        </button>
        <button className="action-button send-button" onClick={saveCanvasImage}>
          
          Send Drawing
        </button>
        <button className="action-button back-button" onClick={() => setFullscreenMode(false)}>
          Back to Chat
        </button>
      </div>

        {/* Fullscreen Canvas */}
        <canvas
          ref={fullscreenCanvasRef}
          width={window.innerWidth - 220}
          height={window.innerHeight}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ 
            display: "block", 
            flexGrow: 1, 
            cursor: tool === "eraser" ? "crosshair" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\"><circle cx=\"10\" cy=\"10\" r=\"3\" fill=\"" + color + "\"/></svg>') 10 10, crosshair",
            backgroundColor: "#ffffff"
          }}
        />
      </div>
    );
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
          <button className="tool-button" onClick={() => setFullscreenMode(true)}>
            Fullscreen Mode
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
                style={{
                  cursor: tool === "eraser" ? "crosshair" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"" + color + "\"/></svg>') 8 8, crosshair"
                }}
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
