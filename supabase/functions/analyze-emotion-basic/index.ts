import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple keyword-based emotion detection for free users
const EMOTION_KEYWORDS: Record<string, string[]> = {
  happy: ['mutlu', 'sevinç', 'güzel', 'harika', 'muhteşem', 'iyi', 'mükemmel', 'süper', 'bayıldım', 'sevindim', 'gülümseme', 'neşe', 'keyif', '😊', '😄', '🥰', '❤️', '💕', 'gülüyorum'],
  sad: ['üzgün', 'üzücü', 'kötü', 'mutsuz', 'ağladım', 'ağlıyorum', 'hüzün', 'acı', 'yalnız', 'kayıp', 'özlem', '😢', '😭', '💔', 'berbat', 'kırıldım'],
  anxious: ['endişe', 'kaygı', 'stres', 'gergin', 'panik', 'korku', 'tedirgin', 'belirsiz', 'korkuyorum', 'merak', 'sinir', '😰', '😟', '😨', 'baskı'],
  angry: ['sinir', 'öfke', 'kızgın', 'çıldırdım', 'delirdim', 'nefret', 'bıktım', 'usandım', 'berbat', '😤', '😠', '🤬', 'rezalet', 'saçmalık'],
  calm: ['sakin', 'huzur', 'rahat', 'dingin', 'barış', 'sessiz', 'gevşedim', 'rahatlık', '😌', '🧘', 'meditasyon'],
  excited: ['heyecan', 'sabırsız', 'bekleyemiyorum', 'coşku', 'enerji', 'hayal', 'umut', '🎉', '🥳', '✨', 'inşallah', 'umarım'],
};

const BASIC_SUGGESTIONS: Record<string, Array<{type: string; title: string; description: string}>> = {
  happy: [
    { type: 'activity', title: 'Bu anı kutla! 🎉', description: 'Güzel geçen günü bir arkadaşınla paylaş.' },
    { type: 'motivation', title: 'Pozitif enerji', description: 'Bu güzel hissiyatı yarına da taşı!' },
  ],
  sad: [
    { type: 'breathing', title: 'Derin nefes al 💙', description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver.' },
    { type: 'activity', title: 'Kendine iyi bak', description: 'Sıcak bir içecek hazırla ve dinlen.' },
  ],
  anxious: [
    { type: 'breathing', title: 'Sakinleşme nefesi', description: 'Burundan 4 saniye nefes al, ağızdan 6 saniye ver.' },
    { type: 'motivation', title: 'Her şey geçici', description: 'Bu an geçecek, güçlüsün.' },
  ],
  angry: [
    { type: 'breathing', title: 'Soğuma nefesi 🧊', description: '10\'a kadar say, her sayıda derin nefes al.' },
    { type: 'activity', title: 'Enerji at', description: 'Hızlı bir yürüyüş veya spor yap.' },
  ],
  calm: [
    { type: 'motivation', title: 'İç huzurun korunsun 🧘', description: 'Bu güzel anı değerlendir.' },
    { type: 'activity', title: 'Keyifli bir şey yap', description: 'Sevdiğin bir aktiviteye zaman ayır.' },
  ],
  excited: [
    { type: 'motivation', title: 'Enerjini kullan! ⚡', description: 'Bu motivasyonla bir hedefine adım at.' },
    { type: 'activity', title: 'Planla ve harekete geç', description: 'Heyecanını somut bir adıma dönüştür.' },
  ],
  neutral: [
    { type: 'activity', title: 'Yeni bir şey dene', description: 'Rutininden biraz çık, farklı bir şey yap.' },
    { type: 'breathing', title: 'Farkındalık anı', description: 'Şu an nasıl hissettiğini düşün.' },
  ],
};

function detectEmotion(text: string): { emotion: string; intensity: number; triggers: string[] } {
  const lowerText = text.toLowerCase();
  const emotionScores: Record<string, number> = {
    happy: 0, sad: 0, anxious: 0, angry: 0, calm: 0, excited: 0
  };

  // Count keyword matches
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        emotionScores[emotion]++;
      }
    }
  }

  // Find dominant emotion
  let maxScore = 0;
  let detectedEmotion = 'neutral';
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion;
    }
  }

  // Calculate intensity (1-10)
  const intensity = Math.min(10, Math.max(1, Math.round(5 + maxScore * 1.5)));

  // Extract simple triggers (words after common trigger phrases)
  const triggerPhrases = ['çünkü', 'nedeniyle', 'yüzünden', 'için', 'sebebiyle'];
  const triggers: string[] = [];
  
  for (const phrase of triggerPhrases) {
    const idx = lowerText.indexOf(phrase);
    if (idx !== -1) {
      const afterPhrase = text.slice(idx + phrase.length, idx + phrase.length + 30).trim();
      const words = afterPhrase.split(/[\s.,!?]+/).slice(0, 3).join(' ');
      if (words.length > 2) {
        triggers.push(words);
      }
    }
  }

  return { emotion: detectedEmotion, intensity, triggers: triggers.slice(0, 2) };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    console.log('[Basic Analysis] Analyzing:', text.substring(0, 50) + '...');

    const { emotion, intensity, triggers } = detectEmotion(text);
    const suggestions = BASIC_SUGGESTIONS[emotion] || BASIC_SUGGESTIONS.neutral;

    console.log('[Basic Analysis] Result:', { emotion, intensity, triggers });

    return new Response(
      JSON.stringify({
        primaryEmotion: emotion,
        intensity,
        triggers,
        suggestions,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Basic Analysis] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        primaryEmotion: 'neutral',
        intensity: 5,
        triggers: [],
        suggestions: BASIC_SUGGESTIONS.neutral,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
