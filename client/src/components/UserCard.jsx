import { LuUserPlus, LuCheck, LuClock, LuUserCheck } from "react-icons/lu";
import "./UserCard.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function UserCard({ user, onAdd }) {
  const { name, email, bio, avatarColor, isFriend, requestSent, requestReceived } = user;

  return (
    <div className="user-card card fade-in">
      <div className="user-card-avatar avatar" style={{ background: avatarColor, width: 52, height: 52, fontSize: "1.1rem" }}>
        {initials(name)}
      </div>
      <div className="user-card-info">
        <h3>{name}</h3>
        <p className="user-card-email">{email}</p>
        {bio && <p className="user-card-bio">{bio}</p>}
      </div>

      {isFriend ? (
        <button className="btn btn-ghost btn-sm" disabled>
          <LuUserCheck size={15} /> Friends
        </button>
      ) : requestSent ? (
        <button className="btn btn-outline btn-sm" disabled>
          <LuClock size={15} /> Requested
        </button>
      ) : requestReceived ? (
        <button className="btn btn-primary btn-sm" onClick={() => onAdd(email)}>
          <LuCheck size={15} /> Accept
        </button>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={() => onAdd(email)}>
          <LuUserPlus size={15} /> Add
        </button>
      )}
    </div>
  );
}

export default UserCard;
