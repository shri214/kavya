import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Confetti from "./confetti";

const GIRL_EMOJI = "👩‍❤️‍👨";

function getRandomEdgePosition(btnRect, containerRect) {
  const margin = 20;
  const maxX = containerRect.width - 80;
  const maxY = containerRect.height - 50;
  let x, y;
  do {
    x = margin + Math.random() * (maxX - margin * 2);
    y = margin + Math.random() * (maxY - margin * 2);
  } while (
    Math.abs(x - btnRect.left) < 100 &&
    Math.abs(y - btnRect.top) < 60
  );
  return { x, y };
}

export default function App() {
  const [noCount, setNoCount] = useState(0);
  const [yesClicked, setYesClicked] = useState(false);
  const [noPos, setNoPos] = useState({ x: null, y: null });
  const [kickAnim, setKickAnim] = useState(false);
  const [noGone, setNoGone] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [yesScale, setYesScale] = useState(1);

  const containerRef = useRef(null);
  const noRef = useRef(null);
  const yesRef = useRef(null);

  

  // Log to Firebase
  const logEvent = async (type, extra = {}) => {
    try {
      await addDoc(collection(db, "proposal_logs"), {
        type,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        ...extra,
      });
    } catch (e) {
      console.error("Firebase log error:", e);
    }
  };

  const handleNo = () => {
    const newCount = noCount + 1;
    setNoCount(newCount);
    logEvent("NO_CLICKED", { noCount: newCount });

    // Grow YES button slightly with each NO
    setYesScale((prev) => Math.min(prev + 0.15, 2.5));

    if (containerRef.current && noRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const btn = noRef.current.getBoundingClientRect();
      const rel = {
        left: btn.left - container.left,
        top: btn.top - container.top,
      };
      const newPos = getRandomEdgePosition(rel, container);
      setNoPos(newPos);
    }
  };

  const handleYes = () => {
    logEvent("YES_CLICKED", { noCountBeforeYes: noCount });
    setKickAnim(true);
    setTimeout(() => {
      setNoGone(true);
      setYesClicked(true);
      setConfetti(true);
    }, 1200);
  };

  const handleSubmitMessage = async () => {
    if (!message.trim()) return;
    await logEvent("LOVE_MESSAGE", { message });
    setSubmitted(true);
  };

  const noLabel = [
    "No",
    "Still No 😏",
    "Nope!",
    "Try again 😂",
    "Not happening!",
    "Ugh, fine... still no",
    "NOOOO 😤",
    "You wish!",
    "Never! 😜",
    "Ok fine... just kidding, NO",
  ][Math.min(noCount, 9)];

  return (
    <div
      className="app-root"
      ref={containerRef}
      style={{ position: "relative", minHeight: "100dvh", overflow: "hidden" }}
    >
      {confetti && <Confetti />}

      {!yesClicked ? (
        <div className="proposal-screen">
          <div className="emoji-float">{GIRL_EMOJI}</div>
          <h1 className="proposal-title">
            Will you be<br />
            <span className="highlight">my Wife?</span>
          </h1>
          <p className="sub-text">
            {noCount === 0
              ? "I've been waiting to ask you this... 💌"
              : noCount < 3
              ? "Aww come on... 🥺"
              : noCount < 6
              ? "The YES button is growing bigger 👀"
              : "Just say yes already!! 😭"}
          </p>

          <div className="btn-area">
            <button
              ref={yesRef}
              className="btn yes-btn"
              style={{ transform: `scale(${yesScale})` }}
              onClick={handleYes}
            >
              {kickAnim ? "💘 Yesss!" : "Yes! 💍"}
            </button>

            {!noGone && (
              <button
                ref={noRef}
                className={`btn no-btn ${kickAnim ? "kicked" : ""}`}
                style={
                  noPos.x !== null
                    ? {
                        position: "absolute",
                        left: noPos.x,
                        top: noPos.y,
                        transition: "left 0.4s cubic-bezier(.68,-0.55,.27,1.55), top 0.4s cubic-bezier(.68,-0.55,.27,1.55)",
                      }
                    : {}
                }
                onClick={handleNo}
              >
                {noLabel}
              </button>
            )}
          </div>

          {noCount > 0 && (
            <p className="no-counter">
              She said no <strong>{noCount}</strong> time{noCount !== 1 ? "s" : ""} 😅
            </p>
          )}
        </div>
      ) : (
        <div className="yes-screen">
          <div className="hearts-bg">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="floating-heart" style={{ "--i": i }}>
                ❤️
              </span>
            ))}
          </div>

          <div className="stars-rain">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="star" style={{ "--i": i }}>
                ⭐
              </span>
            ))}
          </div>

          <div className="yes-content">
            <div className="her-image-box">
              <span className="her-emoji">👩‍❤️‍👨</span>
            </div>

            <h1 className="yes-title">She said YES!! 🎉</h1>
            <p className="knew-it">I knew it all along 💕</p>

            <div className="message-box">
              {!submitted ? (
                <>
                  <label className="msg-label">
                    How much do you like me? 🥰
                  </label>
                  <textarea
                    className="msg-input"
                    rows={4}
                    placeholder="Write something sweet... 💌"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button className="submit-btn" onClick={handleSubmitMessage}>
                    Send with Love 💌
                  </button>
                </>
              ) : (
                <div className="submitted-msg">
                  <p>💌 Your message is saved forever!</p>
                  <p className="msg-preview">"{message}"</p>
                  <p>I love you so much 💖</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {kickAnim && !noGone && (
        <div className="kick-overlay">
          <div className="kick-boy">
            <span className="boy">🧑</span>
            <span className="kick-effect">💥</span>
          </div>
        </div>
      )}
    </div>
  );
}