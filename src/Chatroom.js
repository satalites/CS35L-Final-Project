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
    await sendSystemMessage({ room, text: `${username} left the room` });
    navigate("/"); // go back to room select
  };

  if (!room) {
    navigate("/");
    return null;
  }

  // Fullscreen mode render
  if (fullscreenMode) {
    return (
      <div style={{ display: "flex", height: "100vh", width: "100vw", backgroundColor: "#f8f9fa" }}>
        {/* Sidebar with tools and colors */}
        <div
          className="tool-sidebar"
          style={{
            width: "220px",
            padding: "15px",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            borderRight: "2px solid #e9ecef",
            boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px", color: "#495057" }}>
            Drawing Tools
          </h3>

          {/* Tool buttons */}
          <div className="fullscreen-tools">
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6c757d" }}>Brush Type:</h4>
            {["pen", "pencil", "marker", "brush", "eraser"].map((t) => (
              <button
                key={t}
                onClick={() => setTool(t)}
                style={{
                  margin: "3px 0",
                  padding: "10px 15px",
                  backgroundColor: tool === t ? "#007bff" : "#f8f9fa",
                  color: tool === t ? "white" : "#495057",
                  border: tool === t ? "2px solid #007bff" : "2px solid #e9ecef",
                  borderRadius: "6px",
                  cursor: "pointer",
                  width: "100%",
                  fontSize: "14px",
                  fontWeight: tool === t ? "bold" : "normal",
                  transition: "all 0.2s ease"
                }}
              >
                {t === "eraser" ? " " : " "}{t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Color buttons */}
          <div className="color-buttons" style={{ marginTop: "20px" }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#6c757d" }}>Colors:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    backgroundColor: c,
                    color: c === "yellow" ? "black" : "white",
                    border: color === c ? "3px solid #333" : "2px solid #fff",
                    margin: "1px",
                    padding: "10px 8px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textShadow: c === "yellow" ? "none" : "1px 1px 1px rgba(0,0,0,0.5)",
                    transform: color === c ? "scale(1.05)" : "scale(1)",
                    transition: "all 0.2s ease"
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity slider */}
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#6c757d" }}>
              Opacity: <span style={{ color: "#007bff", fontWeight: "bold" }}>{Math.round(opacity * 100)}%</span>
            </h4>
            <input
              id="fullscreen-opacity-slider"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              style={{ 
                width: "100%", 
                height: "6px",
                backgroundColor: "#e9ecef",
                borderRadius: "3px",
                outline: "none"
              }}
            />
          </div>

          {/* Preview area */}
          <div style={{ 
            marginTop: "15px", 
            padding: "10px", 
            backgroundColor: "#f8f9fa", 
            borderRadius: "6px",
            border: "1px solid #e9ecef"
          }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#6c757d" }}>Preview:</h4>
            <div style={{
              width: "100%",
              height: "30px",
              backgroundColor: "white",
              border: "1px solid #dee2e6",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{
                width: `${strokeWidths[tool] * 4}px`,
                height: `${strokeWidths[tool] * 4}px`,
                backgroundColor: convertToRGBA(color, opacity),
                borderRadius: "50%",
                maxWidth: "25px",
                maxHeight: "25px"
              }}></div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: "20px" }}>
            <button 
              onClick={clearCanvas}
              style={{
                width: "100%",
                margin: "4px 0",
                padding: "10px 15px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
               Clear Canvas
            </button>
            <button 
              onClick={saveCanvasImage}
              style={{
                width: "100%",
                margin: "4px 0",
                padding: "10px 15px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
               Send Drawing
            </button>
          </div>
          
          {/* Back button */}
          <div style={{ marginTop: "auto", paddingTop: "20px" }}>
            <button 
              onClick={() => setFullscreenMode(false)}
              style={{
                width: "100%",
                padding: "12px 15px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              ← Back to Chat
            </button>
          </div>
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
                style={{
                  cursor: tool === "eraser" ? "crosshair" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\"><circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"" + color + "\"/></svg>') 8 8, crosshair"
                }}
              />

              <div className="drawing-tools">
                <div className="tool-buttons">
                  {["pen", "pencil", "marker", "brush", "eraser"].map((t) => (
                    <button
                      key={t}
                      className={`tool-button ${tool === t ? 'active' : ''}`}
                      onClick={() => setTool(t)}
                      style={{
                        backgroundColor: tool === t ? "#007bff" : "",
                        color: tool === t ? "white" : "",
                        fontWeight: tool === t ? "bold" : "normal"
                      }}
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
                        border: color === c ? "3px solid #333" : "1px solid #ccc",
                        transform: color === c ? "scale(1.1)" : "scale(1)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="opacity-control">
                  <label htmlFor="opacity-slider">
                    Opacity: <strong>{Math.round(opacity * 100)}%</strong>
                  </label>
                  <input
                    id="opacity-slider"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  />
                </div>

                <div className="setting-buttons">
                  <button 
                    className="tool-button" 
                    onClick={toggleFullscreen}
                    style={{
                      backgroundColor: "#17a2b8",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  >
                    Fullscreen
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