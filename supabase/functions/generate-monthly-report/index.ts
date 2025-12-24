import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JournalEntry {
  primary_emotion: string;
  intensity: number;
  triggers: string[];
  created_at: string;
}

interface ReportData {
  entries: JournalEntry[];
  totalEntries: number;
  dominantEmotion: string;
  emotionBreakdown: { emotion: string; percentage: number }[];
  topTriggers: { trigger: string; count: number }[];
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  trend: 'up' | 'down' | 'stable';
  longestPositiveStreak: number;
  avgEntriesPerWeek: number;
  mostActiveDay: string;
  weekByWeekData: { weekLabel: string; dominantEmotion: string; score: number; entries: number }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData } = await req.json() as { reportData: ReportData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const emotionLabels: Record<string, string> = {
      happy: 'Mutlu',
      sad: 'Üzgün',
      anxious: 'Kaygılı',
      angry: 'Öfkeli',
      neutral: 'Nötr',
      excited: 'Heyecanlı',
      calm: 'Sakin',
    };

    const systemPrompt = `Sen bir duygusal zeka uzmanı ve psikologsun. Kullanıcının son 1 aylık duygu günlüğü verilerini analiz edip, onlara kişiselleştirilmiş, empatik ve derinlemesine içgörüler sunuyorsun.

Türkçe yazmalısın. Samimi ama profesyonel bir dil kullan. Kullanıcıya "sen" diye hitap et.

Analiz yaparken:
- Duygusal örüntüleri tespit et
- Tetikleyiciler arasındaki bağlantıları keşfet
- Haftalık değişimleri yorumla
- Somut ve uygulanabilir öneriler sun
- Pozitif ve destekleyici ol, ama gerçekçi kal
- Her bölüm en az 150-200 kelime olmalı, derinlemesine analiz yap`;

    const userPrompt = `Kullanıcının son 1 aylık duygu günlüğü verileri:

📊 GENEL İSTATİSTİKLER:
- Toplam giriş: ${reportData.totalEntries}
- Baskın duygu: ${emotionLabels[reportData.dominantEmotion] || reportData.dominantEmotion}
- Pozitif duygu oranı: %${reportData.positiveRatio.toFixed(1)}
- Negatif duygu oranı: %${reportData.negativeRatio.toFixed(1)}
- Nötr duygu oranı: %${reportData.neutralRatio.toFixed(1)}
- Trend: ${reportData.trend === 'up' ? 'Yükseliş' : reportData.trend === 'down' ? 'Düşüş' : 'Stabil'}
- En uzun pozitif seri: ${reportData.longestPositiveStreak} gün
- Haftalık ortalama giriş: ${reportData.avgEntriesPerWeek.toFixed(1)}
- En aktif gün: ${reportData.mostActiveDay}

📈 DUYGU DAĞILIMI:
${reportData.emotionBreakdown.map(e => `- ${emotionLabels[e.emotion] || e.emotion}: %${e.percentage.toFixed(1)}`).join('\n')}

🎯 EN SIK TETİKLEYİCİLER:
${reportData.topTriggers.length > 0 ? reportData.topTriggers.map(t => `- "${t.trigger}": ${t.count} kez`).join('\n') : '- Belirgin tetikleyici yok'}

📅 HAFTALIK VERİLER:
${reportData.weekByWeekData.map(w => `- ${w.weekLabel}: ${w.entries} giriş, baskın duygu: ${emotionLabels[w.dominantEmotion] || w.dominantEmotion}, skor: ${w.score.toFixed(2)}`).join('\n')}

Bu verilere dayanarak aşağıdaki 5 bölümü oluştur. Her bölüm en az 150-200 kelime olmalı:

1. DUYGUSAL YOLCULUK ANALİZİ (emotionalJourney):
Kullanıcının bu ayki duygusal yolculuğunu detaylı anlat. Trend değişimlerini, duygu geçişlerini ve genel ruh halini yorumla.

2. TETİKLEYİCİ ANALİZİ (triggerAnalysis):
Tetikleyicileri derinlemesine incele. Aralarındaki olası bağlantıları, tekrar eden kalıpları ve bunlarla başa çıkma stratejilerini öner.

3. ÖRÜNTÜ İÇGÖRÜLERİ (patternInsights):
Duygu dağılımındaki kalıpları, duygusal çeşitliliği ve bu verilerin kullanıcı hakkında ne söylediğini analiz et.

4. HAFTALIK ANALİZ (weeklyNarrative):
Her haftayı ayrı ayrı değerlendir, hafta boyunca yaşanan değişimleri ve bunların olası nedenlerini yorumla.

5. İYİLİK HALİ ÖZETİ (wellbeingSummary):
Genel iyilik halini değerlendir, güçlü yönleri vurgula ve ileriye dönük somut, uygulanabilir öneriler sun.

Yanıtını şu JSON formatında ver:
{
  "emotionalJourney": "...",
  "triggerAnalysis": "...",
  "patternInsights": "...",
  "weeklyNarrative": "...",
  "wellbeingSummary": "..."
}`;

    console.log('Generating AI monthly report analysis...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 4000,
        tools: [
          {
            type: "function",
            function: {
              name: "generate_monthly_analysis",
              description: "Generate detailed monthly emotional analysis in Turkish",
              parameters: {
                type: "object",
                properties: {
                  emotionalJourney: { 
                    type: "string",
                    description: "Detailed emotional journey analysis in Turkish (150-200 words)"
                  },
                  triggerAnalysis: { 
                    type: "string",
                    description: "Trigger analysis with coping strategies in Turkish (150-200 words)"
                  },
                  patternInsights: { 
                    type: "string",
                    description: "Pattern insights from emotion distribution in Turkish (150-200 words)"
                  },
                  weeklyNarrative: { 
                    type: "string",
                    description: "Week by week narrative analysis in Turkish (150-200 words)"
                  },
                  wellbeingSummary: { 
                    type: "string",
                    description: "Wellbeing summary with actionable recommendations in Turkish (150-200 words)"
                  }
                },
                required: ["emotionalJourney", "triggerAnalysis", "patternInsights", "weeklyNarrative", "wellbeingSummary"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_monthly_analysis" } }
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received:', JSON.stringify(data).substring(0, 200));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      console.log('Successfully parsed AI analysis');
      
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({ analysis }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error('Failed to parse content as JSON:', e);
      }
    }

    throw new Error('Could not extract analysis from AI response');

  } catch (error) {
    console.error('Error in generate-monthly-report:', error);
    
    // Check if it's an abort error (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin." }), {
        status: 504,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Bilinmeyen hata oluştu" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
