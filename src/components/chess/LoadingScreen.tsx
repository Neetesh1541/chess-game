import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const chessPieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
const loadingMessages = [
  'Preparing your game...',
  'Setting up the board...',
  'Polishing the pieces...',
  'Ready to play!',
];

export const LoadingScreen = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 600);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 40);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: ['-50%', '50%', '-50%'],
            y: ['-50%', '30%', '-50%'],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ left: '50%', top: '50%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full bg-secondary/20 blur-3xl"
          animate={{
            x: ['30%', '-30%', '30%'],
            y: ['30%', '-30%', '30%'],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ left: '30%', top: '60%' }}
        />
      </div>

      {/* Chess piece ring animation */}
      <motion.div
        className="relative w-40 h-40 mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {chessPieces.map((piece, index) => (
          <motion.div
            key={index}
            className="absolute text-4xl"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: '-50%', y: '-50%', rotate: index * 60 }}
            animate={{ rotate: [index * 60, index * 60 + 360] }}
            transition={{ rotate: { duration: 4, repeat: Infinity, ease: 'linear' } }}
          >
            <motion.span
              className="block text-primary drop-shadow-lg"
              style={{ transform: `translateY(-60px) rotate(-${index * 60}deg)` }}
              animate={{ 
                rotate: [0, -360],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }
              }}
            >
              {piece}
            </motion.span>
          </motion.div>
        ))}

        {/* Center crown */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl text-primary"
          animate={{ 
            scale: [1, 1.15, 1], 
            opacity: [0.8, 1, 0.8],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♚
        </motion.div>

        {/* Glowing ring */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-primary/30"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Chess Master
      </motion.h1>

      {/* Progress bar */}
      <motion.div
        className="w-72 h-2 bg-secondary/50 rounded-full overflow-hidden mb-4"
        initial={{ opacity: 0, scaleX: 0.8 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>

      {/* Loading message */}
      <motion.p
        className="text-muted-foreground text-sm h-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.span
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {loadingMessages[messageIndex]}
        </motion.span>
      </motion.p>

      {/* Chess board pattern decoration */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex justify-center">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 ${i % 2 === 0 ? 'bg-foreground' : 'bg-transparent'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.03 }}
            />
          ))}
        </div>
        <div className="flex justify-center">
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-8 h-8 ${i % 2 === 1 ? 'bg-foreground' : 'bg-transparent'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.03 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Developer credit */}
      <motion.p
        className="absolute bottom-8 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Developed by{' '}
        <a 
          href="https://www.neetesh.tech" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline font-medium"
        >
          Neetesh
        </a>
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
