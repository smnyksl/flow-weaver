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

export const defaultSuggestions: Record<Emotion, Suggestion[]> = {
  happy: [
    { type: 'activity', title: 'Bu anı paylaş', description: 'Sevdiklerinle bu güzel anı paylaşmayı düşün.' },
    { type: 'motivation', title: 'Günlük tutmaya devam et', description: 'Mutlu anlarını kaydet, zor zamanlarda sana güç verecek.' },
  ],
  sad: [
    { type: 'breathing', title: '4-7-8 Nefes Egzersizi', description: '4 saniye nefes al, 7 saniye tut, 8 saniye yavaşça ver.' },
    { type: 'activity', title: 'Kısa yürüyüş', description: '10 dakikalık bir yürüyüş ruh halini iyileştirebilir.' },
    { type: 'motivation', title: 'Bu da geçecek', description: 'Duygular geçicidir. Kendine nazik ol.' },
  ],
  anxious: [
    { type: 'breathing', title: 'Kutu Nefesi', description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver, 4 saniye bekle.' },
    { type: 'activity', title: '5-4-3-2-1 Tekniği', description: '5 şey gör, 4 şey dokun, 3 şey duy, 2 şey kokla, 1 şey tat.' },
    { type: 'motivation', title: 'Şu an güvendesin', description: 'Endişeler gelecekle ilgili, ama sen şu anda buradasın.' },
  ],
  angry: [
    { type: 'breathing', title: 'Derin nefes', description: '10 derin nefes al. Her nefeste öfkeyi bırak.' },
    { type: 'activity', title: 'Fiziksel aktivite', description: 'Enerjini boşaltmak için koş veya egzersiz yap.' },
    { type: 'motivation', title: 'Tepki vermeden önce dur', description: 'Duygularını hisset ama tepkini seç.' },
  ],
  neutral: [
    { type: 'activity', title: 'Yeni bir şey dene', description: 'Bugün küçük bir değişiklik yapmaya ne dersin?' },
    { type: 'motivation', title: 'Farkındalık', description: 'Nötr olmak da bir his. Anı kabul et.' },
  ],
  excited: [
    { type: 'activity', title: 'Enerjiyi kanalize et', description: 'Bu enerjiyi yaratıcı bir projeye yönlendir.' },
    { type: 'motivation', title: 'Hedeflerini hatırla', description: 'Bu heyecanı hedeflerine ulaşmak için kullan.' },
  ],
  calm: [
    { type: 'breathing', title: 'Meditasyon', description: '5 dakikalık sessiz oturma pratiği yap.' },
    { type: 'motivation', title: 'Bu anı yaşa', description: 'Sakinlik bir armağan. Keyfini çıkar.' },
  ],
};
