import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { themeState } from "@/jotai/themeState";
import Header from "@/components/common/header";

export default function App({ Component, pageProps }: AppProps) {
  const mode = useAtomValue(themeState);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: { colorPrimary: "#ff8a1f" },
      }}
    >
      <Header />
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
