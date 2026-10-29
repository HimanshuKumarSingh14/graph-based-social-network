import { useEffect, useRef, useState, useCallback } from "react";
import { LuSend, LuMessageSquare } from "react-icons/lu";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/useAuth";
import { getFriends } from "../services/users";
import { getConversations, getConversation, sendMessage } from "../services/messages";
import "./Messages.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Messages() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [previews, setPreviews] = useState({});
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const bottomRef = useRef(null);

  const openThread = useCallback(async (friend) => {
    setActive(friend);
    setThreadLoading(true);
    try {
      const res = await getConversation(friend.email);
      setThread(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [f, c] = await Promise.all([getFriends(), getConversations()]);
        setFriends(f.data);
        const map = {};
        c.data.forEach((conv) => { map[conv.email] = conv; });
        setPreviews(map);
        if (f.data.length > 0) openThread(f.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [openThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    const body = text.trim();
    setText("");
    try {
      const res = await sendMessage(active.email, body);
      setThread((t) => [...t, res.data]);
      setPreviews((p) => ({ ...p, [active.email]: { ...p[active.email], lastText: body } }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader label="Loading conversations..." />;

  if (friends.length === 0) {
    return (
      <EmptyState
        icon={LuMessageSquare}
        title="No conversations yet"
        description="Add some friends first, then start a conversation here."
      />
    );
  }

  return (
    <div className="messages-page card">
      <aside className="messages-list">
        {friends.map((f) => (
          <button
            key={f.email}
            className={`messages-list-item ${active?.email === f.email ? "active" : ""}`}
            onClick={() => openThread(f)}
          >
            <span className="avatar" style={{ width: 40, height: 40, background: f.avatarColor }}>
              {initials(f.name)}
            </span>
            <div className="messages-list-info">
              <p className="messages-list-name">{f.name}</p>
              <p className="messages-list-preview">{previews[f.email]?.lastText || "Say hello 👋"}</p>
            </div>
          </button>
        ))}
      </aside>

      <section className="messages-thread">
        {active && (
          <div className="messages-thread-header">
            <span className="avatar" style={{ width: 36, height: 36, background: active.avatarColor }}>
              {initials(active.name)}
            </span>
            <div>
              <p className="messages-list-name">{active.name}</p>
              <p className="messages-list-preview">{active.email}</p>
            </div>
          </div>
        )}

        <div className="messages-thread-body">
          {threadLoading ? (
            <Loader label="Loading messages..." />
          ) : thread.length === 0 ? (
            <p className="na-hint" style={{ margin: "auto" }}>No messages yet. Say hi!</p>
          ) : (
            thread.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.fromEmail === user.email ? "mine" : "theirs"}`}>
                {m.text}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <form className="messages-input-row" onSubmit={handleSend}>
          <input
            className="input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">
            <LuSend size={15} />
          </button>
        </form>
      </section>
    </div>
  );
}

export default Messages;
