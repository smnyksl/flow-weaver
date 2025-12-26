import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">Gizlilik Politikası</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Giriş</h2>
            <p className="text-muted-foreground leading-relaxed">
              Duygu Günlüğü uygulaması ("Uygulama") olarak, kullanıcılarımızın gizliliğine büyük önem veriyoruz. 
              Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını, saklandığını ve 
              korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. Toplanan Veriler</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Uygulamamızı kullanırken aşağıdaki veriler toplanabilir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>E-posta adresi ve hesap bilgileri</li>
              <li>Günlük girişleri ve duygusal veriler</li>
              <li>Uygulama kullanım istatistikleri</li>
              <li>Cihaz bilgileri ve IP adresi</li>
              <li>Tercih ve ayar bilgileri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Verilerin Kullanımı</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Toplanan veriler aşağıdaki amaçlarla kullanılmaktadır:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Uygulama hizmetlerinin sunulması ve iyileştirilmesi</li>
              <li>Kişiselleştirilmiş deneyim sağlanması</li>
              <li>Yapay zeka destekli duygu analizi</li>
              <li>Kullanıcı desteği sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Veri Güvenliği</h2>
            <p className="text-muted-foreground leading-relaxed">
              Verileriniz, endüstri standardı güvenlik önlemleri ile korunmaktadır. SSL/TLS şifreleme, 
              güvenli sunucu altyapısı ve düzenli güvenlik denetimleri uygulanmaktadır. Verilerinize 
              yalnızca yetkili personel erişebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Üçüncü Taraf Paylaşımı</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kişisel verileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz. 
              Hizmet sağlayıcılarımız (sunucu, ödeme işlemcisi vb.) ile yalnızca hizmet sunumu için 
              gerekli minimum veri paylaşılır ve bu taraflar gizlilik sözleşmeleri ile bağlıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Çerezler</h2>
            <p className="text-muted-foreground leading-relaxed">
              Uygulamamız, kullanıcı deneyimini iyileştirmek için çerezler kullanabilir. Çerezler, 
              oturum yönetimi ve tercih hatırlama için kullanılır. Tarayıcı ayarlarınızdan çerezleri 
              devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Kullanıcı Hakları</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini talep etme</li>
              <li>Veri işlemeye itiraz etme</li>
              <li>Veri taşınabilirliği talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. İletişim</h2>
            <p className="text-muted-foreground leading-relaxed">
              Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:<br />
              E-posta: destek@duygugulugu.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Değişiklikler</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler hakkında 
              kullanıcılarımız bilgilendirilecektir.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
