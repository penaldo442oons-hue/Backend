import { useEffect, useState } from "react";
import { API_BASE } from "../config/api.js";

const requestsUrl = `${API_BASE}/requests?limit=2000&page=1`;

const btn =
  "inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-welp-inset transition hover:border-white/20 hover:bg-white/10";
const btnDanger =
  "inline-flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-500/20";

function AdminQueue() {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(requestsUrl);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const aiTasks = list.filter(
        (r) => r.type === "ai" && (r.status === "needs-admin" || r.status === "admin-review")
      );
      setTasks(aiTasks);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  };

  const resolveTask = async (id) => {
    await fetch(`${API_BASE}/requests/${id}/resolve`, { method: "PUT" });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`${API_BASE}/requests/${id}`, { method: "DELETE" });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <header className="border-b border-white/10 pb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Queue</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">AI tasks · admin review</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Items that need a human decision. Refreshes every few seconds from the same requests feed as the dashboard.
        </p>
      </header>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center text-sm text-zinc-500">
          Nothing in the admin queue right now.
        </div>
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
              {tasks.map((task) => (
                <tr key={task.id} className="border-b border-white/[0.06] transition hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">{task.id}</td>
                  <td className="px-4 py-3 text-zinc-200">{task.user}</td>
                  <td className="max-w-md truncate px-4 py-3 text-zinc-400" title={task.prompt}>
                    {task.prompt}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/25">
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{task.retries}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" className={btn} onClick={() => resolveTask(task.id)}>
                        Mark resolved
                      </button>
                      <button type="button" className={btnDanger} onClick={() => deleteTask(task.id)}>
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
    </div>
  );
}

export default AdminQueue;
