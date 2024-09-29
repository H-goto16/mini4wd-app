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
  calcInterval: number;
  setCalcInterval: Dispatch<SetStateAction<number>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setAudioConfig: Dispatch<SetStateAction<any>>;
}) => {
  const {
    setConfig,
    open,
    setOpen,
    config,
    audioAnalyzer,
    calcInterval,
    setCalcInterval,
    canvasRef,
    setAudioConfig,
  } = props;
  const [lowPass, setLowPass] = useState(true);
  const [movingAverage, setMovingAverage] = useState(true);
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
          defaultValue={true}
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
          defaultValue={true}
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
      <div className="p-3">
        <p className="">計測に最大値ではなく微分値を使用する</p>
        <Switch
          className="shadow-md"
          onChange={(e) => setConfig({ ...config, using_derivative: e })}
          defaultValue={false}
        />
      </div>
      <div className="p-3">
        <p className="">更新時間</p>
        <Input
          type="number"
          onChange={(e) => setCalcInterval(Number(e.target.value))}
          defaultValue={calcInterval}
        />
      </div>
      <div className="p-3">
        <p className="">計測する範囲(Hz) 調整中</p>
        <div className="flex">
          <Input
            type="number"
            disabled
            onChange={(e) =>
              setAudioConfig({
                ...config,
                minFrequency: Number(e.target.value),
              })
            }
            defaultValue={audioAnalyzer.config.minFrequency}
          />{" "}
          <span className="mx-2 translate-y-2"> ~ </span>
          <Input
            type="number"
            disabled
            onChange={(e) =>
              setAudioConfig({
                ...config,
                maxFrequency: Number(e.target.value),
              })
            }
            defaultValue={audioAnalyzer.config.maxFrequency}
          />
        </div>
      </div>
    </Modal>
  );
};

export default MotorConfigurationModal;
