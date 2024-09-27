import useAudioVisualizer from "@/hooks/useAudioVisualizer";
import { useState } from "react";
import MotorConfigurationModal from "../modal/MotorConfigurationModal";
import { Button } from "antd";
import { ConfigType } from "@/types/config";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const [maxFrequency, setMaxFrequency] = useState<number>(0);
  const [config, setConfig] = useState<ConfigType>({
    tireDiameter: 23,
    gearRatio: 3.5,
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const {
    canvasRef,
    frequencyGen,
    config: configuration,
  } = useAudioVisualizer();

  const displayFrequencies = async () => {
    for (const freq of frequencyGen as any) {
      if (freq) {
        setMaxFrequency(freq);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  };
  displayFrequencies();
  return (
    <>
      <div className="flex justify-center flex-wrap">
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 20}
          height={window.innerHeight / 2}
        />
      </div>
      <div className="flex justify-evenly my-8">
        <div>
          <span className="italic font-bold ">
            {Math.round(maxFrequency * 10)}
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
        open={modalOpen}
        config={config}
        setOpen={setModalOpen}
        setConfig={setConfig}
      />
    </>
  );
};

export default MicrophoneFrequencyVisualizer;
