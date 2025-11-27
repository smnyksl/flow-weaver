import { Emotion, Suggestion } from '@/types/journal';

export const emotionLabels: Record<Emotion, string> = {
  happy: 'Mutlu',
  sad: 'Üzgün',
  anxious: 'Endişeli',
  angry: 'Kızgın',
  neutral: 'Nötr',
  excited: 'Heyecanlı',
  calm: 'Sakin',
};

export const emotionColors: Record<Emotion, string> = {
  happy: 'bg-yellow-500',
  sad: 'bg-blue-500',
  anxious: 'bg-orange-500',
  angry: 'bg-red-500',
  neutral: 'bg-gray-500',
  excited: 'bg-pink-500',
  calm: 'bg-teal-500',
};

export const emotionEmojis: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  neutral: '😐',
  excited: '🤩',
  calm: '😌',
};

export const allSuggestions: Record<Emotion, Suggestion[]> = {
  happy: [
    { type: 'activity', title: 'Bu anı paylaş', description: 'Sevdiklerinle bu güzel anı paylaşmayı düşün.' },
    { type: 'motivation', title: 'Günlük tutmaya devam et', description: 'Mutlu anlarını kaydet, zor zamanlarda sana güç verecek.' },
    { type: 'activity', title: 'Minnettarlık listesi yaz', description: 'Bugün için şükrettiğin 3 şeyi yaz.' },
    { type: 'breathing', title: 'Mutluluk meditasyonu', description: '5 dakika gözlerini kapat ve bu mutluluğu hisset.' },
    { type: 'activity', title: 'Fotoğraf çek', description: 'Bu anı ölümsüzleştir, bir fotoğraf çek.' },
    { type: 'motivation', title: 'Başarını kutla', description: 'Küçük ya da büyük, her başarı kutlanmayı hak eder.' },
    { type: 'activity', title: 'Sevdiğin müziği aç', description: 'Bu güzel anın soundtrackini oluştur.' },
    { type: 'motivation', title: 'İyiliği yay', description: 'Mutluluğun bulaşıcı! Birine iltifat et.' },
  ],
  sad: [
    { type: 'breathing', title: '4-7-8 Nefes Egzersizi', description: '4 saniye nefes al, 7 saniye tut, 8 saniye yavaşça ver.' },
    { type: 'activity', title: 'Kısa yürüyüş', description: '10 dakikalık bir yürüyüş ruh halini iyileştirebilir.' },
    { type: 'motivation', title: 'Bu da geçecek', description: 'Duygular geçicidir. Kendine nazik ol.' },
    { type: 'activity', title: 'Sıcak bir içecek hazırla', description: 'Bir fincan çay veya kahve rahatlatıcı olabilir.' },
    { type: 'breathing', title: 'Derin nefes al', description: '10 derin nefes al, her nefeste rahatla.' },
    { type: 'activity', title: 'Bir arkadaşını ara', description: 'Bazen sadece konuşmak bile iyi gelir.' },
    { type: 'motivation', title: 'Kendine şefkat göster', description: 'Üzgün olmak normaldir. Kendine bir arkadaşına davranır gibi davran.' },
    { type: 'activity', title: 'Rahatlatıcı müzik dinle', description: 'Sakin bir playlist aç ve dinlen.' },
    { type: 'activity', title: 'Duş al', description: 'Sıcak bir duş hem bedeni hem zihni rahatlatır.' },
    { type: 'motivation', title: 'Küçük adımlar at', description: 'Her şeyi bir anda çözmek zorunda değilsin.' },
  ],
  anxious: [
    { type: 'breathing', title: 'Kutu Nefesi', description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver, 4 saniye bekle.' },
    { type: 'activity', title: '5-4-3-2-1 Tekniği', description: '5 şey gör, 4 şey dokun, 3 şey duy, 2 şey kokla, 1 şey tat.' },
    { type: 'motivation', title: 'Şu an güvendesin', description: 'Endişeler gelecekle ilgili, ama sen şu anda buradasın.' },
    { type: 'breathing', title: 'Karın nefesi', description: 'Elini karnına koy, nefes alırken karnının yükseldiğini hisset.' },
    { type: 'activity', title: 'Ayaklarını yere bas', description: 'Ayaklarının yere değdiğini hisset, şu ana dön.' },
    { type: 'motivation', title: 'Endişelerini yaz', description: 'Kafandakileri kağıda dök, daha net düşünebilirsin.' },
    { type: 'activity', title: 'Soğuk su iç', description: 'Bir bardak soğuk su sinir sistemini sakinleştirir.' },
    { type: 'breathing', title: 'Uzatılmış nefes verme', description: 'Nefes alırken 4, verirken 8 say. Yavaşça rahatla.' },
    { type: 'activity', title: 'Ellerini yıka', description: 'Ilık suyla ellerini yıka, anı hisset.' },
    { type: 'motivation', title: 'Bu his geçici', description: 'Kaygı dalgası geçecek. Sadece bekle ve nefes al.' },
  ],
  angry: [
    { type: 'breathing', title: 'Derin nefes', description: '10 derin nefes al. Her nefeste öfkeyi bırak.' },
    { type: 'activity', title: 'Fiziksel aktivite', description: 'Enerjini boşaltmak için koş veya egzersiz yap.' },
    { type: 'motivation', title: 'Tepki vermeden önce dur', description: 'Duygularını hisset ama tepkini seç.' },
    { type: 'activity', title: 'Buz tut', description: 'Elinde buz tut, fiziksel his dikkatini dağıtır.' },
    { type: 'breathing', title: 'Aslan nefesi', description: 'Ağzını aç, dilini çıkar ve güçlü bir "haaa" sesiyle nefes ver.' },
    { type: 'activity', title: 'Yastığa vur', description: 'Öfkeni güvenli bir şekilde boşalt.' },
    { type: 'motivation', title: 'Perspektif kazan', description: '1 yıl sonra bu olay önemli olacak mı?' },
    { type: 'activity', title: 'Yazarak boşal', description: 'Tüm öfkeni kağıda yaz, sonra istersen yırt.' },
    { type: 'breathing', title: 'Yavaş nefes', description: 'Çok yavaş nefes al ve ver. Kalp atışını yavaşlat.' },
    { type: 'motivation', title: 'Anlayış göster', description: 'Karşı tarafın bakış açısını anlamaya çalış.' },
  ],
  neutral: [
    { type: 'activity', title: 'Yeni bir şey dene', description: 'Bugün küçük bir değişiklik yapmaya ne dersin?' },
    { type: 'motivation', title: 'Farkındalık', description: 'Nötr olmak da bir his. Anı kabul et.' },
    { type: 'activity', title: 'Bir hobi keşfet', description: 'Yeni bir şeyler öğrenmek için harika bir zaman.' },
    { type: 'breathing', title: 'Farkındalık nefesi', description: 'Sadece nefesine odaklan, 5 dakika boyunca.' },
    { type: 'activity', title: 'Doğaya çık', description: 'Dışarıda biraz zaman geçir, tazelenmiş hissedebilirsin.' },
    { type: 'motivation', title: 'Hedeflerini gözden geçir', description: 'Ne yapmak istiyorsun? Planlarını düşün.' },
    { type: 'activity', title: 'Bir kitap oku', description: 'Birkaç sayfa okumak zihnini canlandırabilir.' },
    { type: 'activity', title: 'Bir arkadaşına mesaj at', description: 'Uzun zamandır konuşmadığın biriyle bağlantı kur.' },
  ],
  excited: [
    { type: 'activity', title: 'Enerjiyi kanalize et', description: 'Bu enerjiyi yaratıcı bir projeye yönlendir.' },
    { type: 'motivation', title: 'Hedeflerini hatırla', description: 'Bu heyecanı hedeflerine ulaşmak için kullan.' },
    { type: 'activity', title: 'Planlarını yaz', description: 'Heyecanlandığın şey için bir aksiyon planı oluştur.' },
    { type: 'breathing', title: 'Dengeleyici nefes', description: 'Heyecanı korurken sakinliği de bul.' },
    { type: 'activity', title: 'Birileriyle paylaş', description: 'Heyecanını sevdiklerinle paylaş!' },
    { type: 'motivation', title: 'Bu anı yaşa', description: 'Heyecan güzel bir duygu, tadını çıkar.' },
    { type: 'activity', title: 'Vizyon panosu oluştur', description: 'Hedeflerini görselleştir.' },
    { type: 'activity', title: 'Dans et', description: 'Enerjini müzikle birlikte hareket ederek ifade et.' },
  ],
  calm: [
    { type: 'breathing', title: 'Meditasyon', description: '5 dakikalık sessiz oturma pratiği yap.' },
    { type: 'motivation', title: 'Bu anı yaşa', description: 'Sakinlik bir armağan. Keyfini çıkar.' },
    { type: 'activity', title: 'Günlük yaz', description: 'Bu sakin anı yazıya dök.' },
    { type: 'breathing', title: 'Beden taraması', description: 'Ayaklarından başlayarak tüm bedenini hisset.' },
    { type: 'activity', title: 'Çay veya kahve hazırla', description: 'Ritüelini yavaşça ve farkındalıkla yap.' },
    { type: 'motivation', title: 'Minnettarlık düşün', description: 'Bu sakin an için şükret.' },
    { type: 'activity', title: 'Esne', description: 'Hafif esneme hareketleriyle bedenini rahatla.' },
    { type: 'activity', title: 'Doğa sesleri dinle', description: 'Kuş sesleri veya yağmur sesi ile rahatla.' },
  ],
};

// Function to get random suggestions for an emotion
export function getRandomSuggestions(emotion: Emotion, count: number = 3): Suggestion[] {
  const suggestions = allSuggestions[emotion] || allSuggestions.neutral;
  const shuffled = [...suggestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Legacy export for backward compatibility
export const defaultSuggestions = allSuggestions;
