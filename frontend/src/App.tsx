import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

import { BackgroundArt } from './components/BackgroundArt.tsx';
import { PageTransition } from './components/PageTransition.tsx';
import AboutPage from './pages/About.tsx';
import DashboardPage from './pages/Dashboard.tsx';
import NftPage from './pages/Nft.tsx';
import WalletPage from './pages/Wallet.tsx';

const navLinks = [
  { path: '/', label: 'Dashboard' },
  { path: '/wallet', label: 'Wallet' },
  { path: '/nft', label: 'NFT' },
  { path: '/about', label: 'About Me' },
];

function App() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updatePadding = () => {
      const main = mainRef.current;
      const header = headerRef.current;
      
      if (main && header) {
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          // Only add padding on mobile for pages other than home
          if (location.pathname !== '/') {
            const headerHeight = header.offsetHeight;
            // Add extra spacing to match NFT page "Mint" spacing
            main.style.paddingTop = `${headerHeight + 16}px`;
          } else {
            main.style.paddingTop = '0';
          }
        } else {
          // On desktop, remove inline padding
          main.style.paddingTop = '';
        }
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding);
    
    return () => {
      window.removeEventListener('resize', updatePadding);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-ink text-ivory relative overflow-x-hidden">
      <BackgroundArt />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-10 px-4 py-3 md:py-10 md:px-10 overflow-x-hidden min-w-0">
        <header 
          ref={headerRef}
          className="fixed top-0 left-0 right-0 z-50 bg-ink md:static md:bg-transparent md:z-auto"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-6 md:flex-row md:items-center px-4 py-3 md:py-0 md:px-0">
            <div className="flex-shrink-0">
              <p className="text-xs uppercase tracking-[0.8em] text-ivory/70">Black Square</p>
              <p className="mt-2 text-lg uppercase tracking-[0.4em] text-flare">
                Suprematist Protocol
              </p>
            </div>
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center w-full min-w-0">
            <nav className="grid grid-cols-2 md:flex md:flex-nowrap gap-2 text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] md:gap-4 w-full md:w-auto">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `border px-3 py-2 md:px-4 md:py-2 transition flex-shrink-0 whitespace-nowrap block text-[0.7rem] md:text-xs text-center ${
                        isActive
                          ? 'border-flare text-flare'
                          : 'border-ivory/20 text-ivory/60 hover:border-ivory/60 hover:text-ivory'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="flex flex-nowrap items-center gap-2 md:gap-4 md:ml-auto flex-shrink w-full md:w-auto justify-center md:justify-start">
              <div className="w-full md:w-auto max-w-full overflow-hidden flex items-center justify-center md:justify-start">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                        className="w-full md:w-auto max-w-full overflow-hidden flex items-center justify-center md:justify-start"
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="border border-ivory/20 bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-ivory transition hover:border-flare hover:text-flare mx-auto md:mx-0"
                              >
                                Connect Wallet
                              </button>
                            );
                          }

                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="border border-flare bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-flare transition hover:bg-flare hover:text-ink"
                              >
                                Wrong network
                              </button>
                            );
                          }

                          return (
                            <div className="flex gap-2 w-full md:w-auto max-w-full justify-center md:justify-start">
                              <button
                                onClick={openChainModal}
                                type="button"
                                className="border border-ivory/20 bg-black px-3 py-2 text-xs uppercase tracking-[0.3em] text-ivory transition hover:border-flare hover:text-flare flex items-center gap-2 hidden flex-shrink-0"
                              >
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground,
                                      width: 12,
                                      height: 12,
                                      borderRadius: 999,
                                      overflow: 'hidden',
                                      marginRight: 4,
                                    }}
                                  >
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? 'Chain icon'}
                                        src={chain.iconUrl}
                                        style={{ width: 12, height: 12 }}
                                      />
                                    )}
                                  </div>
                                )}
                                {chain.name}
                              </button>

                              <button
                                onClick={openAccountModal}
                                type="button"
                                className="border border-ivory/20 bg-black px-4 py-2 text-xs uppercase tracking-[0.3em] text-ivory transition hover:border-flare hover:text-flare max-w-[200px] md:max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap flex-shrink min-w-0"
                              >
                                {account.displayName}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            </div>
          </div>
          </div>
        </header>
        <main ref={mainRef} className="flex-1 pb-0 md:pb-16">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route
                index
                element={
                  <PageTransition>
                    <DashboardPage />
                  </PageTransition>
                }
              />
              <Route
                path="/wallet"
                element={
                  <PageTransition>
                    <WalletPage />
                  </PageTransition>
                }
              />
              <Route
                path="/nft"
                element={
                  <PageTransition>
                    <NftPage />
                  </PageTransition>
                }
              />
              <Route
                path="/about"
                element={
                  <PageTransition>
                    <AboutPage />
                  </PageTransition>
                }
              />
              <Route
                path="*"
                element={
                  <PageTransition>
                    <DashboardPage />
                  </PageTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="text-xs uppercase tracking-[0.4em] text-ivory/40 text-center">
          MINIMAL CHAIN EXPERIMENTS BY DANIIL PATLAKH
        </footer>
      </div>
    </div>
  );
}

export default App;
