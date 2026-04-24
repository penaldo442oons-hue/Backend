import { useMemo, useState } from "react";
import { API_BASE } from "../config/api.js";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const canSend = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.message.trim().length > 0
    );
  }, [form.email, form.message, form.name]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSend || status === "sending") return;

    try {
      setStatus("sending");
      const res = await fetch(`${API_BASE}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 2800);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4500);
    }
  };

  const footerMessage =
    status === "sent"
      ? "Saved to the admin queue. We’ll follow up shortly."
      : status === "error"
        ? "Could not reach the server. Is the API running on port 5000?"
        : "We usually reply within 24 hours.";

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-welp ring-1 ring-white/[0.04] backdrop-blur-xl md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400 shadow-welp-inset">
            Contact Developers
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white md:text-3xl">Tell us what you’re building.</h1>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-zinc-400">
            Custom integrations, AI orchestration, or Stripe unlocks end-to-end — send a note and we’ll reply with next
            steps.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-[13px] font-medium text-zinc-300">
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-welp-accent/50 focus:ring-2 focus:ring-welp-accent/15"
                  placeholder="Your name"
                />
              </label>
              <label className="grid gap-2 text-[13px] font-medium text-zinc-300">
                Email
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-welp-accent/50 focus:ring-2 focus:ring-welp-accent/15"
                  placeholder="you@company.com"
                  type="email"
                />
              </label>
            </div>

            <label className="grid gap-2 text-[13px] font-medium text-zinc-300">
              What should WELP do?
              <textarea
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="min-h-[168px] resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-welp-accent/50 focus:ring-2 focus:ring-welp-accent/15"
                placeholder="Example: Stripe unlock flow, model routing, export to .md…"
              />
            </label>

            <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-2 sm:flex-row sm:items-center">
              <p className="text-[12px] text-zinc-500">{footerMessage}</p>
              <button
                type="submit"
                disabled={!canSend || status === "sending"}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-welp-accent to-sky-300 px-6 py-2.5 text-sm font-semibold text-welp-void shadow-[0_12px_40px_rgba(142,197,255,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              >
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;
