import { useEffect, useState, useRef } from "react";
import { addDoc, collection, serverTimestamp, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase-config';
// import '../styles/Drawings.css';
import Cookies from 'universal-cookie';
const cookies = new Cookies();

export const Drawings = (props) => {
    const {room} = props;
    const [drawings, setDrawings] = useState([]);
    const imagesRef = collection(db, "images");
    const uid = auth.currentUser?.uid;
    const drawingsEndRef = useRef(null);

useEffect(() => {
  const queryImages = query(imagesRef, where("room", "==", room), orderBy("createdAt"));
  const unsubscribe = onSnapshot(queryImages, (snapshot) => {
    console.log("🧩 Query triggered for room:", room);
    if (snapshot.empty) {
      console.warn("⚠️ No drawings found for this room.");
    }

    let imageMessages = [];
    snapshot.forEach((doc) => {
      console.log("✅ Found drawing:", doc.data());
      imageMessages.push({ ...doc.data(), id: doc.id });
    });
    setDrawings(imageMessages);
  });

  return () => unsubscribe();
}, [room]);

    useEffect(() => {
        drawingsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [drawings]);

  return (
    <div className="chat-app">
      <h2>drawings</h2>
      <div className="messages">
        {drawings.map((drawing) => {
          return (
            <div
              key={drawing.id}
            >
              <span className="user">{drawing.user} sent a drawing:</span>
              <div className="message-text">
                <img
                  src={drawing.image}
                  alt="Drawing"
                  style={{ maxWidth: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
                />
              </div>
            </div>
          );
        })}
        <div ref={drawingsEndRef} />
      </div>
    </div>
  );
};
