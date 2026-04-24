import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config/api.js";
import { getUserToken, setUserToken } from "../components/ProtectedRoute.jsx";

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-welp-accent/80 [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-welp-accent/80 [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-welp-accent/80" />
    </span>
  );
}

function OutputCard({ title, rightAction, children }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_14px_50px_rgba(0,0,0,0.38)] ring-1 ring-white/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{title}</div>
        {rightAction ? <div className="flex flex-shrink-0 items-center gap-2">{rightAction}</div> : null}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function SubscriptionPanel({ onSelect }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-welp-ink/95 p-6 shadow-welp ring-1 ring-white/[0.06] backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">Continue with a subscription</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Your free demo time has ended. Pick a plan to keep building with AI (demo checkout — no payment wired in this
        project).
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("starter")}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition hover:border-welp-accent/40 hover:bg-white/[0.08]"
        >
          <div className="text-sm font-semibold text-welp-accent">Starter</div>
          <div className="mt-1 text-xs text-zinc-500">$19/mo · more AI runs</div>
        </button>
        <button
          type="button"
          onClick={() => onSelect("pro")}
          className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition hover:border-welp-accent/40 hover:bg-white/[0.08]"
        >
          <div className="text-sm font-semibold text-welp-accent">Pro</div>
          <div className="mt-1 text-xs text-zinc-500">$49/mo · priority and exports</div>
        </button>
      </div>
    </div>
  );
}

function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("output");

  const [conversation, setConversation] = useState(() => [
    {
      id: uid(),
      role: "system",
      content: "You are in the AI workspace. Ask for builds, refactors, or plans — results appear on the left.",
    },
    {
      id: uid(),
      role: "assistant",
      content: "What do you want to build today?",
    },
  ]);

  const [run, setRun] = useState(() => ({
    id: null,
    stage: "idle",
    summary: "",
    solution: "",
    code: "",
    recommendations: "",
  }));

  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState(null);

  const chatEndRef = useRef(null);

  const isBusy = run.stage !== "idle" && run.stage !== "done";

  const refreshMe = useCallback(async () => {
    const token = getUserToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMe(null);
        setMeError(data.error || "Could not load account");
        return;
      }
      setMe(data);
      setMeError(null);
    } catch {
      setMeError("Network error");
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.length, run.stage]);

  const trialLabel = useMemo(() => {
    if (!me?.trialEndsAt) return null;
    const end = me.trialEndsAt;
    if (me.subscriptionPlan !== "trial") return null;
    const d = new Date(end);
    return `Free demo ends ${d.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
  }, [me]);

  const needsSubscription = me && !me.hasAiAccess;

  const selectPlan = async (plan) => {
    const token = getUserToken();
    if (!token) return;
    const res = await fetch(`${API_BASE}/auth/select-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setConversation((p) => [
        ...p,
        { id: uid(), role: "system", content: data.error || "Could not update plan." },
      ]);
      return;
    }
    if (data.token) setUserToken(data.token);
    await refreshMe();
    setConversation((p) => [...p, { id: uid(), role: "system", content: `You are now on the ${plan} plan.` }]);
  };

  const startRun = async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt || isBusy) return;
    if (needsSubscription) return;

    setPrompt("");
    setActiveTab("output");

    const runId = uid();
    const thinkingId = uid();

    setRun({
      id: runId,
      stage: "busy",
      summary: "",
      solution: "",
      code: "",
      recommendations: "",
    });

    const prior = conversation
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const messages = [...prior, { role: "user", content: userPrompt }];

    setConversation((p) => [
      ...p,
      { id: uid(), role: "user", content: userPrompt },
      { id: thinkingId, role: "assistant_thinking", content: "Calling the model…" },
    ]);

    const token = getUserToken();

    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 403 && data.error === "DEMO_EXPIRED") {
        setConversation((p) => p.filter((m) => m.id !== thinkingId));
        await refreshMe();
        setRun((p) => ({ ...p, id: runId, stage: "idle" }));
        setConversation((p) => [
          ...p,
          {
            id: uid(),
            role: "system",
            content: "Your demo has ended. Choose Starter or Pro below to continue.",
          },
        ]);
        return;
      }

      if (!res.ok) {
        setConversation((p) => p.filter((m) => m.id !== thinkingId));
        setRun((p) => ({ ...p, stage: "idle" }));
        const msg =
          data.message ||
          data.error ||
          (res.status === 503 ? "AI is not configured on the server." : `Request failed (${res.status})`);
        setConversation((p) => [...p, { id: uid(), role: "system", content: msg }]);
        return;
      }

      setConversation((p) => {
        const rest = p.filter((m) => m.id !== thinkingId);
        return [
          ...rest,
          {
            id: uid(),
            role: "assistant",
            content: data.assistantMessage || "Done — see the output panel.",
          },
        ];
      });

      setRun((p) => ({
        ...p,
        id: runId,
        stage: "done",
        summary: data.summary || "",
        solution: data.solution || "",
        code: data.code || "",
        recommendations: data.recommendations || "",
      }));
    } catch {
      setConversation((p) => p.filter((m) => m.id !== thinkingId));
      setRun((p) => ({ ...p, stage: "idle" }));
      setConversation((p) => [...p, { id: uid(), role: "system", content: "Network error — try again." }]);
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setConversation((p) => [...p, { id: uid(), role: "system", content: "Copied to clipboard." }]);
    } catch {
      setConversation((p) => [...p, { id: uid(), role: "system", content: "Copy failed." }]);
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const stageLabel = useMemo(() => {
    if (run.stage === "idle") return "Ready";
    if (run.stage === "busy") return "Generating";
    if (run.stage === "done") return "Done";
    return "Ready";
  }, [run.stage]);

  const combinedOutputText = useMemo(() => {
    return [
      "# Summary",
      run.summary,
      "",
      "# Solution",
      run.solution,
      "",
      "# Code",
      run.code,
      "",
      "# Recommendations",
      run.recommendations,
      "",
    ].join("\n");
  }, [run.code, run.recommendations, run.solution, run.summary]);

  const ghostBtn =
    "rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-200 shadow-welp-inset transition hover:border-white/20 hover:bg-white/[0.08]";

  const mobileTabs = (
    <div className="sticky top-14 z-40 shrink-0 border-b border-white/[0.06] bg-welp-void/80 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={() => setActiveTab("output")}
          className={[
            "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
            activeTab === "output"
              ? "bg-white/12 text-white ring-1 ring-white/15 shadow-welp-inset"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
          ].join(" ")}
        >
          Output
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={[
            "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition",
            activeTab === "chat"
              ? "bg-white/12 text-white ring-1 ring-white/15 shadow-welp-inset"
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
          ].join(" ")}
        >
          Chat
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {me && trialLabel ? (
        <div className="shrink-0 border-b border-welp-accent/20 bg-welp-accent/10 px-4 py-2 text-center text-xs font-medium text-welp-accent md:text-sm">
          {trialLabel}
        </div>
      ) : null}

      {needsSubscription ? (
        <div className="shrink-0 border-b border-amber-400/25 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100 md:text-sm">
          Demo ended — choose a plan below to use AI again.
        </div>
      ) : null}

      {meError ? (
        <div className="shrink-0 border-b border-red-400/20 bg-red-500/10 px-4 py-2 text-center text-xs text-red-200">
          {meError}
        </div>
      ) : null}

      {mobileTabs}

      <div className="relative flex min-h-0 flex-1 flex-col px-0 md:px-5 md:pb-4">
        {needsSubscription ? (
          <div className="absolute inset-0 z-30 flex items-start justify-center overflow-y-auto bg-welp-void/70 px-4 py-10 backdrop-blur-sm md:py-16">
            <SubscriptionPanel onSelect={selectPlan} />
          </div>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:mt-1 md:rounded-2xl md:border md:border-white/10 md:bg-welp-panel/55 md:shadow-welp md:ring-1 md:ring-white/[0.04] md:backdrop-blur-2xl">
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/* Output — left column */}
            <section
              className={[
                "flex min-h-0 flex-col border-white/[0.06] md:order-1 md:w-[56%] md:shrink-0 md:border-r",
                "md:block",
                activeTab === "output" ? "flex-1" : "hidden",
              ].join(" ")}
            >
              <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-welp-panel/80 to-welp-void/30">
                <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-32 pt-5 md:px-6 md:pb-36 md:pt-6">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Workspace</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Results</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 shadow-welp-inset">
                      Live model
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <OutputCard
                      title="Summary"
                      rightAction={
                        run.summary ? (
                          <button type="button" onClick={() => copyText(run.summary)} className={ghostBtn}>
                            Copy
                          </button>
                        ) : null
                      }
                    >
                      {run.stage === "busy" && !run.summary ? (
                        <div className="space-y-2.5">
                          <div className="h-3 w-3/4 max-w-md animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-2/3 max-w-sm animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-1/2 max-w-xs animate-pulse rounded-md bg-white/[0.07]" />
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-zinc-300">
                          {run.summary}
                        </pre>
                      )}
                    </OutputCard>

                    <OutputCard
                      title="Solution"
                      rightAction={
                        run.solution ? (
                          <button type="button" onClick={() => copyText(run.solution)} className={ghostBtn}>
                            Copy
                          </button>
                        ) : null
                      }
                    >
                      {run.stage === "busy" && !run.solution ? (
                        <div className="space-y-2.5">
                          <div className="h-3 w-11/12 max-w-lg animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-10/12 max-w-md animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-9/12 max-w-sm animate-pulse rounded-md bg-white/[0.07]" />
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-zinc-300">
                          {run.solution}
                        </pre>
                      )}
                    </OutputCard>

                    <OutputCard
                      title="Code"
                      rightAction={
                        run.code ? (
                          <>
                            <button type="button" onClick={() => copyText(run.code)} className={ghostBtn}>
                              Copy
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadText("welp-output.txt", combinedOutputText)}
                              className={ghostBtn}
                            >
                              Download
                            </button>
                          </>
                        ) : null
                      }
                    >
                      {run.stage === "busy" && !run.code ? (
                        <div className="space-y-2.5">
                          <div className="h-3 w-full max-w-xl animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-11/12 max-w-lg animate-pulse rounded-md bg-white/[0.07]" />
                        </div>
                      ) : (
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/35 p-4 font-mono text-[12px] leading-relaxed text-zinc-300 shadow-inner">
                          {run.code}
                        </pre>
                      )}
                    </OutputCard>

                    <OutputCard title="Recommendations">
                      {run.stage === "busy" && !run.recommendations ? (
                        <div className="space-y-2.5">
                          <div className="h-3 w-10/12 max-w-md animate-pulse rounded-md bg-white/[0.07]" />
                          <div className="h-3 w-8/12 max-w-sm animate-pulse rounded-md bg-white/[0.07]" />
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-zinc-300">
                          {run.recommendations}
                        </pre>
                      )}
                    </OutputCard>
                  </div>
                </div>
              </div>
            </section>

            {/* Chat — right column */}
            <section
              className={[
                "flex min-h-0 flex-col border-white/[0.06] md:order-2 md:w-[44%] md:shrink-0",
                "md:block",
                activeTab === "chat" ? "flex-1" : "hidden",
              ].join(" ")}
            >
              <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-welp-ink/90 to-welp-void/20 md:from-welp-ink/70 md:to-transparent">
                <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pb-32 pt-5 md:px-5 md:pb-36 md:pt-6">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Live</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">Conversation</h2>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-welp-inset">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={[
                            "absolute inline-flex h-full w-full rounded-full bg-welp-accent opacity-75",
                            isBusy ? "animate-ping" : "",
                          ].join(" ")}
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-welp-accent" />
                      </span>
                      {stageLabel}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {conversation.map((m) => {
                      const align =
                        m.role === "user"
                          ? "items-end"
                          : m.role === "system"
                            ? "items-center"
                            : "items-start";

                      const bubble =
                        m.role === "user"
                          ? "bg-gradient-to-br from-welp-accent to-sky-300 text-welp-void shadow-[0_12px_40px_rgba(142,197,255,0.22)]"
                          : m.role === "system"
                            ? "border border-white/10 bg-black/25 text-zinc-400 shadow-welp-inset"
                            : "border border-white/[0.08] bg-white/[0.04] text-zinc-100 shadow-[0_12px_40px_rgba(0,0,0,0.25)]";

                      const maxW = m.role === "system" ? "max-w-[92%]" : "max-w-[min(92%,520px)]";

                      return (
                        <div key={m.id} className={["flex animate-[fadeIn_0.35s_ease-out]", align].join(" ")}>
                          <div
                            className={[
                              "rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                              bubble,
                              maxW,
                              m.role === "assistant_thinking" ? "ring-1 ring-welp-accent/25" : "",
                            ].join(" ")}
                          >
                            {m.role === "assistant_thinking" ? (
                              <div className="flex items-center gap-2.5">
                                <TypingDots />
                                <span className="text-zinc-200">{m.content}</span>
                              </div>
                            ) : (
                              <span className={m.role === "system" ? "text-center text-[12px] leading-snug" : ""}>
                                {m.content}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-welp-void/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] items-end gap-3 px-4 py-3 md:px-6 md:py-4">
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.04] p-1 shadow-welp-inset ring-1 ring-white/[0.04] focus-within:border-welp-accent/35 focus-within:ring-welp-accent/15">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void startRun();
                  }
                }}
                placeholder={needsSubscription ? "Subscribe to continue…" : "Ask for anything…"}
                rows={1}
                disabled={needsSubscription}
                className="max-h-40 min-h-[48px] w-full resize-none bg-transparent px-3 py-3 font-sans text-[14px] text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="mt-2 hidden text-[11px] text-zinc-600 sm:block">
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                Enter
              </kbd>{" "}
              send ·{" "}
              <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                Shift+Enter
              </kbd>{" "}
              newline
            </p>
          </div>
          <button
            type="button"
            onClick={() => void startRun()}
            disabled={!prompt.trim() || isBusy || needsSubscription}
            className="h-[48px] shrink-0 rounded-2xl bg-gradient-to-r from-welp-accent to-sky-300 px-6 text-sm font-semibold text-welp-void shadow-[0_12px_40px_rgba(142,197,255,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isBusy ? "Working…" : "Send"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Workspace;
