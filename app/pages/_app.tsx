import { useHuddle01 } from "@huddle01/react";
import { ThemeProvider } from "@mui/material";
import {
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { DialogProvider } from "context/dialog";
import type { AppProps } from "next/app";
import NextNProgress from "nextjs-progressbar";
import { SnackbarProvider } from "notistack";
import { useEffect, useState } from "react";
import { theme } from "theme";
import { getSupportedChains } from "utils/chains";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import "../styles/globals.css";

const { chains, provider } = configureChains(
  [...getSupportedChains()],
  [
    // Alchemy provider
    ...(process.env.NEXT_PUBLIC_ALCHEMY_ID
      ? [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID })]
      : []),
    // Public provider
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Stream Challenges",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const {
    initialize: initializeHuddle01,
    isInitialized: isHuddle01Initialized,
  } = useHuddle01();

  /**
   * Fix for hydration error (docs - https://github.com/vercel/next.js/discussions/35773#discussioncomment-3484225)
   */
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    initializeHuddle01(process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID || "");
  }, []);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({ accentColor: theme.palette.primary.main })}
      >
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3}>
            <DialogProvider>
              <NextNProgress height={4} color={theme.palette.primary.main} />
              {isPageLoaded && isHuddle01Initialized && (
                <Component {...pageProps} />
              )}
            </DialogProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
