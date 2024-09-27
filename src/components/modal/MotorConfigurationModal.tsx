import { ConfigType } from "@/types/config";
import { AudioAnalyzer } from "@/utils/spectrumAnalize";
import { Input, Modal, Switch } from "antd";
import { Dispatch, SetStateAction, useState } from "react";

const MotorConfigurationModal = (props: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setConfig: Dispatch<SetStateAction<ConfigType>>;
  config: ConfigType;
  open: boolean;
  audioAnalyzer: AudioAnalyzer;
}) => {
  const { setConfig, open, setOpen, config, audioAnalyzer } = props;
  const [lowPass, setLowPass] = useState(false);
  const [movingAverage, setMovingAverage] = useState(false);
  return (
    <Modal
      open={open}
      cancelButtonProps={{ style: { display: "none" } }}
      okType="default"
      onOk={() => {
        setOpen(false);
      }}
      okText="閉じる"
      onCancel={() => {
        setOpen(false);
      }}
    >
      <div className="p-3">
        <p className="">ギア比</p>
        <Input
          type="number"
          onChange={(e) =>
            setConfig({ ...config, gearRatio: Number(e.target.value) })
          }
          defaultValue={config.gearRatio}
        />
      </div>
      <div className="p-3">
        <p className="">タイヤ径(mm)</p>
        <Input
          type="number"
          onChange={(e) =>
            setConfig({ ...config, tireDiameter: Number(e.target.value) })
          }
          defaultValue={config.tireDiameter}
        />
      </div>
      <div className="p-3">
        <p className="">Low Pass Filter</p>
        <Switch
          className="shadow-md"
          onChange={(e) => {
            audioAnalyzer.toggleLowPassFilter(e);
            setLowPass(e);
          }}
          defaultValue={false}
        />
        <Input
          className="my-3"
          type="number"
          onChange={(e) =>
            audioAnalyzer.setLowPassCoefficient(Number(e.target.value))
          }
          min={0}
          max={1}
          step={0.1}
          defaultValue={0.5}
          disabled={!lowPass}
        />
      </div>

      <div className="p-3">
        <p className="">Moving Average Filter</p>
        <Switch
          className="shadow-md"
          onChange={(e) => {
            audioAnalyzer.toggleMovingAverageFilter(e);
            setMovingAverage(e);
          }}
          defaultValue={false}
        />
        <Input
          type="number"
          className="my-3"
          onChange={(e) =>
            audioAnalyzer.setMovingAverageWindowSize(Number(e.target.value))
          }
          min={0}
          step={1}
          defaultValue={5}
          disabled={!movingAverage}
        />
      </div>
    </Modal>
  );
};

export default MotorConfigurationModal;
