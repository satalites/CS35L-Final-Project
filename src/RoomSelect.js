import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import "./styles/RoomSelect.css";
import Header from "./components/Header";
import userAdjectives from "./components/userAdjectives";
import userNouns from "./components/userNouns";

const cookies = new Cookies();

function RoomSelect() {
  const navigate = useNavigate();
  const privateRoomRef = useRef(null);
  const [nickname, setNickname] = useState("");

  // Load nickname from cookies on mount
  useEffect(() => {
    let username = cookies.get("username");

    if (!username) {
      const adj = userAdjectives[Math.floor(Math.random() * userAdjectives.length)];
      const noun = userNouns[Math.floor(Math.random() * userNouns.length)];
      const number = Math.floor(10 + Math.random() * 90);
      username = `${adj}${noun}${number}`;
      cookies.set("username", username, { path: "/" });
    }
    
    setNickname(username);
  }, []);

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  const saveNickname = () => {
    if (nickname.trim()) {
      cookies.set("username", nickname.trim(), { path: "/" });
    }
  };

  const joinRoom = (roomName) => {
    if (!roomName) return;
    cookies.set("room", roomName);
    navigate("/chat", { state: { room: roomName } });
  };

  return (
    <>
    <Header />
    <div className="room-selection-container">
      <div className="rooms-list">
        <h1 className="room-title">₍ᐢ. .ᐢ₎ ₊˚⊹♡ Select a Room .𖥔 ݁ ˖𓂃.☘︎ ݁˖</h1>
        <div className="nickname-row">
            <label htmlFor="nickname-input" className="nickname-label">Nickname:</label>
            <input
                id="nickname-input"
                className="nickname-input"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="Enter your nickname"
            />
            <button className="nickname-save-btn" onClick={saveNickname}>
                ⟡ Save ⟡
            </button>
            </div>
        {["*•̩̩͙✩•̩̩͙* Room 1 *•̩̩͙✩•̩̩͙*", "*•̩̩͙✩•̩̩͙* Room 2 *•̩̩͙✩•̩̩͙*", "*•̩̩͙✩•̩̩͙* Room 3 *•̩̩͙✩•̩̩͙*", "*•̩̩͙✩•̩̩͙* Room 4 *•̩̩͙✩•̩̩͙*"].map((room, i) => (
          <button 
            key={i} 
            className="room-btn" 
            onClick={() => joinRoom(`lobby${i + 1}`)}
          >
            {room}
          </button>
        ))}

        <div className="private-room-input">
          <input
            type="text"
            ref={privateRoomRef}
            placeholder="Enter private room name"
            className="room-input"
          />
          <button 
            className="room-btn" 
            onClick={() => joinRoom(privateRoomRef.current.value)}
          >
            ⟡₊ ⊹ Join Private Room ⟡₊ ⊹
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default RoomSelect;
