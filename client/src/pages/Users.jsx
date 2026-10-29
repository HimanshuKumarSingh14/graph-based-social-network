import { useEffect, useState, useCallback } from "react";
import { LuSearch, LuUsers } from "react-icons/lu";
import UserCard from "../components/UserCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getAllUsers } from "../services/users";
import { sendFriendRequest, acceptFriendRequest } from "../services/friends";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchUsers = useCallback(async (query) => {
    setLoading(true);
    try {
      const res = await getAllUsers(query);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(timeout);
  }, [search, fetchUsers]);

  const handleAction = async (email) => {
    const user = users.find((u) => u.email === email);
    try {
      if (user?.requestReceived) {
        await acceptFriendRequest(email);
        setMessage(`You're now friends with ${user.name}`);
      } else {
        await sendFriendRequest(email);
        setMessage(`Friend request sent to ${user.name}`);
      }
      fetchUsers(search);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className="users-page">
      <div className="users-toolbar card">
        <div className="users-search">
          <LuSearch size={18} />
          <input
            type="text"
            placeholder="Search people by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {message && <span className="users-toast">{message}</span>}
      </div>

      {loading ? (
        <Loader label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState icon={LuUsers} title="No users found" description="Try a different search term." />
      ) : (
        <div className="users-grid">
          {users.map((u) => (
            <UserCard key={u.email} user={u} onAdd={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Users;
