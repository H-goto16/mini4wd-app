import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useEffect, useState } from "react";
import MotorConfigurationModal from "../modal/MotorConfigurationModal";
import { Button } from "antd";
import Speedometer, {
  Arc,
  Background,
  DangerPath,
  Marks,
  Needle,
} from "react-speedometer/dist";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const { canvasRef, audioAnalyzer, config, setConfig } = useAudioVisualizer();
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const [sharpestFrequency, setSharpestFrequency] = useState<number>(0);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

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
      if (sharpFreq && sharpFreq !== null) {
        setSharpestFrequency(sharpFreq.frequency || 0);
      }
    }, config.calcInterval);

    return () => {
      clearInterval(interval);
      audioAnalyzer.close();
    };
  }, [config.calcInterval]);
  return (
    <>
      <div className="flex justify-center flex-wrap">
        <canvas
          style={{ display: config.viewMode === "graph" ? "block" : "none" }}
          ref={canvasRef}
          width={window.innerWidth - 20}
          height={window.innerHeight / 2}
        />
        {config.viewMode === "tachometer" && (
          <div className="pt-10">
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
          </div>
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
      <div className="flex justify-center my-8">
        <div className="mr-4">
          <span className="italic font-bold text-xl">
            {Math.round(
              config.using_derivative
                ? sharpestFrequency * 10
                : maxFrequency * 10
            )}
          </span>{" "}
          rpm
        </div>
        <div className="">
          <span className="italic font-bold text-xl">
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
            setConfig({
              ...config,
              viewMode: config.viewMode === "graph" ? "tachometer" : "graph",
            })
          }
        >
          {config.viewMode === "graph" ? "タコメーター" : "グラフ"}
        </Button>
      </div>
      <MotorConfigurationModal
        open={modalOpen}
        config={config}
        setOpen={setModalOpen}
        setConfig={setConfig}
      />
    </>
  );
};

export default MicrophoneFrequencyVisualizer;
