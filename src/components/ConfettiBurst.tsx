import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  shape: 'circle' | 'square' | 'star' | 'coin';
}

const COLORS = [
  '#10b981', // Cameroon Green
  '#ef4444', // Cameroon Red
  '#facc15', // Cameroon Yellow
  '#065f46', // Deep Emerald
  '#3b82f6', // Ocean Blue
  '#f59e0b', // Amber Gold
  '#ec4899', // Pink
];

export const ConfettiBurst: React.FC<{ triggerKey: number | string }> = ({ triggerKey }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 45 burst particles
    const newParticles: Particle[] = [];
    const shapes: ('circle' | 'square' | 'star' | 'coin')[] = ['circle', 'square', 'star', 'coin'];

    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + (Math.random() - 0.5) * 0.3;
      const speed = 120 + Math.random() * 260;
      newParticles.push({
        id: i,
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80, // slight upward bias
        size: 8 + Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 1800);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50 flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              x: p.vx,
              y: p.vy,
              opacity: [1, 1, 0],
              scale: [0.5, 1.2, 0.7],
              rotate: p.rotation + 360 * (p.vx > 0 ? 1 : -1),
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.4,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="absolute"
          >
            {p.shape === 'circle' && (
              <div
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: '9999px',
                }}
              />
            )}
            {p.shape === 'square' && (
              <div
                style={{
                  width: p.size,
                  height: p.size * 0.8,
                  backgroundColor: p.color,
                  borderRadius: '2px',
                }}
              />
            )}
            {p.shape === 'star' && (
              <span
                style={{
                  fontSize: p.size * 1.3,
                  color: p.color,
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            )}
            {p.shape === 'coin' && (
              <div
                style={{
                  width: p.size * 1.1,
                  height: p.size * 1.1,
                  backgroundColor: '#f59e0b',
                  border: '2px solid #fef08a',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: '#78350f',
                }}
              >
                ¢
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
