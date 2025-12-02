import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';

import App from './App.tsx';
import { wagmiConfig } from './lib/wagmi.ts';

const queryClient = new QueryClient();

const rainbowTheme = darkTheme({
  accentColor: '#d2042d', // Flare red
  accentColorForeground: '#f5f5f5',
  borderRadius: 'none', // Sharp corners for suprematism
  fontStack: 'system',
  overlayBlur: 'none',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={rainbowTheme} locale="en">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
