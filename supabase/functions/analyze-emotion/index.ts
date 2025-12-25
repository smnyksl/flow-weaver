import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalEntry {
  primary_emotion: string;
  intensity: number;
  triggers: string[];
  created_at: string;
}

interface UserPreferences {
  musicGenres: string[];
  hobbies: string[];
  sleepPattern: string | null;
  exerciseFrequency: string | null;
  personalityType: string | null;
  stressCoping: string[];
  meditationExperience: string | null;
  emotionalGoals: string[];
}

const PREFERENCE_LABELS: Record<string, Record<string, string>> = {
  musicGenres: {
    pop: 'Pop müzik', rock: 'Rock', classical: 'Klasik müzik', jazz: 'Caz',
    hiphop: 'Hip Hop', electronic: 'Elektronik', turkish: 'Türk müziği', ambient: 'Ambient'
  },
  hobbies: {
    reading: 'Kitap okumak', sports: 'Spor', gaming: 'Oyun oynamak', cooking: 'Yemek yapmak',
    music: 'Müzik dinlemek', nature: 'Doğa yürüyüşü', art: 'Sanat/El işi', movies: 'Film/Dizi'
  },
  sleepPattern: {
    early_bird: 'Erken yatan erken kalkan', night_owl: 'Gece kuşu', irregular: 'Düzensiz', normal: 'Normal'
  },
  exerciseFrequency: {
    daily: 'Her gün', weekly: 'Haftada birkaç kez', rarely: 'Nadiren', none: 'Hiç'
  },
  personalityType: {
    introvert: 'İçe dönük', extrovert: 'Dışa dönük', ambivert: 'İkisi arası'
  },
  emotionalGoals: {
    reduce_anxiety: 'Kaygıyı azaltmak', improve_sleep: 'Uyku kalitesini artırmak',
    boost_confidence: 'Özgüveni artırmak', manage_anger: 'Öfke kontrolü',
    find_happiness: 'Mutluluğu bulmak', reduce_stress: 'Stresi azaltmak'
  }
};

function buildPreferencesContext(prefs: UserPreferences | null): string {
  if (!prefs) return "";
  
  const lines: string[] = [];
  
  if (prefs.musicGenres?.length > 0) {
    const labels = prefs.musicGenres.map(g => PREFERENCE_LABELS.musicGenres[g] || g);
    lines.push(`Sevdiği müzik: ${labels.join(', ')}`);
  }
  
  if (prefs.hobbies?.length > 0) {
    const labels = prefs.hobbies.map(h => PREFERENCE_LABELS.hobbies[h] || h);
    lines.push(`Hobileri: ${labels.join(', ')}`);
  }
  
  if (prefs.sleepPattern) {
    lines.push(`Uyku düzeni: ${PREFERENCE_LABELS.sleepPattern[prefs.sleepPattern] || prefs.sleepPattern}`);
  }
  
  if (prefs.exerciseFrequency) {
    lines.push(`Egzersiz sıklığı: ${PREFERENCE_LABELS.exerciseFrequency[prefs.exerciseFrequency] || prefs.exerciseFrequency}`);
  }
  
  if (prefs.personalityType) {
    lines.push(`Kişilik: ${PREFERENCE_LABELS.personalityType[prefs.personalityType] || prefs.personalityType}`);
  }
  
  if (prefs.emotionalGoals?.length > 0) {
    const labels = prefs.emotionalGoals.map(g => PREFERENCE_LABELS.emotionalGoals[g] || g);
    lines.push(`Duygusal hedefler: ${labels.join(', ')}`);
  }
  
  return lines.length > 0 ? `KULLANICI PROFİLİ:\n${lines.join('\n')}` : "";
}
function analyzeWeeklyTrend(entries: HistoricalEntry[]): string {
  if (entries.length === 0) return "Henüz yeterli veri yok.";
  
  const emotionScores: Record<string, number> = {
    happy: 2, excited: 2, calm: 1,
    neutral: 0,
    sad: -1, anxious: -1, angry: -2
  };
  
  const avgScore = entries.reduce((sum, e) => sum + (emotionScores[e.primary_emotion] || 0), 0) / entries.length;
  const avgIntensity = entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length;
  
  const emotionCounts: Record<string, number> = {};
  entries.forEach(e => {
    emotionCounts[e.primary_emotion] = (emotionCounts[e.primary_emotion] || 0) + 1;
  });
  
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
  
  return `Son 1 haftada ${entries.length} giriş. Baskın duygu: ${dominantEmotion[0]} (${dominantEmotion[1]} kez). Ortalama yoğunluk: ${avgIntensity.toFixed(1)}. Genel duygu skoru: ${avgScore > 0 ? 'pozitif' : avgScore < 0 ? 'negatif' : 'nötr'}.`;
}

function analyzeMonthlyTrend(entries: HistoricalEntry[]): { trend: string; isDecreasing: boolean; details: string } {
  if (entries.length < 5) {
    return { trend: "Aylık analiz için yeterli veri yok.", isDecreasing: false, details: "" };
  }
  
  const emotionScores: Record<string, number> = {
    happy: 2, excited: 2, calm: 1,
    neutral: 0,
    sad: -1, anxious: -1, angry: -2
  };
  
  // Split into first half and second half of month
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(midpoint); // Older entries
  const secondHalf = entries.slice(0, midpoint); // Recent entries
  
  const firstAvg = firstHalf.reduce((sum, e) => sum + (emotionScores[e.primary_emotion] || 0), 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, e) => sum + (emotionScores[e.primary_emotion] || 0), 0) / secondHalf.length;
  
  const change = secondAvg - firstAvg;
  const isDecreasing = change < -0.3;
  const isImproving = change > 0.3;
  
  // Find recurring triggers
  const triggerCounts: Record<string, number> = {};
  entries.forEach(e => {
    (e.triggers || []).forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([trigger]) => trigger);
  
  // Find negative emotion patterns
  const negativeEmotions = entries.filter(e => ['sad', 'anxious', 'angry'].includes(e.primary_emotion));
  const negativeRatio = negativeEmotions.length / entries.length;
  
  let trend = "";
  let details = "";
  
  if (isDecreasing) {
    trend = "Aylık durumun kötüye gidiyor.";
    details = `Son dönemde negatif duyguların oranı %${(negativeRatio * 100).toFixed(0)}. `;
    if (topTriggers.length > 0) {
      details += `Tekrarlayan tetikleyiciler: ${topTriggers.join(', ')}. `;
    }
  } else if (isImproving) {
    trend = "Aylık durumun iyiye gidiyor!";
    details = "Pozitif duyguların artış gösteriyor.";
  } else {
    trend = "Aylık durum stabil.";
    details = topTriggers.length > 0 ? `Dikkat çeken konular: ${topTriggers.join(', ')}.` : "";
  }
  
  return { trend, isDecreasing, details };
}

function getUsedSuggestionTypes(recentSuggestions: string[]): Set<string> {
  return new Set(recentSuggestions);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, historicalEntries, recentSuggestions, userPreferences } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing emotion for text:', text.substring(0, 100) + '...');
    console.log('Historical entries count:', historicalEntries?.length || 0);
    console.log('User preferences received:', JSON.stringify(userPreferences));

    // Analyze historical data
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyEntries = (historicalEntries || []).filter((e: HistoricalEntry) => 
      new Date(e.created_at) >= oneWeekAgo
    );
    const monthlyEntries = (historicalEntries || []).filter((e: HistoricalEntry) => 
      new Date(e.created_at) >= oneMonthAgo
    );
    
    const weeklyAnalysis = analyzeWeeklyTrend(weeklyEntries);
    const monthlyAnalysis = analyzeMonthlyTrend(monthlyEntries);
    const usedSuggestions = getUsedSuggestionTypes(recentSuggestions || []);
    const preferencesContext = buildPreferencesContext(userPreferences || null);
    // Build context for AI
    let contextPrompt = "";
    if (preferencesContext) {
      contextPrompt += preferencesContext + "\n\n";
    }
    
    if (weeklyEntries.length > 0 || monthlyEntries.length > 0) {
      contextPrompt += `KULLANICI GEÇMİŞİ:
- ${weeklyAnalysis}
- ${monthlyAnalysis.trend} ${monthlyAnalysis.details}

SON VERİLEN ÖNERİLER (bunları TEKRARLAMA):
${usedSuggestions.size > 0 ? Array.from(usedSuggestions).slice(0, 5).join(', ') : 'Yok'}
`;
    }

    const systemPrompt = `Sen sıcak, samimi ve anlayışlı bir arkadaş gibi davranan bir duygu koçusun. Kullanıcıyla senli benli, samimi bir dil kullan.

${contextPrompt}

🎯 ANALİZ MANTIĞI (ÇOK ÖNEMLİ - 3 FARKLI KATMAN):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 GÜNLÜK ANALİZ (primaryEmotion, intensity, triggers):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- SADECE şu anki metni analiz et! Geçmiş kayıtları GÖRMEZDEN GEL!
- Kullanıcı BUGÜN ne hissediyorsa O duyguyu yansıt
- Pozitif ifadeler (barışma, gülümseme, umut, 😅😊 emojileri, "iyi gibi", "güzel") → happy veya excited
- Negatif ifadeler (üzüntü, kaygı, öfke, 😢😔 emojileri) → sad, anxious veya angry
- Tetikleyiciler SADECE bugünkü metinden çıkarılmalı - geçmişten KOPYALAMA!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HAFTALIK İÇGÖRÜ (weeklyInsight):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Son 1 haftadaki TÜM kayıtları değerlendir (yukarıda verildi)
- Baskın duygu, genel trend, tekrarlayan temalar
- Bugünkü duyguyu da dahil et
- Örnek: "Bu hafta 4 gün üzgün hissettin ama bugün işler değişmiş gibi! 🌈"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 AYLIK İÇGÖRÜ (monthlyInsight):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Son 1 aydaki genel durumu değerlendir
- İyileşme mi var, kötüleşme mi, stabil mi?
- Uzun vadeli tekrarlayan tetikleyiciler varsa belirt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 ÖNERİLER (suggestions):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- BUGÜNKÜ duyguya UYGUN öneriler ver
- Mutluysa: kutlama, bu anı yaşama önerileri
- Üzgünse: rahatlatıcı, destekleyici öneriler
- Geçmiş verilerden öğrendiğin kalıpları da kullan

Analiz etmen gerekenler:
1. primaryEmotion: BUGÜNKÜ ana duygu (sadece: happy, sad, anxious, angry, neutral, excited, calm)
   - Bu metin olumlu mu olumsuz mu? SADECE bugünkü metne bak!
2. intensity: BUGÜNKÜ yoğunluk (1-10)
3. triggers: BUGÜNKÜ tetikleyiciler (max 3, Türkçe) - Bu metinden çıkar!
4. suggestions: 3 adet KİŞİSELLEŞTİRİLMİŞ öneri (bugünkü duyguya uygun):
   - type: "activity" | "breathing" | "motivation"
   - title: Kısa, samimi başlık
   - description: Sıcak ve destekleyici açıklama

DİL VE ÜSLUP KURALLARI:
- Samimi, sıcak bir dil kullan. "Sen" diye hitap et
- Emoji kullanabilirsin ama abartma
- Destekleyici ve motive edici ol
- Örnek iyi: "Bugün biraz zorlanmış gibisin 💙", "Hadi gel, şöyle bir nefes alalım"
- Örnek kötü: "Nefes egzersizi yapmanız önerilir" (KULLANMA)
  * "Duygusal durumunuz değerlendirilmiştir"

KİŞİSELLEŞTİRME KURALLARI (ZORUNLU - ÇOK ÖNEMLİ):
- Öneriler MUTLAKA SPESİFİK olmalı! Genel öneriler YASAK!
- "Sevdiğin bir şarkı dinle" YASAK! Bunun yerine gerçek şarkı/sanatçı ismi ver!
- "Bir kitap oku" YASAK! Bunun yerine gerçek kitap adı ve yazarı ver!
- "Film izle" YASAK! Bunun yerine gerçek film adı ver!

${userPreferences?.musicGenres?.length > 0 ? `MÜZİK TERCİHLERİ: ${userPreferences.musicGenres.join(', ')}
- Bu türlerden SPESİFİK şarkı/sanatçı öner! Örnek:
  * Pop seviyorsa: "Hadi Tarkan'ın 'Kuzu Kuzu'sunu aç, dans et biraz! 💃"
  * Rock seviyorsa: "Mor ve Ötesi'nin 'Cambaz'ını aç, gitar sololarına kendini bırak!"
  * Klasik seviyorsa: "Chopin'in Nocturne'lerini aç, gözlerini kapat ve hisset"
  * Jazz seviyorsa: "Miles Davis'in 'Kind of Blue' albümünü aç, kahve eşliğinde dinle"
  * Türk müziği seviyorsa: "Zeki Müren'den 'Gitme Sana Muhtacım' dinle, içini dök"` : ''}

${userPreferences?.hobbies?.includes('reading') ? `KİTAP OKUMAK: Kullanıcı kitap okuyor!
- SPESİFİK kitap öner! Örnek:
  * Üzgünse: "Paulo Coelho'nun 'Simyacı'sını aç, ilham verici olacak"
  * Kaygılıysa: "Eckhart Tolle'un 'Şimdi'nin Gücü' kitabını oku, rahatlatıcı"
  * Mutluysa: "Aziz Nesin'in hikayelerini oku, kahkaha at!"` : ''}

${userPreferences?.hobbies?.includes('movies') ? `FİLM/DİZİ SEVİYOR:
- SPESİFİK film/dizi öner! Örnek:
  * Üzgünse: "Yeşil Yol filmini izle, duygularını akıt"
  * Kaygılıysa: "Amelie'yi izle, içini ısıtacak bir film"
  * Öfkeliyse: "Masumiyet veya Ayla gibi duygusal bir film seni sakinleştirebilir"
  * Mutluysa: "Hababam Sınıfı aç, gül biraz!"` : ''}

${userPreferences?.hobbies?.includes('gaming') ? `OYUN OYNUYOR:
- Rahatlatıcı oyun öner: "Stardew Valley oyna, sakin bir çiftlik hayatı seni rahatlatır" veya "Minecraft'ta inşa yap, yaratıcılığını kullan"` : ''}

${userPreferences?.hobbies?.includes('cooking') ? `YEMEK YAPMAYI SEVİYOR:
- SPESİFİK tarif öner: "Hadi güzel bir brownie yap, çikolata terapisi!" veya "Sıcak bir çorba yap, mutfağın kokusu bile rahatlatır"` : ''}

${userPreferences?.hobbies?.includes('nature') ? `DOĞA YÜRÜYÜŞÜ SEVİYOR:
- "Yakındaki bir parkta 15 dakika yürü, ağaçları izle" gibi spesifik öneriler ver` : ''}

${userPreferences?.personalityType === 'introvert' ? '- Kullanıcı İÇE DÖNÜK! Yalnız yapabileceği aktiviteler öner, sosyal aktiviteler YASAK!' : ''}
${userPreferences?.personalityType === 'extrovert' ? '- Kullanıcı DIŞA DÖNÜK! Arkadaşlarla yapılacak aktiviteler öner.' : ''}
${userPreferences?.emotionalGoals?.length > 0 ? `- Kullanıcının hedefleri: ${userPreferences.emotionalGoals.join(', ')}. Öneriler bu hedeflere yönelik olmalı!` : ''}
${userPreferences?.exerciseFrequency === 'daily' || userPreferences?.exerciseFrequency === 'weekly' ? '- Kullanıcı düzenli egzersiz yapıyor, fiziksel aktivite önerebilirsin.' : ''}
${userPreferences?.exerciseFrequency === 'rarely' || userPreferences?.exerciseFrequency === 'none' ? '- Kullanıcı pek egzersiz yapmıyor, ağır fiziksel aktiviteler önerme.' : ''}
${userPreferences?.meditationExperience === 'experienced' ? '- Meditasyon deneyimli, gelişmiş teknikler önerebilirsin.' : ''}
${userPreferences?.meditationExperience === 'none' ? '- Meditasyona yeni, basit nefes egzersizleri öner.' : ''}
- Son verilen önerileri TEKRARLAMA, farklı öneriler ver
- ${monthlyAnalysis.isDecreasing ? 'UYARI: Kullanıcının durumu kötüye gidiyor! Nazikçe ama ciddiyetle uzun vadeli çözümler öner.' : ''}

SADECE JSON formatında yanıt ver:
{
  "primaryEmotion": "...",
  "intensity": 5,
  "triggers": ["..."],
  "suggestions": [
    {"type": "activity", "title": "...", "description": "..."},
    {"type": "breathing", "title": "...", "description": "..."},
    {"type": "motivation", "title": "...", "description": "..."}
  ],
  "weeklyInsight": "Samimi bir haftalık özet (1-2 cümle, sıcak dille)",
  "monthlyInsight": "Aylık trend özeti (samimi ve destekleyici dille)"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Çok fazla istek. Lütfen biraz bekleyin.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Kredi yetersiz. Lütfen hesabınıza kredi ekleyin.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response:', content);

    // Parse the JSON response
    let analysis;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      
      analysis = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      analysis = {
        primaryEmotion: 'neutral',
        intensity: 5,
        triggers: [],
        suggestions: [
          { type: 'activity', title: 'Kısa bir yürüyüş yap', description: 'Taze hava almak zihnini rahatlatır.' },
          { type: 'breathing', title: 'Derin nefes al', description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver.' },
          { type: 'motivation', title: 'Kendine nazik ol', description: 'Bugün de güzel geçecek.' }
        ],
        weeklyInsight: '',
        monthlyInsight: ''
      };
    }

    // Validate the response
    const validEmotions = ['happy', 'sad', 'anxious', 'angry', 'neutral', 'excited', 'calm'];
    if (!validEmotions.includes(analysis.primaryEmotion)) {
      analysis.primaryEmotion = 'neutral';
    }
    analysis.intensity = Math.min(10, Math.max(1, Number(analysis.intensity) || 5));
    analysis.triggers = Array.isArray(analysis.triggers) ? analysis.triggers.slice(0, 3) : [];
    
    // Ensure suggestions exist
    if (!Array.isArray(analysis.suggestions) || analysis.suggestions.length === 0) {
      analysis.suggestions = [
        { type: 'activity', title: 'Kısa bir yürüyüş yap', description: 'Taze hava almak zihnini rahatlatır.' },
        { type: 'breathing', title: 'Derin nefes al', description: '4 saniye nefes al, 4 saniye tut, 4 saniye ver.' },
        { type: 'motivation', title: 'Kendine nazik ol', description: 'Bugün de güzel geçecek.' }
      ];
    }

    console.log('Final analysis:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-emotion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
