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
    const { text, historicalEntries, recentSuggestions } = await req.json();
    
    if (!text || typeof text !== 'string') {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing emotion for text:', text.substring(0, 100) + '...');
    console.log('Historical entries count:', historicalEntries?.length || 0);

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

    // Build context for AI
    let contextPrompt = "";
    if (weeklyEntries.length > 0 || monthlyEntries.length > 0) {
      contextPrompt = `
KULLANICI GEÇMİŞİ:
- ${weeklyAnalysis}
- ${monthlyAnalysis.trend} ${monthlyAnalysis.details}

SON VERİLEN ÖNERİLER (bunları TEKRARLAMA):
${usedSuggestions.size > 0 ? Array.from(usedSuggestions).slice(0, 5).join(', ') : 'Yok'}
`;
    }

    const systemPrompt = `Sen bir duygu analizi ve kişisel gelişim uzmanısın. Kullanıcının günlük girişini analiz et.

${contextPrompt}

Analiz etmen gerekenler:
1. primaryEmotion: Ana duygu (sadece: happy, sad, anxious, angry, neutral, excited, calm)
2. intensity: Yoğunluk (1-10)
3. triggers: Tetikleyiciler (max 3, Türkçe)
4. suggestions: 3 adet KİŞİSELLEŞTİRİLMİŞ öneri. Her öneri şunları içermeli:
   - type: "activity" | "breathing" | "motivation"
   - title: Kısa başlık
   - description: Detaylı açıklama (kullanıcının durumuna özel)

ÖNEMLİ KURALLAR:
- Öneriler MUTLAKA kullanıcının mevcut durumuna ve geçmişine göre kişiselleştirilmeli
- Son verilen önerileri TEKRARLAMA, farklı öneriler ver
- ${monthlyAnalysis.isDecreasing ? 'UYARI: Kullanıcının durumu kötüye gidiyor! Uzun vadeli çözümler ve profesyonel destek önerileri sun.' : ''}
- Öneriler somut ve uygulanabilir olmalı
- Geçmiş tetikleyicilere göre spesifik öneriler ver

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
  "weeklyInsight": "Haftalık durum özeti (1-2 cümle)",
  "monthlyInsight": "Aylık trend ve uzun vadeli öneri (varsa kötüye gidiyorsa mutlaka belirt)"
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
