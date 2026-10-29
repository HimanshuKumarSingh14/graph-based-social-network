import { useEffect, useState, useCallback } from "react";
import { LuUserRound, LuCheck, LuX, LuUserMinus } from "react-icons/lu";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getFriends, deleteFriend } from "../services/users";
import {
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/friends";
import "./Friends.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Friends() {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [tab, setTab] = useState("friends");
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [f, p, s] = await Promise.all([getFriends(), getPendingRequests(), getSentRequests()]);
      setFriends(f.data);
      setPending(p.data);
      setSent(s.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAccept = async (email) => { await acceptFriendRequest(email); fetchAll(); };
  const handleReject = async (email) => { await rejectFriendRequest(email); fetchAll(); };
  const handleRemove = async (email) => { await deleteFriend(email); fetchAll(); };

  const tabs = [
    { key: "friends", label: `Friends (${friends.length})` },
    { key: "pending", label: `Requests (${pending.length})` },
    { key: "sent", label: `Sent (${sent.length})` },
  ];

  return (
    <div className="friends-page">
      <div className="friends-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`friends-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader label="Loading friends..." />
      ) : (
        <>
          {tab === "friends" && (
            friends.length === 0 ? (
              <EmptyState icon={LuUserRound} title="No friends yet" description="Head to Users to send some friend requests." />
            ) : (
              <div className="friends-grid">
                {friends.map((f) => (
                  <div className="friend-row card" key={f.email}>
                    <span className="avatar" style={{ width: 44, height: 44, background: f.avatarColor }}>{initials(f.name)}</span>
                    <div className="friend-info">
                      <p className="friend-name">{f.name}</p>
                      <p className="friend-email">{f.email}</p>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => handleRemove(f.email)}>
                      <LuUserMinus size={15} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "pending" && (
            pending.length === 0 ? (
              <EmptyState icon={LuUserRound} title="No pending requests" description="You're all caught up." />
            ) : (
              <div className="friends-grid">
                {pending.map((f) => (
                  <div className="friend-row card" key={f.email}>
                    <span className="avatar" style={{ width: 44, height: 44, background: f.avatarColor }}>{initials(f.name)}</span>
                    <div className="friend-info">
                      <p className="friend-name">{f.name}</p>
                      <p className="friend-email">{f.email}</p>
                    </div>
                    <div className="friend-row-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => handleAccept(f.email)}><LuCheck size={15} /></button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleReject(f.email)}><LuX size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === "sent" && (
            sent.length === 0 ? (
              <EmptyState icon={LuUserRound} title="No sent requests" description="Requests you send will show up here." />
            ) : (
              <div className="friends-grid">
                {sent.map((f) => (
                  <div className="friend-row card" key={f.email}>
                    <span className="avatar" style={{ width: 44, height: 44, background: f.avatarColor }}>{initials(f.name)}</span>
                    <div className="friend-info">
                      <p className="friend-name">{f.name}</p>
                      <p className="friend-email">{f.email}</p>
                    </div>
                    <span className="badge" style={{ background: "var(--accent-light)", color: "var(--accent-dark)" }}>Pending</span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default Friends;
