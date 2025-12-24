import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Heart, TrendingUp, Sparkles, Shield, BarChart3, ArrowRight, CheckCircle2, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI Destekli Analiz',
    description: 'Yapay zeka ile duygularınızı derinlemesine analiz edin ve kişiselleştirilmiş içgörüler edinin.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Heart,
    title: 'Duygusal Takip',
    description: 'Günlük duygularınızı kaydedin, tetikleyicileri belirleyin ve duygusal yolculuğunuzu takip edin.',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'İlerleme Raporları',
    description: 'Haftalık ve aylık raporlarla duygusal sağlığınızdaki gelişmeleri görün.',
    gradient: 'from-green-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Gizlilik Öncelikli',
    description: 'Verileriniz güvende. Sadece siz erişebilirsiniz.',
    gradient: 'from-blue-500 to-cyan-500',
  },
];

const benefits = [
  'Duygularınızı daha iyi anlayın',
  'Stres tetikleyicilerinizi keşfedin',
  'Kişiselleştirilmiş öneriler alın',
  'Duygusal farkındalığınızı artırın',
  'Pozitif alışkanlıklar geliştirin',
];

const stats = [
  { value: '10K+', label: 'Aktif Kullanıcı' },
  { value: '500K+', label: 'Günlük Kayıt' },
  { value: '95%', label: 'Memnuniyet' },
  { value: '4.9', label: 'Uygulama Puanı', icon: Star },
];

// Custom hook for intersection observer animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

function AnimatedSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
        <div 
          className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s', transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)` }}
        />
        <div 
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s', transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)` }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Duygu Günlüğü
              </span>
            </div>

            {/* Right side navigation */}
            <div className="flex items-center gap-3">
              <Link to="/pricing">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground transition-colors">
                  Fiyatlandırma
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="hidden sm:inline-flex border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <AnimatedSection>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-8 border border-primary/20 shadow-lg shadow-primary/10">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI Destekli Duygu Takibi
                <Zap className="w-4 h-4 text-accent" />
              </div>
            </AnimatedSection>

            {/* Headline */}
            <AnimatedSection delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
                Duygularınızı Anlayın,{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                    Kendinizi Keşfedin
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round" className="animate-draw"/>
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
            </AnimatedSection>

            {/* Subheadline */}
            <AnimatedSection delay={200}>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Yapay zeka destekli duygu günlüğü ile duygusal sağlığınızı takip edin, 
                tetikleyicilerinizi keşfedin ve kişiselleştirilmiş içgörüler edinin.
              </p>
            </AnimatedSection>

            {/* CTA Buttons */}
            <AnimatedSection delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth?signup=true">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all text-lg px-8 py-6 gap-2 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 group">
                    Ücretsiz Başla
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105">
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust indicators */}
            <AnimatedSection delay={400}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                {[
                  { icon: CheckCircle2, text: 'Ücretsiz deneme' },
                  { icon: CheckCircle2, text: 'Kredi kartı gerekmez' },
                  { icon: Shield, text: 'Güvenli ve gizli' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 hover:text-foreground transition-colors">
                    <item.icon className="w-4 h-4 text-green-500" />
                    {item.text}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <AnimatedSection className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1 flex items-center justify-center gap-1">
                    {stat.value}
                    {stat.icon && <stat.icon className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Visual Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-purple-500/5 border border-border/30 p-4 sm:p-8 shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-52 h-52 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              
              {/* Mock App Preview */}
              <div 
                className="relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden transform hover:scale-[1.02] transition-transform duration-500"
                style={{ transform: `perspective(1000px) rotateX(${mousePosition.y * 0.05}deg) rotateY(${mousePosition.x * 0.05}deg)` }}
              >
                <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium">Bugün nasıl hissediyorsun?</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {['😊 Mutlu', '😢 Üzgün', '😰 Kaygılı', '😌 Sakin', '🤩 Heyecanlı'].map((emotion, i) => (
                      <div
                        key={emotion}
                        className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary/10 hover:scale-110 transition-all cursor-pointer"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {emotion}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium text-foreground">AI Önerisi</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      "Bugün biraz stresli görünüyorsun. 5 dakikalık bir nefes egzersizi yapmayı deneyebilirsin."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Neden{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Duygu Günlüğü
              </span>
              ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Duygusal farkındalığınızı artırmak için ihtiyacınız olan tüm araçlar
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 100}>
                <div className="group relative h-full">
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500",
                    feature.gradient
                  )} style={{ opacity: 0.1 }} />
                  <div className="relative h-full p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                    <div className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg",
                      feature.gradient
                    )}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Duygusal sağlığınızı{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  bir üst seviyeye
                </span>{' '}
                taşıyın
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Duygu Günlüğü, günlük duygularınızı kaydetmenizi, analiz etmenizi ve 
                zaman içindeki değişimleri görmenizi sağlar.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li 
                    key={benefit} 
                    className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground group-hover:text-primary transition-colors">{benefit}</span>
                  </li>
                ))}
              </ul>
            </AnimatedSection>
            
            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl animate-pulse" />
                <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-border/30">
                  <div className="bg-card rounded-2xl p-6 shadow-xl border border-border hover:scale-[1.02] transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-foreground">Haftalık Rapor</span>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Mutlu', value: 75, color: 'bg-yellow-500' },
                        { label: 'Sakin', value: 50, color: 'bg-teal-500' },
                        { label: 'Kaygılı', value: 25, color: 'bg-purple-500' },
                      ].map((item, i) => (
                        <div key={item.label} className="flex items-center justify-between group">
                          <span className="text-sm text-muted-foreground w-16">{item.label}</span>
                          <div className="flex-1 mx-4 h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient p-8 sm:p-12 text-center shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
              
              {/* Floating icons */}
              <Sparkles className="absolute top-8 left-12 w-6 h-6 text-white/30 animate-float" />
              <Heart className="absolute bottom-12 right-16 w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '1s' }} />
              <Star className="absolute top-16 right-24 w-5 h-5 text-white/25 animate-float" style={{ animationDelay: '2s' }} />
              
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                  Duygusal yolculuğunuza bugün başlayın
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                  Kendinizi daha iyi tanımak için ilk adımı atın. Ücretsiz hesap oluşturun ve hemen başlayın.
                </p>
                <Link to="/auth?signup=true">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2 bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-all group">
                    Ücretsiz Hesap Oluştur
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Duygu Günlüğü</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Duygu Günlüğü. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Giriş Yap
              </Link>
              <Link to="/auth?signup=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
        @keyframes draw {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw {
          stroke-dasharray: 300;
          animation: draw 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
