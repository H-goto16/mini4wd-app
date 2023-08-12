import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  const pushList = [
    { key: 1, name: "バンクスルー", path: "/bank-through" },
    { key: 2, name: "モーター", path: "/motor" },
  ];
  return (
    <div className="p-4">
      {pushList.map((item) => (
        <button
          key={item.key}
          className="text-2xl my-4 block"
          onClick={() => router.push(item.path)}
        >
          ・{item.name}
        </button>
      ))}
    </div>
  );
};

export default Home;
