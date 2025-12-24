import { Brain, Sparkles, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const phrases = [
  { text: "Duygularını anlıyorum...", emoji: "💭" },
  { text: "Seni dinliyorum...", emoji: "👂" },
  { text: "Hissettiklerini analiz ediyorum...", emoji: "🧠" },
  { text: "Sana özel öneriler hazırlıyorum...", emoji: "✨" },
];

export function AnalyzingAnimation() {
  return (
    <div className="relative bg-gradient-to-br from-card via-card to-primary/5 rounded-2xl border border-border/50 p-8 shadow-lg overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
      </div>
      
      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Brain 
          className="absolute text-primary/20 w-8 h-8 animate-bounce" 
          style={{ top: '10%', left: '15%', animationDuration: '2s', animationDelay: '0s' }} 
        />
        <Sparkles 
          className="absolute text-accent/30 w-6 h-6 animate-bounce" 
          style={{ top: '20%', right: '20%', animationDuration: '1.5s', animationDelay: '0.3s' }} 
        />
        <Heart 
          className="absolute text-pink-400/30 w-7 h-7 animate-bounce" 
          style={{ bottom: '15%', left: '20%', animationDuration: '1.8s', animationDelay: '0.6s' }} 
        />
        <MessageCircle 
          className="absolute text-teal-400/30 w-5 h-5 animate-bounce" 
          style={{ bottom: '25%', right: '15%', animationDuration: '2.2s', animationDelay: '0.9s' }} 
        />
      </div>
      
      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center text-center space-y-6">
        {/* Animated brain icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-md" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-accent rounded-full shadow-md" />
          </div>
        </div>
        
        {/* Animated text */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <span className="inline-block animate-pulse">Analiz ediliyor</span>
            <span className="inline-flex">
              <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
            </span>
          </h3>
          
          {/* Cycling phrases */}
          <div className="h-6 overflow-hidden">
            <div className="animate-slide-phrases">
              {phrases.map((phrase, index) => (
                <p 
                  key={index} 
                  className="text-sm text-muted-foreground h-6 flex items-center justify-center gap-1"
                >
                  <span>{phrase.emoji}</span>
                  <span>{phrase.text}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full bg-primary/30 transition-all duration-300',
                'animate-pulse'
              )}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse" />
      
      {/* Custom animation styles */}
      <style>{`
        @keyframes slide-phrases {
          0%, 20% { transform: translateY(0); }
          25%, 45% { transform: translateY(-24px); }
          50%, 70% { transform: translateY(-48px); }
          75%, 95% { transform: translateY(-72px); }
          100% { transform: translateY(0); }
        }
        .animate-slide-phrases {
          animation: slide-phrases 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
