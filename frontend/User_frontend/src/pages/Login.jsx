import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../config/api.js";
import { setUserToken } from "../components/ProtectedRoute.jsx";
import WelpLogo from "../components/WelpLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/workspace";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Sign in failed (${res.status})`);
        return;
      }
      if (data.token) setUserToken(data.token);
      navigate(from, { replace: true });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#06111f] px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0b1d33] px-8 py-10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <WelpLogo className="h-10 max-w-[220px] md:h-11" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Sign in to WELP</h1>
          <p className="mt-2 text-sm text-white/70">Use your email to open the AI workspace.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="example@gmail.com"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8ec5ff] px-4 py-3 font-medium text-[#06111f] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-[#8ec5ff] hover:text-white">
              Create one
            </Link>
          </p>
          <p className="text-center text-sm text-white/50">
            <Link to="/" className="text-[#8ec5ff]/80 hover:text-[#8ec5ff]">
              ← Back to home
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
