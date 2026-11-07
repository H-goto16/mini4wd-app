import { CalculatorIcon, MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useAtom } from "jotai";
import Link from "next/link";
import { themeState } from "@/jotai/themeState";

const Header = () => {
  const [mode, setMode] = useAtom(themeState);
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-wide">
        <CalculatorIcon className="w-6 h-6 text-orange-500" />
        <span>
          Mini4wd <span className="text-orange-500">Calc</span>
        </span>
      </Link>
      <button
        aria-label="テーマ切替"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        className="p-2 rounded-full border border-slate-300 dark:border-white/15 hover:bg-slate-200 dark:hover:bg-white/10 transition"
      >
        {mode === "dark" ? (
          <SunIcon className="w-5 h-5 text-orange-400" />
        ) : (
          <MoonIcon className="w-5 h-5 text-slate-600" />
        )}
      </button>
    </header>
  );
};

export default Header;
