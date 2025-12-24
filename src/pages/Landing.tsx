import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Heart, TrendingUp, Sparkles, Shield, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Destekli Analiz',
    description: 'Yapay zeka ile duygularınızı derinlemesine analiz edin ve kişiselleştirilmiş içgörüler edinin.',
  },
  {
    icon: Heart,
    title: 'Duygusal Takip',
    description: 'Günlük duygularınızı kaydedin, tetikleyicileri belirleyin ve duygusal yolculuğunuzu takip edin.',
  },
  {
    icon: TrendingUp,
    title: 'İlerleme Raporları',
    description: 'Haftalık ve aylık raporlarla duygusal sağlığınızdaki gelişmeleri görün.',
  },
  {
    icon: Shield,
    title: 'Gizlilik Öncelikli',
    description: 'Verileriniz güvende. Sadece siz erişebilirsiniz.',
  },
];

const benefits = [
  'Duygularınızı daha iyi anlayın',
  'Stres tetikleyicilerinizi keşfedin',
  'Kişiselleştirilmiş öneriler alın',
  'Duygusal farkındalığınızı artırın',
  'Pozitif alışkanlıklar geliştirin',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Duygu Günlüğü
              </span>
            </div>

            {/* Right side navigation */}
            <div className="flex items-center gap-3">
              <Link to="/pricing">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Fiyatlandırma
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" className="hidden sm:inline-flex">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI Destekli Duygu Takibi
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Duygularınızı Anlayın,{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Kendinizi Keşfedin
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Yapay zeka destekli duygu günlüğü ile duygusal sağlığınızı takip edin, 
              tetikleyicilerinizi keşfedin ve kişiselleştirilmiş içgörüler edinin.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg px-8 py-6 gap-2">
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Giriş Yap
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Ücretsiz deneme
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Kredi kartı gerekmez
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Güvenli ve gizli
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-border/50 p-4 sm:p-8">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
            
            {/* Mock App Preview */}
            <div className="relative bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-accent p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">Bugün nasıl hissediyorsun?</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-3">
                  {['😊 Mutlu', '😢 Üzgün', '😰 Kaygılı', '😌 Sakin', '🤩 Heyecanlı'].map((emotion) => (
                    <div
                      key={emotion}
                      className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary/10 transition-colors cursor-pointer"
                    >
                      {emotion}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">AI Önerisi</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Bugün biraz stresli görünüyorsun. 5 dakikalık bir nefes egzersizi yapmayı deneyebilirsin."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Neden Duygu Günlüğü?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Duygusal farkındalığınızı artırmak için ihtiyacınız olan tüm araçlar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Duygusal sağlığınızı bir üst seviyeye taşıyın
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Duygu Günlüğü, günlük duygularınızı kaydetmenizi, analiz etmenizi ve 
                zaman içindeki değişimleri görmenizi sağlar.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8">
                <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-foreground">Haftalık Rapor</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mutlu</span>
                      <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-yellow-500 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sakin</span>
                      <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-teal-500 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Kaygılı</span>
                      <div className="flex-1 mx-4 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-1/4 bg-purple-500 rounded-full" />
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-8 sm:p-12 text-center">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Duygusal yolculuğunuza bugün başlayın
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Kendinizi daha iyi tanımak için ilk adımı atın. Ücretsiz hesap oluşturun ve hemen başlayın.
              </p>
              <Link to="/auth?signup=true">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2 bg-white text-primary hover:bg-white/90">
                  Ücretsiz Hesap Oluştur
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Duygu Günlüğü</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Duygu Günlüğü. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Giriş Yap
              </Link>
              <Link to="/auth?signup=true" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
