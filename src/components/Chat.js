import { useEffect, useState, useRef } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
import '../styles/Chat.css';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const Chat = (props) => {
    const {room} = props;
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const messagesRef = collection(db, "messages");
    const username = cookies.get("username") || ("Anonymous" + Math.floor(Math.random() * 999));
    // const uid = cookies.get("uid");
    const uid = auth.currentUser?.uid;

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const queryMessages = query(messagesRef, where("room", "==", room), orderBy("createdAt"));
        const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
            let messages = [];
            snapshot.forEach((doc) => {
                messages.push({...doc.data(), id: doc.id})
            });
            setMessages(messages);
        });
        //Clean-up
        return () => unsubscribe();
    }, []);

        // Scroll to bottom whenever messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(newMessage === "") return;

        await addDoc(messagesRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            user: username,
            room: room,
            uid: uid,
        });

        setNewMessage("");
    };

    return (
        <div className="chat-app">
          <div className="messages">
            {messages.map((message) => {
              const isChatG0D = message.user === "CHATG0D";
              return (
                <div
                  key={message.id}
                  className={`message ${isChatG0D ? "chatgod-message" : ""}`}
                >
                  {!isChatG0D && <span className="user">{message.user}: </span>}
                  <span className="message-text">{message.text}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
      
          <form onSubmit={handleSubmit} className="new-message-form">
            <input
              className="new-message-input"
              placeholder="chat chat chat°❀⋆.ೃ࿔*:･"
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            />
            <button type="submit" className="send-button">
              send
            </button>
          </form>
        </div>
      );
      
};