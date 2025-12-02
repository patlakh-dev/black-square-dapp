import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { MalevichSquare } from '../components/MalevichSquare.tsx';

export default function DashboardPage() {
  return (
    <section className="grid gap-2 md:gap-12 md:grid-cols-[1.1fr_1fr] md:items-start">
      <motion.div
        className="space-y-4 md:space-y-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.p
          className="text-xs uppercase tracking-[0.8em] text-ivory/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Suprematism
        </motion.p>
        <div className="space-y-3 md:space-y-4">
          <motion.h1
            className="text-2xl md:text-4xl font-light uppercase tracking-[0.2em] md:tracking-[0.4em] lg:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Black Square Control Room
          </motion.h1>
          <motion.p
            className="max-w-lg text-sm md:text-base text-ivory/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            A minimalist interface for connecting your wallet, sending ethereal transactions, minting
            and staking the Black Square NFT, and claiming daily Malevich rewards. The palette stays
            stark—absolute black punctuated by sharp white and flare red accents.
          </motion.p>
        </div>

        <div className="grid gap-2 md:gap-6">
          <div className="hidden md:flex md:flex-row md:flex-wrap gap-2 md:gap-4 text-xs uppercase tracking-[0.4em]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full md:w-auto"
            >
              <Link
                to="/wallet"
                className="border border-ivory/40 px-6 py-3 transition hover:border-flare hover:text-flare block text-center w-full"
              >
                Wallet Console
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full md:w-auto"
            >
              <Link
                to="/nft"
                className="border border-flare px-6 py-3 text-flare transition hover:bg-flare hover:text-ink block text-center w-full"
              >
                Mint Black Square
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs uppercase tracking-[0.3em] md:tracking-[0.5em] text-ivory/50">
            <motion.div
              className="border border-ivory/10 p-3 md:p-4 overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{
                borderColor: 'rgba(245, 245, 245, 0.2)',
                transition: { duration: 0.3 },
              }}
            >
              <p className="text-[0.65rem] md:text-xs">Wallet Link</p>
              <p className="mt-2 text-lg md:text-2xl text-ivory break-words overflow-hidden">RainbowKit</p>
            </motion.div>
            <motion.div
              className="border border-ivory/10 p-3 md:p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{
                borderColor: 'rgba(245, 245, 245, 0.2)',
                transition: { duration: 0.3 },
              }}
            >
              <p className="text-[0.65rem] md:text-xs">Chain</p>
              <p className="mt-2 text-lg md:text-2xl text-ivory">Sepolia</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hidden md:flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-[360px] h-[360px] flex items-center justify-center">
          <MalevichSquare size={360} />
        </div>
      </motion.div>
    </section>
  );
}

