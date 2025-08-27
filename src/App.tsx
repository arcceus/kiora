
import { ThemeProvider } from './components/theme-provider';
import { GalleryView } from './components/GalleryView';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimpleLayoutEditor } from './components/SimpleLayoutEditor';
import { ArweaveWalletKit } from "@arweave-wallet-kit/react"
import WanderStrategy from "@arweave-wallet-kit/wander-strategy"
import WAuthStrategy from "@wauth/strategy"
import { WAuthProviders } from "@wauth/strategy"

export default function App() { 

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ArweaveWalletKit
          config={{
            strategies: [
              new WanderStrategy(),
              new WAuthStrategy({ provider: WAuthProviders.Google }),
            ],
            permissions: ["ACCESS_ADDRESS", "SIGNATURE", "SIGN_TRANSACTION"],
          }}
          theme={{ displayTheme: "dark" }}
        >
        <Routes>
          <Route path="/" element={<GalleryView />} />
          <Route path="/builder" element={<SimpleLayoutEditor />} />
        </Routes>
        </ArweaveWalletKit>
      </ThemeProvider>
    </BrowserRouter>
  );
};
