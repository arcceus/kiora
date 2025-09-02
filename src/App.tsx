
import { ThemeProvider } from './components/theme-provider';
import { GalleryView } from './components/GalleryView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleLayoutEditor } from './components/SimpleLayoutEditor';
import { useEffect } from 'react';

import { ArweaveWalletKit, useActiveAddress, useApi, useConnection } from '@arweave-wallet-kit/react'
import { getStrategy } from './lib/strategy'
import { fixConnection, WAuthProviders } from '@wauth/strategy'
import WanderStrategy from "@arweave-wallet-kit/wander-strategy"
import type { Strategy } from '@arweave-wallet-kit/core/strategy'
import { initializeTurboWithWalletKit } from './lib/turbo';

export default function App() {

  const strategies = [
    new WanderStrategy(),
    getStrategy(WAuthProviders.Github),
    getStrategy(WAuthProviders.Google),
    getStrategy(WAuthProviders.Discord)
  ]

  const address = useActiveAddress()
  const { connected, disconnect } = useConnection()
  const api = useApi()

  useEffect(() => fixConnection(address, connected, disconnect), [address, connected, disconnect])

  useEffect(() => {
    initializeTurboWithWalletKit(api, connected)
  }, [api, connected])

  return (
    <ArweaveWalletKit
      config={{
        strategies: strategies as Strategy[],
        permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "ACCESS_PUBLIC_KEY"],
        appInfo: {
          name: "Your App",
          logo: "your-logo-url"
        },
        
      }}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/" element={<GalleryView />} />
            <Route path="/builder" element={<SimpleLayoutEditor />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </ArweaveWalletKit>

  );
};
