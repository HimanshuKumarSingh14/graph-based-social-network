import { useState } from "react";
import { LuLock, LuBell, LuPalette, LuShieldCheck } from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import "./Settings.css";

function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    friendRequests: true,
    suggestions: true,
    productUpdates: false,
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });
  const [saved, setSaved] = useState("");

  const toggle = (key) => setNotifications((n) => ({ ...n, [key]: !n[key] }));

  const handleSaveNotifications = () => {
    setSaved("Notification preferences saved");
    setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div className="settings-page">
      <div className="card settings-section">
        <div className="section-header"><h2><LuShieldCheck size={17} /> Account</h2></div>
        <div className="settings-row">
          <div>
            <p className="settings-row-label">Email</p>
            <p className="settings-row-value">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card settings-section">
        <div className="section-header"><h2><LuLock size={17} /> Change Password</h2></div>
        <div className="settings-form">
          <input
            className="input"
            type="password"
            placeholder="Current password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
          />
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={passwordForm.next}
            onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
          />
          <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>
            Update Password
          </button>
        </div>
      </div>

      <div className="card settings-section">
        <div className="section-header"><h2><LuBell size={17} /> Notifications</h2></div>
        <div className="settings-toggles">
          <label className="filter-check">
            <input type="checkbox" checked={notifications.friendRequests} onChange={() => toggle("friendRequests")} />
            Friend request alerts
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={notifications.suggestions} onChange={() => toggle("suggestions")} />
            Friend suggestions
          </label>
          <label className="filter-check">
            <input type="checkbox" checked={notifications.productUpdates} onChange={() => toggle("productUpdates")} />
            Product updates
          </label>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={handleSaveNotifications}>
          Save preferences
        </button>
        {saved && <span className="settings-saved">{saved}</span>}
      </div>

      <div className="card settings-section">
        <div className="section-header"><h2><LuPalette size={17} /> Appearance</h2></div>
        <p className="na-hint">Light theme is currently active. Dark mode is coming soon.</p>
      </div>
    </div>
  );
}

export default Settings;
