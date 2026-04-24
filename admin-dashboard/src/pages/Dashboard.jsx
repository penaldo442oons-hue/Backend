import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import { API_BASE } from "../config/api.js";

const requestsUrl = `${API_BASE}/requests?limit=2000&page=1`;

const btn =
  "inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-welp-inset transition hover:border-white/20 hover:bg-white/10";
const btnDanger =
  "inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20";

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [aiTasks, setAiTasks] = useState([]);

  const fetchRequests = async () => {
    try {
      setError(null);
      const res = await fetch(requestsUrl);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      let allRequests = [];
      if (data && Array.isArray(data.data)) allRequests = data.data;
      else if (Array.isArray(data)) allRequests = data;
      else allRequests = [];

      const normalRequests = allRequests.filter((r) => r.type !== "ai");
      const aiRequests = allRequests.filter((r) => r.type === "ai");

      setRequests(normalRequests);
      setAiTasks(aiRequests);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to connect to API server");
      setRequests([]);
      setAiTasks([]);
      setLoading(false);
    }
  };

  const resolveRequest = async (id) => {
    await fetch(`${API_BASE}/requests/${id}/resolve`, { method: "PUT" });
    fetchRequests();
  };

  const markPending = async (id) => {
    await fetch(`${API_BASE}/requests/${id}/pending`, { method: "PUT" });
    fetchRequests();
  };

  const deleteRequest = async (id) => {
    await fetch(`${API_BASE}/requests/${id}`, { method: "DELETE" });
    fetchRequests();
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  const resolvedRequests = requests.filter((r) => r.status === "resolved").length;

  const filteredRequests = requests
    .filter(
      (r) =>
        (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.email || "").toLowerCase().includes(search.toLowerCase())
    )
    .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Dashboard</h1>
          {lastUpdated ? (
            <p className="mt-1 text-xs text-zinc-500">Last updated · {lastUpdated}</p>
          ) : null}
        </div>
        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</div>
        ) : null}
      </header>

      <div className="flex flex-col gap-4 sm:flex-row">
        <StatsCard title="Total requests" value={totalRequests} color="blue" />
        <StatsCard title="Pending" value={pendingRequests} color="orange" />
        <StatsCard title="Resolved" value={resolvedRequests} color="green" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-welp-accent/50 focus:ring-2 focus:ring-welp-accent/15"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none focus:border-welp-accent/50"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading requests…</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-sm text-zinc-500">No requests match your filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-welp ring-1 ring-white/[0.04]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/35 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.06] transition hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">{r.ticket ?? r.id}</td>
                  <td className="px-4 py-3 text-zinc-200">{r.name}</td>
                  <td className="px-4 py-3 text-zinc-400">{r.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-400" title={r.message}>
                    {r.message}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        r.status === "resolved"
                          ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25"
                          : "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25",
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {r.status === "pending" ? (
                        <button type="button" className={btn} onClick={() => resolveRequest(r.id)}>
                          Resolve
                        </button>
                      ) : (
                        <button type="button" className={btn} onClick={() => markPending(r.id)}>
                          Mark pending
                        </button>
                      )}
                      <button type="button" className={btnDanger} onClick={() => deleteRequest(r.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Monitor</p>
            <h2 className="text-lg font-semibold text-white">AI tasks</h2>
          </div>
        </div>

        {aiTasks.length === 0 ? (
          <p className="text-sm text-zinc-500">No AI tasks in the feed.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] shadow-welp ring-1 ring-white/[0.04]">
            <table className="w-full min-w-[800px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/35 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Prompt</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retries</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiTasks.map((task) => (
                  <tr key={task.id} className="border-b border-white/[0.06] transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">{task.id}</td>
                    <td className="px-4 py-3 text-zinc-200">{task.user}</td>
                    <td className="max-w-md truncate px-4 py-3 text-zinc-400" title={task.prompt}>
                      {task.prompt}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{task.status}</td>
                    <td className="px-4 py-3 text-zinc-400">{task.retries}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className={btn}
                          onClick={async () => {
                            await fetch(`${API_BASE}/ai/${task.id}/retry`, { method: "PUT" });
                            fetchRequests();
                          }}
                        >
                          Retry
                        </button>
                        <button
                          type="button"
                          className={btn}
                          onClick={async () => {
                            await fetch(`${API_BASE}/ai/${task.id}/escalate`, { method: "PUT" });
                            fetchRequests();
                          }}
                        >
                          Escalate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
