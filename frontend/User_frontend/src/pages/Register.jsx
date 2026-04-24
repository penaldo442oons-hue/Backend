import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api.js";
import { setUserToken } from "../components/ProtectedRoute.jsx";
import WelpLogo from "../components/WelpLogo";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.terms) {
      setError("Please accept the terms to continue.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.fullName.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Registration failed (${res.status})`);
        return;
      }
      if (data.token) setUserToken(data.token);
      navigate("/workspace", { replace: true });
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
          <h1 className="text-3xl font-semibold tracking-tight text-white">Create your account</h1>
          <p className="mt-2 text-sm text-white/70">Start your free demo, then pick a plan when it ends.</p>
        </div>

        {error ? (
          <p className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Full name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Create a password"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="w-full rounded-2xl border border-white/10 bg-[#06111f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-[#8ec5ff] focus:ring-2 focus:ring-[#8ec5ff]/20"
            />
          </div>

          <label className="flex items-start gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-[#06111f] text-[#8ec5ff] focus:ring-[#8ec5ff]"
            />
            <span>I agree to the terms and privacy policy.</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8ec5ff] px-4 py-3 font-medium text-[#06111f] transition hover:bg-white disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <p className="text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#8ec5ff] hover:text-white">
              Sign in
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
