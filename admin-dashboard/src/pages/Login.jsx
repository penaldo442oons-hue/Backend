import { useNavigate } from "react-router-dom";
import WelpLogo from "../components/WelpLogo";

function Login() {
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem("token", "admin");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-welp-panel/60 p-8 shadow-welp ring-1 ring-white/[0.05] backdrop-blur-xl md:p-10">
        <div className="flex flex-col items-center text-center">
          <WelpLogo className="h-10 max-w-[220px]" />
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Admin</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">Access the operations console for requests and AI tasks.</p>
        </div>

        <button
          type="button"
          onClick={login}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-welp-accent to-sky-300 py-3 text-sm font-semibold text-welp-void shadow-[0_12px_40px_rgba(142,197,255,0.22)] transition hover:brightness-110"
        >
          Continue to dashboard
        </button>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Demo flow: stores a token in localStorage. Wire this to your real auth API when ready.
        </p>
      </div>
    </div>
  );
}

export default Login;
