import { useState, useEffect } from 'react';
import characterFront from '@/assets/character/front.svg';
import characterLeft from '@/assets/character/left.svg';
import characterRight from '@/assets/character/right.svg';
import characterHalfLeft from '@/assets/character/half-left.svg';

const poses = [
  { src: characterFront, name: 'front' },
  { src: characterHalfLeft, name: 'half-left' },
  { src: characterLeft, name: 'left' },
  { src: characterHalfLeft, name: 'half-left' },
  { src: characterFront, name: 'front' },
  { src: characterRight, name: 'right' },
];

export const AnimatedCharacter = () => {
  const [currentPose, setCurrentPose] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentPose((prev) => (prev + 1) % poses.length);
        setIsTransitioning(false);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 right-4 w-16 h-16 z-10">
      <div 
        className="w-full h-full transition-all duration-500 ease-in-out"
        style={{
          transform: `scale(${isTransitioning ? 0.95 : 1})`,
          opacity: isTransitioning ? 0.7 : 1,
        }}
      >
        <img
          src={poses[currentPose].src}
          alt="Animated character"
          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            animation: 'float 3s ease-in-out infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-4px) rotate(1deg);
          }
          50% {
            transform: translateY(-2px) rotate(0deg);
          }
          75% {
            transform: translateY(-6px) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
};
