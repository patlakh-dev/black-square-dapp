import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'demo';

if (projectId === 'demo') {
  console.warn(
    'Using the demo WalletConnect project id. Set VITE_WALLETCONNECT_PROJECT_ID for production.',
  );
}

export const chains = [sepolia] as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'Black Square',
  projectId,
  chains,
  ssr: false,
});

