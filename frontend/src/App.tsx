import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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

  return (
    <div className="min-h-screen bg-ink text-ivory relative overflow-x-hidden">
      <BackgroundArt />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 md:gap-10 px-4 py-3 md:py-10 md:px-10 overflow-x-hidden">
        <header className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-center">
          <div className="flex-shrink-0">
            <p className="text-xs uppercase tracking-[0.8em] text-ivory/70">Black Square</p>
            <p className="mt-2 text-lg uppercase tracking-[0.4em] text-flare">
              Suprematist Protocol
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center w-full">
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
            <div className="flex flex-nowrap items-center gap-2 md:gap-4 md:ml-auto flex-shrink-0 w-full md:w-auto justify-center md:justify-start">
              <div className="max-w-full overflow-visible">
                <ConnectButton showBalance={false} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-0 md:pb-16 pt-4 md:pt-0">
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
