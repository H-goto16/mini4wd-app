import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useEffect, useState } from "react";
import MotorConfigurationModal from "../modal/MotorConfigurationModal";
import { Button, Segmented } from "antd";
import Tachometer from "./tachometer";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const { canvasRef, audioAnalyzer, config, setConfig } = useAudioVisualizer();
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const [sharpestFrequency, setSharpestFrequency] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(800);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth - 32;
      // 両方表示かつ広い画面: タコの右にグラフ / 狭い画面: タコの下にグラフ
      const sideBySide = config.viewMode === "both" && window.innerWidth >= 1024;
      setCanvasWidth(
        Math.max(280, Math.min(sideBySide ? w - 460 : 1100, sideBySide ? 700 : w))
      );
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [config.viewMode]);

  useEffect(() => {
    const maxGen = audioAnalyzer.getMaxFrequencyGenerator();
    const sharpGen = audioAnalyzer.getSharpestChangeGenerator();
    const interval = setInterval(() => {
      const maxFreq = maxGen.next().value;
      const sharp = sharpGen.next().value;
      // ゲート未満は null → 0 に落とす
      setMaxFrequency(maxFreq ?? 0);
      setSharpestFrequency(sharp?.frequency ?? 0);
    }, config.calcInterval);
    return () => clearInterval(interval);
  }, [audioAnalyzer, config.calcInterval]);

  const freq = config.using_derivative ? sharpestFrequency : maxFrequency;
  const rpm = Math.round(freq * 10);
  const kmh = Math.round(
    (Math.PI * config.tireDiameter * 0.001 * (maxFrequency * 10) * 60) /
      config.gearRatio /
      1000
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-center mb-4">
        <Segmented
          value={config.viewMode}
          onChange={(v) => setConfig({ ...config, viewMode: v as "graph" | "tachometer" | "both" })}
          options={[
            { label: "タコメーター", value: "tachometer" },
            { label: "グラフ", value: "graph" },
            { label: "両方", value: "both" },
          ]}
        />
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
        {config.viewMode !== "graph" && <Tachometer value={rpm / 1000} />}
        <canvas
          className="rounded-2xl border border-slate-200 dark:border-white/10"
          style={{ display: config.viewMode === "tachometer" ? "none" : "block" }}
          ref={canvasRef}
          width={canvasWidth}
          height={Math.round(canvasWidth * 0.5)}
        />
      </div>

      <div className="text-center mt-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest ${
            config.using_derivative
              ? "bg-sky-500/15 text-sky-500"
              : "bg-orange-500/15 text-orange-500"
          }`}
        >
          {config.using_derivative ? "DERIVATIVE MODE" : "MAX MODE"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto my-6">
        {[
          { v: rpm.toLocaleString(), u: "rpm" },
          { v: kmh.toLocaleString(), u: "km/h" },
        ].map((s) => (
          <div
            key={s.u}
            className="rounded-2xl p-4 text-center border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"
          >
            <div className="font-digital text-3xl font-bold text-orange-500">{s.v}</div>
            <div className="text-xs tracking-widest text-slate-500 dark:text-slate-400">{s.u}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button onClick={() => setModalOpen(true)}>設定</Button>
      </div>
      <MotorConfigurationModal
        open={modalOpen}
        config={config}
        setOpen={setModalOpen}
        onLearnNoise={() => audioAnalyzer.learnNoise(2000)}
        onClearNoise={() => audioAnalyzer.clearNoise()}
        setConfig={setConfig}
      />
    </main>
  );
};

export default MicrophoneFrequencyVisualizer;
