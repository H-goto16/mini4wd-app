import useAudioVisualizer from "@/hooks/useAudioVisualizer";

const MicrophoneFrequencyVisualizer: React.FC = () => {
  const { canvasRef } = useAudioVisualizer();
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight / 2}
      />
    </div>
  );
};

export default MicrophoneFrequencyVisualizer;
