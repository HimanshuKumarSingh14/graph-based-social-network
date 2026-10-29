import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuMail, LuLock, LuShare2, LuLoaderCircle } from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import "./AuthPages.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
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
        <p className="auth-subtitle">Login to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
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
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? <LuLoaderCircle className="spin-icon" size={18} /> : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
