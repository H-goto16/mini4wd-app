import { useEffect, useState } from "react";
import Footer from "../common/footer";
import { Input } from "antd";

const BankThroughFront = () => {
  const [frontBrakeDistance, setFrontBrakeDistance] = useState(0);
  const [bankR, setBankR] = useState(0);
  const [tireD, setTireD] = useState(0);
  const [wheelbase, setWheelbase] = useState(0);
  const [breakH, setBreakH] = useState(0);

  useEffect(() => {
    const tireRadius = tireD / 2;
    const bankThrough =
      Math.sqrt(
        bankR ** 2 -
          (Math.sqrt((bankR - tireRadius) ** 2 - (wheelbase / 2) ** 2) +
            tireRadius -
            breakH) **
            2
      ) -
      wheelbase / 2;

    setFrontBrakeDistance(bankThrough);
  }, [bankR, tireD, wheelbase, breakH]);

  return (
    <>
      <div className="m-4">
        <h1 className="text-2xl text-center py-5">バンクスルー(フロント)</h1>
        <div className="flex flex-wrap justify-center py-20">
          <div className="mr-2">
            <h2 className="text-lg my-3">バンク半径(mm)</h2>
            <Input
              type="number"
              className="border border-b-violet-600 w-60 h-10 bg-gray-100"
              onChange={(e) => setBankR(Number(e.target.value))}
            />
          </div>
          <div className="mr-2">
            <h2 className="text-lg my-3">タイヤ直径(mm)</h2>
            <Input
              type="number"
              className="border border-b-violet-600 w-60 h-10 bg-gray-100"
              onChange={(e) => setTireD(Number(e.target.value))}
            />
          </div>
          <div className="mr-2">
            <h2 className="text-lg my-3">ホイールベース(mm)</h2>
            <Input
              type="number"
              className="border border-b-violet-600 w-60 h-10 bg-gray-100"
              onChange={(e) => setWheelbase(Number(e.target.value))}
            />
          </div>
          <div className="mr-2">
            <h2 className="text-lg my-3">ブレーク最低部の高さ(mm)</h2>
            <Input
              type="number"
              className="border border-b-violet-600 w-60 h-10 bg-gray-100"
              onChange={(e) => setBreakH(Number(e.target.value))}
            />
          </div>
        </div>
        <h1 className="text-center text-lg mt-4">{`ホイールからブレーキの距離は${frontBrakeDistance}mm以内です`}</h1>
      </div>
      <Footer />
    </>
  );
};

export default BankThroughFront;
