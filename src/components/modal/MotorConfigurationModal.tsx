import { ConfigType } from "@/types/config";
import { Input, Modal } from "antd";
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
    </Modal>
  );
};

export default MotorConfigurationModal;
