import { useEffect, useState } from "react";
import {
  loginUser,
  registerUser,
  logoutUser,
  getStoredUser,
} from "../services/auth";
import { AuthContext } from "./authContextObject";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onStorage = () => setUser(getStoredUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Unable to log in";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(details);
      if (data.user) setUser(data.user);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Unable to register";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateStoredUser = (partial) => {
    const next = { ...user, ...partial };
    setUser(next);
    localStorage.setItem("user", JSON.stringify(next));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, updateStoredUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
