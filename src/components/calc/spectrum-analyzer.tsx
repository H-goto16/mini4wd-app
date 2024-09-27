import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useEffect, useState } from "react";
import MotorConfigurationModal from "../modal/MotorConfigurationModal";
import { Button } from "antd";
import { ConfigType } from "@/types/config";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const [sharpestFrequency, setSharpestFrequency] = useState<number>(0);
  const [config, setConfig] = useState<ConfigType>({
    tireDiameter: 23,
    gearRatio: 3.5,
    using_derivative: false,
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { canvasRef, audioAnalyzer } = useAudioVisualizer();

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
        if (sharpFreq && sharpFreq.frequency !== null) {
          setSharpestFrequency(sharpFreq.frequency);
        }
      }
    }, 50);

    // クリーンアップ
    return () => {
      clearInterval(interval);
      audioAnalyzer.close();
    };
  }, []);
  return (
    <>
      <div className="flex justify-center flex-wrap">
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 20}
          height={window.innerHeight / 2}
        />
      </div>
      <div className="text-center mt-3">
        <p className={config.using_derivative ? "text-blue-700" : "text-red-600"}>{config.using_derivative ? "DERIVATIVE MODE" : "MAX MODE"}</p>
      </div>
      <div className="flex justify-evenly my-8">
        <div>
          <span className="italic font-bold ">
            {Math.round(
              config.using_derivative
                ? sharpestFrequency * 10
                : maxFrequency * 10
            )}
          </span>
          rpm
        </div>
        <div className="">
          <span className="italic font-bold">
            {Math.round(
              (2 *
                Math.PI *
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
      </div>
      <MotorConfigurationModal
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
