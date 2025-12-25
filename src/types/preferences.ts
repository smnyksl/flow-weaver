export interface UserPreferences {
  id: string;
  user_id: string;
  music_genres: string[];
  hobbies: string[];
  sleep_pattern: string | null;
  exercise_frequency: string | null;
  personality_type: string | null;
  stress_coping: string[];
  meditation_experience: string | null;
  emotional_goals: string[];
  onboarding_completed: boolean;
  theme_color: string | null;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink' | 'teal';

export const THEME_COLORS: { value: ThemeColor; label: string; hue: number }[] = [
  { value: 'purple', label: 'Mor', hue: 270 },
  { value: 'blue', label: 'Mavi', hue: 210 },
  { value: 'green', label: 'Yeşil', hue: 150 },
  { value: 'orange', label: 'Turuncu', hue: 30 },
  { value: 'pink', label: 'Pembe', hue: 330 },
  { value: 'teal', label: 'Turkuaz', hue: 180 },
];

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  type: 'single' | 'multi';
  field: keyof Pick<UserPreferences, 'music_genres' | 'hobbies' | 'sleep_pattern' | 'exercise_frequency' | 'personality_type' | 'stress_coping' | 'meditation_experience' | 'emotional_goals'>;
  options: { value: string; label: string; icon: string }[];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'music',
    title: 'Hangi müzik türlerini seviyorsun?',
    subtitle: 'Ruh haline göre müzik önerileri için',
    type: 'multi',
    field: 'music_genres',
    options: [
      { value: 'pop', label: 'Pop', icon: '🎤' },
      { value: 'rock', label: 'Rock', icon: '🎸' },
      { value: 'classical', label: 'Klasik', icon: '🎻' },
      { value: 'jazz', label: 'Caz', icon: '🎷' },
      { value: 'hiphop', label: 'Hip Hop', icon: '🎧' },
      { value: 'electronic', label: 'Elektronik', icon: '🎹' },
      { value: 'turkish', label: 'Türk Müziği', icon: '🪘' },
      { value: 'ambient', label: 'Ambient', icon: '🌊' },
    ]
  },
  {
    id: 'hobbies',
    title: 'Boş zamanlarında neler yaparsın?',
    subtitle: 'Aktivite önerileri için',
    type: 'multi',
    field: 'hobbies',
    options: [
      { value: 'reading', label: 'Kitap okumak', icon: '📚' },
      { value: 'sports', label: 'Spor yapmak', icon: '⚽' },
      { value: 'gaming', label: 'Oyun oynamak', icon: '🎮' },
      { value: 'cooking', label: 'Yemek yapmak', icon: '🍳' },
      { value: 'music', label: 'Müzik dinlemek', icon: '🎵' },
      { value: 'nature', label: 'Doğa yürüyüşü', icon: '🌲' },
      { value: 'art', label: 'Sanat/El işi', icon: '🎨' },
      { value: 'movies', label: 'Film/Dizi izlemek', icon: '🎬' },
    ]
  },
  {
    id: 'sleep',
    title: 'Uyku düzenin nasıl?',
    subtitle: 'Enerji seviyeni daha iyi anlamamız için',
    type: 'single',
    field: 'sleep_pattern',
    options: [
      { value: 'early_bird', label: 'Erken yatan, erken kalkan', icon: '🌅' },
      { value: 'night_owl', label: 'Gece kuşu', icon: '🦉' },
      { value: 'irregular', label: 'Düzensiz', icon: '🔄' },
      { value: 'normal', label: 'Normal (22-07)', icon: '😴' },
    ]
  },
  {
    id: 'exercise',
    title: 'Ne sıklıkla egzersiz yaparsın?',
    subtitle: 'Fiziksel aktivite önerileri için',
    type: 'single',
    field: 'exercise_frequency',
    options: [
      { value: 'daily', label: 'Her gün', icon: '💪' },
      { value: 'weekly', label: 'Haftada birkaç kez', icon: '🏃' },
      { value: 'rarely', label: 'Nadiren', icon: '🚶' },
      { value: 'none', label: 'Hiç yapmıyorum', icon: '🛋️' },
    ]
  },
  {
    id: 'personality',
    title: 'Kendini nasıl tanımlarsın?',
    subtitle: 'Kişiliğine uygun öneriler için',
    type: 'single',
    field: 'personality_type',
    options: [
      { value: 'introvert', label: 'İçe dönük', icon: '🧘' },
      { value: 'extrovert', label: 'Dışa dönük', icon: '🎉' },
      { value: 'ambivert', label: 'İkisi arası', icon: '⚖️' },
    ]
  },
  {
    id: 'goals',
    title: 'Duygusal hedeflerin neler?',
    subtitle: 'Sana özel tavsiyelerde bulunmamız için',
    type: 'multi',
    field: 'emotional_goals',
    options: [
      { value: 'reduce_anxiety', label: 'Kaygıyı azaltmak', icon: '😌' },
      { value: 'improve_sleep', label: 'Uyku kalitesini artırmak', icon: '💤' },
      { value: 'boost_confidence', label: 'Özgüveni artırmak', icon: '💎' },
      { value: 'manage_anger', label: 'Öfke kontrolü', icon: '🧘‍♂️' },
      { value: 'find_happiness', label: 'Mutluluğu bulmak', icon: '🌟' },
      { value: 'reduce_stress', label: 'Stresi azaltmak', icon: '🌿' },
    ]
  },
];
