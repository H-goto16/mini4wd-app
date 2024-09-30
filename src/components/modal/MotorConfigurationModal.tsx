import { ConfigType } from "@/types/config";
import { Input, Modal, Switch } from "antd";
import { Dispatch, SetStateAction } from "react";

const MotorConfigurationModal = (props: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  setConfig: Dispatch<SetStateAction<ConfigType>>;
  config: ConfigType;
  open: boolean;
}) => {
  const { setConfig, open, setOpen, config } = props;
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
        <p className="">計測する範囲(Hz) 調整中</p>
        <div className="flex">
          <Input
            type="number"
            onChange={(e) =>
              setConfig({
                ...config,
                minFrequency: Number(e.target.value),
              })
            }
            defaultValue={config.minFrequency}
          />{" "}
          <span className="mx-2 translate-y-2"> ~ </span>
          <Input
            type="number"
            onChange={(e) => {
              setConfig({
                ...config,
                maxFrequency: Number(e.target.value),
              });
            }}
            defaultValue={config.maxFrequency}
          />
        </div>
      </div>
    </Modal>
  );
};

export default MotorConfigurationModal;
