import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const KVKK = () => {
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

        <h1 className="text-3xl font-bold text-foreground mb-8">
          Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">1. Veri Sorumlusu</h2>
            <p className="text-muted-foreground leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz 
              veri sorumlusu sıfatıyla Duygu Günlüğü tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">2. İşlenen Kişisel Veriler</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Tarafımızca işlenen kişisel veri kategorileri:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi</li>
              <li><strong>Sağlık Verileri:</strong> Duygusal durum bilgileri, ruh hali kayıtları</li>
              <li><strong>İşlem Güvenliği:</strong> IP adresi, cihaz bilgileri, oturum bilgileri</li>
              <li><strong>Finansal Bilgiler:</strong> Ödeme işlem bilgileri (kart bilgileri saklanmaz)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Üyelik işlemlerinin gerçekleştirilmesi</li>
              <li>Uygulama hizmetlerinin sunulması</li>
              <li>Yapay zeka destekli duygu analizi hizmetinin sağlanması</li>
              <li>Kişiselleştirilmiş içerik ve öneriler sunulması</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri ilişkileri yönetimi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Bilgi güvenliği süreçlerinin yürütülmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kişisel verileriniz KVKK'nın 5. ve 6. maddelerinde belirtilen hukuki sebeplere dayanarak işlenmektedir:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Açık rızanızın bulunması</li>
              <li>Sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması</li>
              <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
              <li>Temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Özel Nitelikli Kişisel Veriler</h2>
            <p className="text-muted-foreground leading-relaxed">
              Duygusal durum bilgileri, KVKK kapsamında özel nitelikli kişisel veri olarak değerlendirilebilir. 
              Bu veriler, yalnızca açık rızanız ile ve gerekli güvenlik önlemleri alınarak işlenmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Kişisel Verilerin Aktarılması</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Kişisel verileriniz, yukarıda belirtilen amaçlarla:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşlarına</li>
              <li>Hizmet sağlayıcı iş ortaklarımıza (sunucu, ödeme hizmeti vb.)</li>
              <li>Yurt dışındaki sunuculara (gerekli güvenlik önlemleri alınarak)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              aktarılabilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">7. Kişisel Verilerin Toplanma Yöntemi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kişisel verileriniz; uygulama üzerinden kayıt olurken, günlük girişi yaparken, 
              ödeme işlemi gerçekleştirirken ve uygulamayı kullanırken otomatik veya otomatik 
              olmayan yollarla toplanmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">8. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
              <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
              <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
              <li>Kişisel verilerinizin düzeltilmesi, silinmesi veya yok edilmesine ilişkin işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">9. Başvuru Yöntemi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki iletişim kanallarından 
              bize ulaşabilirsiniz:<br /><br />
              E-posta: kvkk@duygugulugu.com<br /><br />
              Başvurularınız en geç 30 gün içinde sonuçlandırılacaktır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">10. Veri Saklama Süresi</h2>
            <p className="text-muted-foreground leading-relaxed">
              Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre boyunca ve yasal 
              saklama süreleri kapsamında muhafaza edilecektir. Hesabınızı sildiğinizde, 
              verileriniz yasal zorunluluklar saklı kalmak kaydıyla silinecektir.
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

export default KVKK;
