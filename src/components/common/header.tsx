import { CalculatorIcon } from "@heroicons/react/20/solid";

const Header = () => {
  return (
    <>
      <div className="m-3">
        <h1 className="text-3xl text-center">
          <CalculatorIcon className="inline-block w-8 h-8 mr-1 text-gray-500 -translate-y-1" />
          Mini4wd Calc
        </h1>
        <hr className="mt-3" />
      </div>
    </>
  );
};

export default Header;
