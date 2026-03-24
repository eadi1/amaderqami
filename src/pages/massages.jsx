import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../socket.jsx";
import Cookies from "js-cookie";
import ApiManager from "../apimanger";

export default function ChatPage() {
  const socket = useSocket();
  const [usersList, setUsersList] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const messagesContainerRef = useRef(null);
  const currentUserId = Number(Cookies.get("userId"));
  const typingTimeout = useRef(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await ApiManager.get("/user/users");
        setUsersList(data.filter((u) => u.id !== currentUserId));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Receive message
    const receiveMessageHandler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const messagesSeenHandler = ({ by }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === currentUserId && msg.receiverId === by
            ? { ...msg, seen: true }
            : msg
        )
      );
    };

    const typingHandler = ({ senderId }) => setTypingUser(senderId);
    const stopTypingHandler = ({ senderId }) => {
      if (typingUser === senderId) setTypingUser(null);
    };

    socket.on("receive_message", receiveMessageHandler);
    socket.on("messages_seen", messagesSeenHandler);
    socket.on("user_typing", typingHandler);
    socket.on("user_stop_typing", stopTypingHandler);

    return () => {
      socket.off("receive_message", receiveMessageHandler);
      socket.off("messages_seen", messagesSeenHandler);
      socket.off("user_typing", typingHandler);
      socket.off("user_stop_typing", stopTypingHandler);
    };
  }, [socket, currentUserId, typingUser]);

  // Load chat history
  const loadChatHistory = async (userId) => {
    try {
      const res = await ApiManager.get(`/messages/${currentUserId}/${userId}`);
      setMessages(res.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // Select user
  const handleSelectUser = async (user) => {
    setActiveUser(user);
    await loadChatHistory(user.id);

    // Mark as seen
    if (socket) {
      socket.emit("mark_seen", { currentUserId, chatWithId: user.id });
    }
    await ApiManager.post("/messages/mark-seen", {
      senderId: user.id,
      receiverId: currentUserId,
    });
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    if (!activeUser || !socket) return;

    socket.emit("typing", {
      senderId: currentUserId,
      receiverId: activeUser.id,
    });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", {
        senderId: currentUserId,
        receiverId: activeUser.id,
      });
    }, 1500);
  };

  // Send message
  const handleSend = async () => {
    if (!newMsg.trim() || !activeUser) return;

    const msg = {
      senderId: currentUserId,
      receiverId: activeUser.id,
      text: newMsg,
      seen: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);

    if (socket) socket.emit("send_message", msg);

    try {
      await ApiManager.post("/messages/send", msg);
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    setNewMsg("");
  };

  const chatMessages = activeUser
    ? messages.filter(
        (msg) =>
          (msg.senderId === currentUserId && msg.receiverId === activeUser.id) ||
          (msg.senderId === activeUser.id && msg.receiverId === currentUserId)
      )
    : [];

  const getUnseenCount = (userId) =>
    messages.filter(
      (msg) =>
        msg.senderId === userId && msg.receiverId === currentUserId && !msg.seen
    ).length;

  return (
    <main className="main-container">
      <div className="chat-container">
        <div className="users-list">
          {usersList.map((user) => (
            <div
              key={user.id}
              className={`user-item ${activeUser?.id === user.id ? "active" : ""}`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="user-info">
                <img
                  src={user.picture || "/default-avatar.png"}
                  alt="profile"
                  className="avatar"
                />
                <span>{user.name}</span>
              </div>
              {getUnseenCount(user.id) > 0 && (
                <span className="badge">{getUnseenCount(user.id)}</span>
              )}
            </div>
          ))}
        </div>

        <div className="chat-box">
          {activeUser ? (
            <>
              <div className="chat-header">
                <h2>{activeUser.name}</h2>
                <img
                  src={activeUser.picture || "/default-avatar.png"}
                  alt="profile"
                  className="avatar"
                />
              </div>

              <div className="messages" ref={messagesContainerRef}>
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message ${msg.senderId === currentUserId ? "self" : "other"}`}
                  >
                    {msg.text}
                    {msg.senderId === currentUserId && (
                      <small className="status">{msg.seen ? "✓✓" : "✓"}</small>
                    )}
                  </div>
                ))}
                {typingUser === activeUser.id && (
                  <div className="typing">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                )}
              </div>

              <div className="input-box">
                <input
                  type="text"
                  value={newMsg}
                  placeholder="Type a message..."
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a user to start chatting</p>
          )}
        </div>
      </div>
    </main>
  );
}
