import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import "./styles/RoomSelect.css";
import Header from "./components/Header";

const cookies = new Cookies();

function RoomSelect() {
  const navigate = useNavigate();
  const privateRoomRef = useRef(null);
  const [nickname, setNickname] = useState("");

  // Load nickname from cookies on mount
  useEffect(() => {
    const username = cookies.get("username");
    if (username) {
      setNickname(username);
    }
    if (!username) {
        setNickname("Anonymous" + Math.floor(Math.random() * 999));
    }
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
    navigate("/chat", { state: { room: roomName } });
  };

  return (
    <>
    <Header />
    <div className="room-selection-container">
      <div className="rooms-list">
        <h1 className="room-title">₍ᐢ. .ᐢ₎ ₊˚⊹♡ Select a&nbsp;&nbsp; Room .𖥔 ݁ ˖𓂃.☘︎ ݁˖</h1>
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
            ⟡₊ ⊹ Join &nbsp;&nbsp;Private &nbsp;&nbsp;Room ⟡₊ ⊹
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default RoomSelect;
