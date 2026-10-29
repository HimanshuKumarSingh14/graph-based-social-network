import { useEffect, useState } from "react";
import { LuPencil, LuCheck, LuMail } from "react-icons/lu";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { getProfile, updateProfile, getFriends } from "../services/users";
import { getMyCentrality } from "../services/analytics";
import "./Profile.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Profile() {
  const { updateStoredUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [centrality, setCentrality] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, f, c] = await Promise.all([getProfile(), getFriends(), getMyCentrality()]);
        setProfile(p.data);
        setForm({ name: p.data.name, bio: p.data.bio || "" });
        setFriendsCount(f.data.length);
        setCentrality(c.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      setProfile(res.data.user);
      updateStoredUser({ name: res.data.user.name, bio: res.data.user.bio });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div className="profile-page">
      <div className="card profile-hero">
        <div className="avatar profile-avatar" style={{ background: profile.avatarColor || "var(--accent)" }}>
          {initials(profile.name)}
        </div>
        <div className="profile-hero-info">
          {editing ? (
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          ) : (
            <h2>{profile.name}</h2>
          )}
          <p className="profile-email"><LuMail size={14} /> {profile.email}</p>

          {editing ? (
            <textarea
              className="input"
              rows={2}
              placeholder="Add a short bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ marginTop: 10 }}
            />
          ) : (
            <p className="profile-bio">{profile.bio || "No bio yet."}</p>
          )}
        </div>

        {editing ? (
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
            <LuCheck size={15} /> {saving ? "Saving..." : "Save"}
          </button>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
            <LuPencil size={15} /> Edit
          </button>
        )}
      </div>

      <div className="profile-stats">
        <div className="card profile-stat">
          <p className="profile-stat-value">{friendsCount}</p>
          <span>Friends</span>
        </div>
        <div className="card profile-stat">
          <p className="profile-stat-value">{centrality.degreeCentrality}</p>
          <span>Degree centrality</span>
        </div>
        <div className="card profile-stat">
          <p className="profile-stat-value">{centrality.betweennessCentrality}</p>
          <span>Betweenness</span>
        </div>
        <div className="card profile-stat">
          <p className="profile-stat-value">{centrality.eigenvectorCentrality}</p>
          <span>Influence score</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;
