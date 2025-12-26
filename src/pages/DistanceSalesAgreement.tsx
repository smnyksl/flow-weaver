import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DistanceSalesAgreement = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">
          Mesafeli Satış Sözleşmesi
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 1 - TARAFLAR</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>1.1. SATICI:</strong>
              <br />
              Unvan: Diarylogs
              <br />
              E-posta: support@diarylogs.com
              <br />
              <br />
              <strong>1.2. ALICI:</strong>
              <br />
              Uygulama üzerinden üyelik oluşturan ve abonelik satın alan kullanıcı.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 2 - KONU</h2>
            <p className="text-muted-foreground leading-relaxed">
              İşbu Sözleşme'nin konusu, ALICI'nın SATICI'ya ait Duygu Günlüğü uygulaması üzerinden 
              elektronik ortamda siparişini verdiği abonelik hizmetinin satışı ve teslimi ile 
              ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler 
              Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin belirlenmesidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 3 - SÖZLEŞME KONUSU HİZMET</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong>3.1. Hizmet Bilgileri:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Hizmet Adı: Duygu Günlüğü Premium Abonelik</li>
              <li>Haftalık Abonelik: ₺19</li>
              <li>Aylık Abonelik: ₺69</li>
              <li>Yıllık Abonelik: ₺749</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong>3.2. Premium Abonelik Kapsamı:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Sınırsız günlük girişi</li>
              <li>Yapay zeka destekli gelişmiş duygu analizi</li>
              <li>Detaylı haftalık ve aylık raporlar</li>
              <li>Kişiselleştirilmiş öneriler</li>
              <li>Reklamsız deneyim</li>
              <li>Öncelikli destek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 4 - ÖDEME ŞEKLİ</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ödeme, kredi kartı veya banka kartı ile online olarak gerçekleştirilir. 
              Abonelikler, seçilen süreye göre otomatik olarak yenilenir. ALICI, aboneliğini 
              istediği zaman iptal edebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 5 - HİZMETİN İFASI</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ödemenin onaylanmasının ardından Premium abonelik özellikleri anında aktif hale gelir. 
              Hizmet, dijital ortamda sunulmakta olup fiziksel teslimat bulunmamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 6 - CAYMA HAKKI</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>6.1.</strong> ALICI, dijital içerik ve hizmetlerin ifasına başlanmasından önce 
              14 gün içinde cayma hakkını kullanabilir.
              <br />
              <br />
              <strong>6.2.</strong> Mesafeli Sözleşmeler Yönetmeliği'nin 15/ğ maddesi uyarınca, 
              elektronik ortamda anında ifa edilen hizmetlerde ve tüketiciye anında teslim edilen 
              gayri maddi mallarda cayma hakkı kullanılamaz.
              <br />
              <br />
              <strong>6.3.</strong> Premium abonelik satın alındığında hizmet anında başladığından, 
              ALICI cayma hakkından feragat ettiğini kabul eder.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 7 - ABONELİK İPTALİ</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>7.1.</strong> ALICI, aboneliğini istediği zaman uygulama üzerinden veya 
              support@diarylogs.com adresine e-posta göndererek iptal edebilir.
              <br />
              <br />
              <strong>7.2.</strong> İptal işlemi, mevcut abonelik döneminin sonunda geçerli olur. 
              İptal tarihine kadar olan süre için iade yapılmaz.
              <br />
              <br />
              <strong>7.3.</strong> İptal sonrasında Premium özellikler, mevcut abonelik 
              döneminin sonuna kadar kullanılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 8 - GENEL HÜKÜMLER</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>8.1.</strong> ALICI, işbu Sözleşme'yi ve Ön Bilgilendirme Formu'nu okuduğunu, 
              anladığını ve kabul ettiğini beyan eder.
              <br />
              <br />
              <strong>8.2.</strong> SATICI, önceden bildirmeksizin hizmet ücretlerini ve içeriğini 
              değiştirme hakkını saklı tutar. Değişiklikler mevcut abonelikleri etkilemez.
              <br />
              <br />
              <strong>8.3.</strong> İşbu Sözleşme'den doğabilecek uyuşmazlıklarda Türkiye Cumhuriyeti 
              mahkemeleri ve icra daireleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 9 - YETKİLİ MAHKEME</h2>
            <p className="text-muted-foreground leading-relaxed">
              İşbu Sözleşme'den doğan uyuşmazlıklarda, Gümrük ve Ticaret Bakanlığı tarafından ilan 
              edilen değere kadar Tüketici Hakem Heyetleri, bu değeri aşan uyuşmazlıklarda 
              Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">MADDE 10 - YÜRÜRLÜK</h2>
            <p className="text-muted-foreground leading-relaxed">
              İşbu Sözleşme, ALICI tarafından elektronik ortamda onaylandığı tarihte yürürlüğe girer. 
              Sözleşme'nin bir nüshası ALICI'nın kayıtlı e-posta adresine gönderilir.
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

export default DistanceSalesAgreement;
