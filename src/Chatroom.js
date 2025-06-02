import { useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import React, { useRef, useState, useEffect } from "react";
import { Chat } from "./components/Chat";
import { Drawings } from "./components/Drawings";
import { auth } from "./firebase-config";
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
  const room = location.state?.room;

  const uid = auth.currentUser?.uid || cookies.get("uid");
  const username = cookies.get("username") || "Anonymous";

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const fullscreenCanvasRef = useRef(null); // New: Add fullscreen canvas ref
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [opacity, setOpacity] = useState(1);
  const [fullscreenMode, setFullscreenMode] = useState(false); // New: Add fullscreen state

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

  // New: Helper function to get active canvas
  const getActiveCanvas = () => 
    fullscreenMode ? fullscreenCanvasRef.current : canvasRef.current;

  // New: Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreenMode(!fullscreenMode);
  };
  

  const startDrawing = (e) => {
    setDrawing(true);
    
    const canvas = getActiveCanvas(); // Updated: Use active canvas
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current = ctx;

    if (tool !== "eraser") {
      ctx.lineWidth = strokeWidths[tool] || 1.0;
      ctx.strokeStyle = convertToRGBA(color, opacity);
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
    const canvas = getActiveCanvas(); // Updated: Use active canvas
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = getActiveCanvas(); // Updated: Use active canvas
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasImage = async () => {
    const canvas = getActiveCanvas(); // Updated: Use active canvas
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
    await sendSystemMessage({ room, text: `${username} left the room` });
    navigate("/"); // go back to room select
  };

  if (!room) {
    navigate("/");
    return null;
  }

  return (
    <>
      <Header />
      <div className="chatroom-container">
        <header className="chatroom-header">
          <h2>Room: {room}</h2>
        </header>

        <div className="chatroom-main">
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
                      style={{
                        backgroundColor: c,
                        color: c === "yellow" ? "black" : "white",
                        border: color === c ? "2px solid #333" : "none",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="opacity-control">
                  <label htmlFor="opacity-slider">Opacity:</label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  />
                  <span>{opacity}</span>
                </div>

                <div className="setting-buttons">
                  {/* New: Add fullscreen button */}
                  <button className="tool-button" onClick={toggleFullscreen}>
                    Fullscreen Mode
                  </button>
                  <button className="tool-button" onClick={clearCanvas}>
                    Clear
                  </button>
                  <button className="tool-button" onClick={saveCanvasImage}>
                    Send Drawing
                  </button>
                  <button className="tool-button" onClick={leaveRoom}>
                    Leave Room
                  </button>
                </div>
              </div>
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