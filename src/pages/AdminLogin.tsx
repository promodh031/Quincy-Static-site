import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { resolveLoginEmail } from "../lib/adminAuth";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, resolveLoginEmail(userId), password);
      nav("/admin", { replace: true });
    } catch (x: unknown) {
      const msg = x instanceof Error ? x.message : "Sign-in failed";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell">
      <div className="admin-login-card surface-card">
        <Link to="/" className="admin-back">
          <span className="material-symbols-outlined">arrow_back</span> Back to site
        </Link>
        <h1 className="admin-login-title">Admin portal</h1>
        <p className="admin-login-sub">
          Sign in with <strong>Admin</strong> as the user ID (or the full admin email). Use the password configured in Firebase
          Authentication.
        </p>
        <form onSubmit={onSubmit} className="admin-form">
          <label className="admin-label">
            Admin ID or email
            <input
              className="admin-input"
              type="text"
              autoComplete="username"
              placeholder="Admin"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </label>
          <label className="admin-label">
            Password
            <input
              className="admin-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {err ? <p className="admin-error">{err}</p> : null}
          <button type="submit" className="btn btn-filled" disabled={busy} style={{ width: "100%", marginTop: "0.5rem" }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
