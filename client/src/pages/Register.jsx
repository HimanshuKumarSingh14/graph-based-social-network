import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMail, LuLock, LuUser, LuShare2, LuLoaderCircle } from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import "./AuthPages.css";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      if (data.token) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-icon">
          <LuShare2 size={26} />
        </div>
        <h1 className="auth-title">Graph Social Network Analysis</h1>
        <p className="auth-subtitle">Create your account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-input-wrap">
            <LuUser size={18} />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-input-wrap">
            <LuMail size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-input-wrap">
            <LuLock size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <LuLoaderCircle className="spin-icon" size={18} /> : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
