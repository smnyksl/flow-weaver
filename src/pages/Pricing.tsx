import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Check, X, Sparkles, Zap, Crown, ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Ücretsiz',
    price: '₺0',
    period: 'sonsuza kadar',
    description: 'Başlamak için harika bir seçim',
    features: [
      { text: 'Günlük 3 duygu kaydı', included: true },
      { text: 'Temel duygu analizi', included: true },
      { text: 'Haftalık özet rapor', included: true },
      { text: '7 günlük geçmiş görüntüleme', included: true },
      { text: 'Temel öneriler', included: true },
      { text: 'AI destekli derinlemesine analiz', included: false },
      { text: 'Sınırsız duygu kaydı', included: false },
      { text: 'Aylık detaylı raporlar', included: false },
      { text: 'Veri dışa aktarma', included: false },
      { text: 'Öncelikli destek', included: false },
    ],
    cta: 'Ücretsiz Başla',
    href: '/auth?signup=true',
    popular: false,
    gradient: 'from-gray-500 to-gray-600',
  },
  {
    name: 'Premium',
    price: '₺49',
    period: '/ay',
    description: 'Tam deneyim için en iyi seçim',
    features: [
      { text: 'Sınırsız duygu kaydı', included: true },
      { text: 'Gelişmiş AI duygu analizi', included: true },
      { text: 'Haftalık ve aylık raporlar', included: true },
      { text: 'Sınırsız geçmiş görüntüleme', included: true },
      { text: 'Kişiselleştirilmiş AI önerileri', included: true },
      { text: 'AI destekli derinlemesine analiz', included: true },
      { text: 'Tetikleyici analizi', included: true },
      { text: 'Trend ve örüntü tespiti', included: true },
      { text: 'Veri dışa aktarma (PDF, CSV)', included: true },
      { text: 'Öncelikli e-posta desteği', included: true },
    ],
    cta: 'Premium\'a Geç',
    href: '/auth?signup=true&plan=premium',
    popular: true,
    gradient: 'from-primary to-accent',
  },
  {
    name: 'Pro',
    price: '₺99',
    period: '/ay',
    description: 'Profesyoneller ve terapistler için',
    features: [
      { text: 'Premium\'un tüm özellikleri', included: true },
      { text: 'Çoklu profil yönetimi', included: true },
      { text: 'Gelişmiş raporlama araçları', included: true },
      { text: 'API erişimi', included: true },
      { text: 'Özel entegrasyonlar', included: true },
      { text: 'Takım işbirliği özellikleri', included: true },
      { text: 'Beyaz etiket seçeneği', included: true },
      { text: '7/24 öncelikli destek', included: true },
      { text: 'Kişisel hesap yöneticisi', included: true },
      { text: 'Özel eğitim ve danışmanlık', included: true },
    ],
    cta: 'Pro\'ya Geç',
    href: '/auth?signup=true&plan=pro',
    popular: false,
    gradient: 'from-purple-500 to-pink-500',
  },
];

const faqs = [
  {
    question: 'Ücretsiz plan gerçekten ücretsiz mi?',
    answer: 'Evet! Ücretsiz planımız sonsuza kadar ücretsizdir. Kredi kartı gerektirmez ve istediğiniz zaman premium\'a geçebilirsiniz.',
  },
  {
    question: 'İstediğim zaman iptal edebilir miyim?',
    answer: 'Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal işlemi anında gerçekleşir ve kalan süreniz boyunca premium özelliklerden yararlanmaya devam edersiniz.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer: 'Kesinlikle! Tüm verileriniz şifrelenerek saklanır ve sadece siz erişebilirsiniz. Verilerinizi asla üçüncü taraflarla paylaşmayız.',
  },
  {
    question: 'Planlar arasında geçiş yapabilir miyim?',
    answer: 'Evet, istediğiniz zaman planlar arasında geçiş yapabilirsiniz. Yükseltme anında aktif olur, düşürme ise mevcut dönem sonunda.',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Duygu Günlüğü
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" className="hidden sm:inline-flex border-border/50 hover:border-primary/50">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Şeffaf Fiyatlandırma
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Size Uygun{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Planı Seçin
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ücretsiz başlayın, ihtiyaçlarınız büyüdükçe yükseltin. Gizli ücret yok, sürpriz yok.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={cn(
                  "relative group",
                  plan.popular && "md:-mt-4 md:mb-4"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium shadow-lg">
                      <Crown className="w-4 h-4" />
                      En Popüler
                    </div>
                  </div>
                )}

                {/* Glow effect */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                  plan.gradient
                )} />

                {/* Card */}
                <div className={cn(
                  "relative h-full p-8 bg-card/80 backdrop-blur-sm rounded-3xl border transition-all duration-500 hover:-translate-y-2",
                  plan.popular 
                    ? "border-primary/50 shadow-xl shadow-primary/10" 
                    : "border-border/50 hover:border-primary/30"
                )}>
                  {/* Plan icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
                    plan.gradient
                  )}>
                    {plan.name === 'Ücretsiz' && <Zap className="w-7 h-7 text-white" />}
                    {plan.name === 'Premium' && <Sparkles className="w-7 h-7 text-white" />}
                    {plan.name === 'Pro' && <Crown className="w-7 h-7 text-white" />}
                  </div>

                  {/* Plan name */}
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className={cn(
                      "text-4xl sm:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      plan.gradient
                    )}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  {/* CTA Button */}
                  <Link to={plan.href} className="block mb-8">
                    <Button 
                      className={cn(
                        "w-full py-6 text-lg font-medium transition-all hover:scale-105 gap-2",
                        plan.popular 
                          ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          feature.included 
                            ? "bg-green-500/10" 
                            : "bg-muted"
                        )}>
                          {feature.included ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-border/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-foreground">30 Gün Para İade Garantisi</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Premium veya Pro planlarımızdan memnun kalmazsanız, 30 gün içinde tam para iadesi alabilirsiniz. Hiçbir soru sorulmaz.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-muted-foreground">
              Aklınıza takılan soruların cevapları burada
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] p-8 sm:p-12 text-center shadow-2xl"
            style={{ animation: 'gradient 4s ease infinite' }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Hala kararsız mısınız?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Ücretsiz planımızla başlayın ve Duygu Günlüğü'nün size nasıl yardımcı olabileceğini keşfedin.
              </p>
              <Link to="/auth?signup=true">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 gap-2 bg-white text-primary hover:bg-white/90 shadow-xl hover:scale-105 transition-all">
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Duygu Günlüğü</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © 2024 Duygu Günlüğü. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Ana Sayfa
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Gradient animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
