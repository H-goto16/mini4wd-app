import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useEffect, useState } from "react";
import MotorConfigurationModal from "../modal/MotorConfigurationModal";
import { Button, Progress } from "antd";
import { ConfigType } from "@/types/config";
import Speedometer, {
  Arc,
  Background,
  DangerPath,
  Marks,
  Needle,
} from "react-speedometer/dist";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const [sharpestFrequency, setSharpestFrequency] = useState<number>(0);
  const [config, setConfig] = useState<ConfigType>({
    tireDiameter: 23,
    gearRatio: 3.5,
    using_derivative: false,
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [calcInterval, setCalcInterval] = useState<number>(500);
  const [viewMode, setViewMode] = useState<"graph" | "tachometer">(
    "tachometer"
  );
  const { canvasRef, audioAnalyzer } = useAudioVisualizer();
  const [audioConfig, setAudioConfig] = useState(audioAnalyzer.config);

  useEffect(() => {
    const startAudioStream = async () => {
      await audioAnalyzer.getMicrophoneAudioStream(canvasRef);
    };

    startAudioStream();

    const maxFrequencyGenerator = audioAnalyzer.getMaxFrequencyGenerator();
    const sharpestChangeGenerator = audioAnalyzer.getSharpestChangeGenerator();

    const interval = setInterval(() => {
      const maxFreq = maxFrequencyGenerator.next().value;
      const sharpFreq = sharpestChangeGenerator.next().value;

      if (maxFreq) {
        setMaxFrequency(maxFreq);
      }
      if (sharpFreq) {
        if (sharpFreq && sharpFreq !== null) {
          setSharpestFrequency(sharpFreq.frequency || 0);
        }
      }
    }, calcInterval);

    return () => {
      clearInterval(interval);
      audioAnalyzer.close();
    };
  }, [calcInterval]);

  useEffect(() => {
    audioAnalyzer.config = audioConfig;
  }, [audioConfig, setAudioConfig]);

  return (
    <>
      <div className="flex justify-center flex-wrap">
        <canvas
          style={{ display: viewMode === "graph" ? "block" : "none" }}
          ref={canvasRef}
          width={window.innerWidth - 20}
          height={window.innerHeight / 2}
        />
        {viewMode === "tachometer" && (
          <Speedometer
            value={
              Math.round(
                config.using_derivative
                  ? sharpestFrequency * 10
                  : maxFrequency * 10
              ) / 1000
            }
            max={45}
            fontFamily="squada-one"
          >
            <Background opacity={0.9} />
            <Arc arcWidth={2} />
            <Needle baseOffset={40} circleRadius={10} circleColor="red" />
            <DangerPath color="#00A600" angle={150} arcWidth={5} />
            <DangerPath color="#ffff00" angle={100} arcWidth={5} />
            <DangerPath arcWidth={5} />
            <Marks step={1.5} />
          </Speedometer>
        )}
      </div>
      <div className="text-center mt-3">
        <p
          className={`${
            config.using_derivative ? "text-blue-700" : "text-red-600"
          } font-bold`}
        >
          {config.using_derivative ? "DERIVATIVE MODE" : "MAX MODE"}
        </p>
      </div>
      <div className="flex justify-evenly my-8">
        <div>
          <span className="italic font-bold text-red-500">
            {Math.round(maxFrequency * 10)}
          </span>
          rpm
        </div>
        <div>
          <span className="italic font-bold text-blue-600">
            {Math.round(sharpestFrequency * 10)}
          </span>
          rpm
        </div>
        <div className="">
          <span className="italic font-bold">
            {Math.round(
              (Math.PI *
                config.tireDiameter *
                0.001 *
                (maxFrequency * 10) *
                60) /
                config.gearRatio /
                1000
            )}
          </span>{" "}
          km/h{" "}
        </div>
      </div>
      <div className="flex justify-center">
        <Button className="" onClick={() => setModalOpen(true)}>
          設定
        </Button>
        <Button
          className="ml-3"
          onClick={() =>
            setViewMode(viewMode === "graph" ? "tachometer" : "graph")
          }
        >
          {viewMode === "graph" ? "タコメーター" : "グラフ"}
        </Button>
      </div>
      <MotorConfigurationModal
        setAudioConfig={setAudioConfig}
        canvasRef={canvasRef}
        calcInterval={calcInterval}
        setCalcInterval={setCalcInterval}
        audioAnalyzer={audioAnalyzer}
        open={modalOpen}
        config={config}
        setOpen={setModalOpen}
        setConfig={setConfig}
      />
    </>
  );
};

export default MicrophoneFrequencyVisualizer;
