import Link from "next/link";

const items = [
  { name: "バンクスルー", desc: "ブレーキ寸法の計算", path: "/bank-through" },
  { name: "モーター", desc: "マイク音から回転数を計測", path: "/motor" },
];

const Home = () => (
  <main className="max-w-xl mx-auto p-6 grid gap-4">
    {items.map((i) => (
      <Link
        key={i.path}
        href={i.path}
        className="group rounded-2xl p-5 border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 hover:border-orange-500 dark:hover:border-orange-500 transition shadow-sm"
      >
        <div className="text-lg font-bold group-hover:text-orange-500 transition">
          {i.name}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{i.desc}</div>
      </Link>
    ))}
  </main>
);

export default Home;
