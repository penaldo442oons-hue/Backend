const border = {
  blue: "border-l-sky-400",
  orange: "border-l-amber-400",
  green: "border-l-emerald-400",
};

function StatsCard({ title, value, color = "blue" }) {
  const b = border[color] || border.blue;

  return (
    <div
      className={[
        "min-w-[140px] flex-1 rounded-xl border border-white/10 border-l-4 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-welp ring-1 ring-white/[0.04]",
        b,
      ].join(" ")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
    </div>
  );
}

export default StatsCard;
