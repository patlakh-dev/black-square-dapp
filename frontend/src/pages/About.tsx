import { motion } from 'framer-motion';

export default function AboutPage() {
  const skills = [
    'React',
    'TypeScript',
    'Next.js',
    'Solidity',
    'Web3',
    'Smart Contracts',
    'Token Development',
    'Wagmi',
    'Viem',
    'Hardhat',
    'OpenZeppelin',
    'Node.js',
    'Express',
    'Fastify',
    'REST API',
    'MongoDB',
    'Redis',
    'Docker',
    'Nginx',
    'Socket.io',
    'Vite',
    'Telegram Bots',
    'IPFS',
    'Tailwind CSS',
    'Framer Motion',
  ];

  return (
    <div className="space-y-4 md:space-y-12">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.6em] text-ivory/50">About Me</p>
        <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] md:tracking-[0.3em]">
          Daniil <span className="text-flare">Patlakh</span>
        </h2>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-[1fr_2fr] md:items-start">
        {/* Photo section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative border-2 border-ivory/20 bg-black aspect-square overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Circular vignette effect using radial gradient */}
              <div 
                className="absolute inset-0"
                style={{
                  background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)'
                }}
              />
              {/* Photo - circular crop with vignette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-3/4 h-3/4 rounded-full overflow-hidden">
                  <img
                    src="/photo.jpg"
                    alt="Daniil Patlakh"
                    className="w-full h-full object-cover grayscale contrast-110 brightness-90"
                    onError={(e) => {
                      // Fallback if image not found
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full bg-ivory/5 flex items-center justify-center"><p class="text-xs uppercase tracking-[0.4em] text-ivory/20">Photo</p></div>';
                      }
                    }}
                  />
                  {/* Additional vignette overlay for photo */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.6) 100%)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content section */}
        <div className="space-y-8">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="border border-ivory/20 p-6 space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-ivory/60 mb-4">About</p>
            <p className="text-sm text-ivory/70 leading-relaxed">
              Full-stack developer building modern web applications across diverse domains. 
              Experienced in implementing any design vision, from minimalist interfaces to complex interactive experiences. 
              Proficient in frontend, backend, and blockchain development.
            </p>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="border border-ivory/20 p-6 space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-ivory/60 mb-4">Skills</p>
            <div className="flex flex-wrap gap-2 overflow-hidden">
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.03, duration: 0.3 }}
                  className="border border-ivory/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ivory/70 hover:border-flare/40 hover:text-flare transition"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="border border-ivory/20 p-6 space-y-4"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-ivory/60 mb-4">Contacts</p>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:dpatlakhh@gmail.com"
                className="block text-ivory/70 hover:text-flare transition border-b border-transparent hover:border-flare/40 pb-1"
              >
                dpatlakhh@gmail.com
              </a>
              <a
                href="https://github.com/patlakh-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-ivory/70 hover:text-flare transition border-b border-transparent hover:border-flare/40 pb-1"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/daniil-patlakh-baaa8190"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-ivory/70 hover:text-flare transition border-b border-transparent hover:border-flare/40 pb-1"
              >
                LinkedIn
              </a>
              <a
                href="https://t.me/dpatlakh"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-ivory/70 hover:text-flare transition border-b border-transparent hover:border-flare/40 pb-1"
              >
                Telegram
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

