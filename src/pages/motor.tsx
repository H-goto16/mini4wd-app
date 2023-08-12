import dynamic from "next/dynamic";
const Spectrum = dynamic(() => import("../components/calc/spectrum-analyzer"), {
  ssr: false,
});

const Motor = () => {
  return <Spectrum />;
};

export default Motor;