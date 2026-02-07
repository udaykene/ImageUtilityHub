import { motion } from 'framer-motion';

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large circle - top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className="absolute -top-32 -right-32 w-64 h-64 sm:w-96 sm:h-96 bg-primary rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(19, 127, 236, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Medium circle - bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="absolute -bottom-32 -left-32 w-48 h-48 sm:w-72 sm:h-72 bg-accent-purple rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)',
        }}
      />

      {/* Floating cube */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/4 right-1/4 w-16 h-16 sm:w-24 sm:h-24 hidden md:block"
      >
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl backdrop-blur-sm transform rotate-12" />
      </motion.div>

      {/* Small floating circle */}
      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-1/3 left-1/3 w-12 h-12 sm:w-16 sm:h-16 hidden lg:block"
      >
        <div className="w-full h-full bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 border border-accent-purple/20 rounded-full backdrop-blur-sm" />
      </motion.div>
    </div>
  );
}

export function ToolShapeDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
      {/* Top right accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
      
      {/* Bottom left accent */}
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-purple/10 rounded-full blur-2xl" />
    </div>
  );
}