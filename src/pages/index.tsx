import { useRouter } from "next/router";
import { Button } from "antd";
const Home = () => {
  const router = useRouter();

  const pushList = [
    { key: 1, name: "バンクスルー", path: "/bank-through" },
    { key: 2, name: "モーター", path: "/motor" },
  ];
  return (
    <div className="p-4 text-center">
      {pushList.map((item) => (
        <Button
          type="default"
          className="m-2 w-[200px] h-[50px]"
          key={item.key}
          onClick={() => router.push(item.path)}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default Home;
