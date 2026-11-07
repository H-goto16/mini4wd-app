import { ConfigType } from "@/types/config";
import { Button, Input, Modal, Switch, message } from "antd";
import { Dispatch, SetStateAction } from "react";

const MotorConfigurationModal = (props: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setConfig: Dispatch<SetStateAction<ConfigType>>;
  config: ConfigType;
  open: boolean;
  onLearnNoise: () => void;
  onClearNoise: () => void;
}) => {
  const { setConfig, open, setOpen, config, onLearnNoise, onClearNoise } = props;
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
          onChange={(e) =>
            setConfig({
              ...config,
              lowPassConfig: { ...config.lowPassConfig, isUse: e },
            })
          }
          defaultValue={config.lowPassConfig.isUse}
        />
        <Input
          className="my-3"
          type="number"
          onChange={(e) =>
            setConfig({
              ...config,
              lowPassConfig: {
                ...config.lowPassConfig,
                cofficient: Number(e.target.value),
              },
            })
          }
          min={0}
          max={1}
          step={0.1}
          defaultValue={config.lowPassConfig.cofficient}
          disabled={!config.lowPassConfig.isUse}
        />
      </div>

      <div className="p-3">
        <p className="">Moving Average Filter</p>
        <Switch
          className="shadow-md"
          onChange={(e) =>
            setConfig({
              ...config,
              movingAverageConfig: { ...config.movingAverageConfig, isUse: e },
            })
          }
          defaultValue={config.movingAverageConfig.isUse}
        />
        <Input
          type="number"
          className="my-3"
          onChange={(e) =>
            setConfig({
              ...config,
              movingAverageConfig: {
                ...config.movingAverageConfig,
                windowSize: Number(e.target.value),
              },
            })
          }
          min={0}
          step={1}
          defaultValue={config.movingAverageConfig.windowSize}
          disabled={!config.movingAverageConfig.isUse}
        />
      </div>
      <div className="p-3">
        <p className="">ノイズカット</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          モーターを止めた状態で「ノイズ学習」を押すと、2秒間の環境音をスペクトルから差し引きます。
        </p>
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => {
              onLearnNoise();
              message.info("2秒間の環境音を学習します。モーターは止めたままにしてください");
            }}
          >
            ノイズ学習
          </Button>
          <Button onClick={onClearNoise}>解除</Button>
        </div>
        <p className="text-sm">ゲート閾値 (0-255)。これ未満のピークは無視</p>
        <Input
          type="number"
          min={0}
          max={255}
          step={5}
          onChange={(e) => setConfig({ ...config, noiseGate: Number(e.target.value) })}
          defaultValue={config.noiseGate ?? 100}
        />
      </div>
      <div className="p-3">
        <p className="">計測に最大値ではなく微分値を使用する</p>
        <Switch
          className="shadow-md"
          onChange={(e) => setConfig({ ...config, using_derivative: e })}
          defaultValue={config.using_derivative}
        />
      </div>
      <div className="p-3">
        <p className="">更新時間</p>
        <Input
          type="number"
          onChange={(e) =>
            setConfig({ ...config, calcInterval: Number(e.target.value) })
          }
          defaultValue={config.calcInterval}
        />
      </div>
      <div className="p-3">
        <p className="">計測する範囲(rpm)</p>
        <div className="flex">
          <Input
            type="number"
            onChange={(e) =>
              setConfig({
                ...config,
                minFrequency: Number(e.target.value) / 10,
              })
            }
            defaultValue={Math.round(config.minFrequency * 10)}
          />{" "}
          <span className="mx-2 translate-y-2"> ~ </span>
          <Input
            type="number"
            onChange={(e) => {
              setConfig({
                ...config,
                maxFrequency: Number(e.target.value) / 10,
              });
            }}
            defaultValue={Math.round(config.maxFrequency * 10)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default MotorConfigurationModal;
