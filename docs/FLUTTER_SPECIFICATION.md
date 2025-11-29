# 🎯 Duygu Günlüğü - Flutter Uygulama Spesifikasyonu

Bu dokümantasyon, Duygu Günlüğü uygulamasının Flutter ile birebir aynısını oluşturmak için gerekli tüm teknik detayları içerir.

---

## 1. Proje Özeti

**Uygulama Adı:** Duygu Günlüğü  
**Açıklama:** Kullanıcıların günlük yazıp AI ile duygu analizi aldığı, gamification sistemi olan bir mobil günlük uygulaması.

### Temel Özellikler:
- 📝 Günlük yazma ve kaydetme
- 🤖 AI destekli duygu analizi (Gemini 2.5 Flash)
- 📊 Mutluluk skoru hesaplama
- 💡 Duyguya özel öneriler
- 📅 Duygu takvimi görünümü
- 🏆 Başarı ve ödül sistemi
- 📈 İstatistik takibi
- 🔥 Günlük seri (streak) sistemi

---

## 2. Teknoloji Stack

```yaml
Framework: Flutter 3.x
Dil: Dart
State Management: Riverpod veya Provider
Backend: Supabase
AI: Lovable AI Gateway (google/gemini-2.5-flash)
Database: PostgreSQL (Supabase üzerinden)
```

---

## 3. Supabase Konfigürasyonu

```yaml
Project URL: https://lfmcfduupuwokmngdvbz.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbWNmZHV1cHV3b2ttbmdkdmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDAwODUsImV4cCI6MjA3OTgxNjA4NX0.yYxx2X4cFyidc6ZABl7qd8nmrtTbQTtlcbLm05yCtQM
```

### Flutter'da Supabase Başlatma:

```dart
// lib/main.dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://lfmcfduupuwokmngdvbz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmbWNmZHV1cHV3b2ttbmdkdmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDAwODUsImV4cCI6MjA3OTgxNjA4NX0.yYxx2X4cFyidc6ZABl7qd8nmrtTbQTtlcbLm05yCtQM',
  );
  
  runApp(const MyApp());
}

final supabase = Supabase.instance.client;
```

---

## 4. Veritabanı Şeması

### 4.1 journal_entries Tablosu

```sql
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  primary_emotion TEXT NOT NULL,
  intensity INTEGER DEFAULT 5 NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Politikaları (Public erişim - tek kullanıcılı uygulama)
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read journal_entries" ON journal_entries
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert journal_entries" ON journal_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update journal_entries" ON journal_entries
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete journal_entries" ON journal_entries
  FOR DELETE USING (true);
```

### 4.2 user_achievements Tablosu

```sql
CREATE TABLE user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id TEXT NOT NULL UNIQUE,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Politikaları
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read user_achievements" ON user_achievements
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert user_achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete user_achievements" ON user_achievements
  FOR DELETE USING (true);
```

### 4.3 user_stats Tablosu

```sql
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_points INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS Politikaları
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read user_stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert user_stats" ON user_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update user_stats" ON user_stats
  FOR UPDATE USING (true);
```

---

## 5. Dart Model Sınıfları

### 5.1 Emotion Enum

```dart
// lib/models/emotion.dart

enum Emotion {
  happy,
  sad,
  angry,
  anxious,
  calm,
  excited,
  grateful,
  frustrated,
  hopeful,
  lonely;

  static Emotion fromString(String value) {
    return Emotion.values.firstWhere(
      (e) => e.name == value.toLowerCase(),
      orElse: () => Emotion.calm,
    );
  }
}
```

### 5.2 EmotionAnalysis Model

```dart
// lib/models/emotion_analysis.dart

import 'emotion.dart';

class EmotionAnalysis {
  final Emotion primaryEmotion;
  final int intensity;
  final List<String> triggers;

  const EmotionAnalysis({
    required this.primaryEmotion,
    required this.intensity,
    required this.triggers,
  });

  factory EmotionAnalysis.fromJson(Map<String, dynamic> json) {
    return EmotionAnalysis(
      primaryEmotion: Emotion.fromString(json['primaryEmotion'] ?? 'calm'),
      intensity: (json['intensity'] as num?)?.toInt() ?? 5,
      triggers: List<String>.from(json['triggers'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'primaryEmotion': primaryEmotion.name,
      'intensity': intensity,
      'triggers': triggers,
    };
  }
}
```

### 5.3 JournalEntry Model

```dart
// lib/models/journal_entry.dart

import 'emotion.dart';
import 'emotion_analysis.dart';

class JournalEntry {
  final String id;
  final String content;
  final EmotionAnalysis? emotion;
  final DateTime createdAt;
  final bool isLocked;

  const JournalEntry({
    required this.id,
    required this.content,
    this.emotion,
    required this.createdAt,
    this.isLocked = false,
  });

  factory JournalEntry.fromSupabase(Map<String, dynamic> data) {
    return JournalEntry(
      id: data['id'] as String,
      content: data['content'] as String,
      emotion: EmotionAnalysis(
        primaryEmotion: Emotion.fromString(data['primary_emotion'] ?? 'calm'),
        intensity: (data['intensity'] as num?)?.toInt() ?? 5,
        triggers: List<String>.from(data['triggers'] ?? []),
      ),
      createdAt: DateTime.parse(data['created_at'] as String),
    );
  }

  Map<String, dynamic> toSupabase() {
    return {
      'content': content,
      'primary_emotion': emotion?.primaryEmotion.name ?? 'calm',
      'intensity': emotion?.intensity ?? 5,
      'triggers': emotion?.triggers ?? [],
    };
  }
}
```

### 5.4 Suggestion Model

```dart
// lib/models/suggestion.dart

class Suggestion {
  final String id;
  final String text;
  final String icon;

  const Suggestion({
    required this.id,
    required this.text,
    required this.icon,
  });
}
```

### 5.5 Achievement Model

```dart
// lib/models/achievement.dart

class Achievement {
  final String id;
  final String title;
  final String description;
  final String icon;
  final int requiredPoints;
  final DateTime? unlockedAt;
  final bool isUnlocked;

  const Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.requiredPoints,
    this.unlockedAt,
    this.isUnlocked = false,
  });

  Achievement copyWith({
    String? id,
    String? title,
    String? description,
    String? icon,
    int? requiredPoints,
    DateTime? unlockedAt,
    bool? isUnlocked,
  }) {
    return Achievement(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      requiredPoints: requiredPoints ?? this.requiredPoints,
      unlockedAt: unlockedAt ?? this.unlockedAt,
      isUnlocked: isUnlocked ?? this.isUnlocked,
    );
  }
}
```

### 5.6 UserStats Model

```dart
// lib/models/user_stats.dart

class UserStats {
  final String? id;
  final int totalPoints;
  final int longestStreak;
  final int currentStreak;
  final int level;
  final int pointsToNextLevel;
  final DateTime? updatedAt;

  const UserStats({
    this.id,
    required this.totalPoints,
    required this.longestStreak,
    required this.currentStreak,
    required this.level,
    required this.pointsToNextLevel,
    this.updatedAt,
  });

  factory UserStats.empty() {
    return const UserStats(
      totalPoints: 0,
      longestStreak: 0,
      currentStreak: 0,
      level: 1,
      pointsToNextLevel: 100,
    );
  }

  factory UserStats.fromSupabase(Map<String, dynamic> data, int currentStreak) {
    final points = (data['total_points'] as num?)?.toInt() ?? 0;
    return UserStats(
      id: data['id'] as String?,
      totalPoints: points,
      longestStreak: (data['longest_streak'] as num?)?.toInt() ?? 0,
      currentStreak: currentStreak,
      level: _getLevelFromPoints(points),
      pointsToNextLevel: _getPointsForNextLevel(points),
      updatedAt: data['updated_at'] != null 
          ? DateTime.parse(data['updated_at'] as String)
          : null,
    );
  }

  static int _getLevelFromPoints(int points) {
    const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000];
    for (int i = thresholds.length - 1; i >= 0; i--) {
      if (points >= thresholds[i]) return i + 1;
    }
    return 1;
  }

  static int _getPointsForNextLevel(int points) {
    const thresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000];
    final level = _getLevelFromPoints(points);
    if (level >= thresholds.length) return 0;
    return thresholds[level] - points;
  }
}
```

---

## 6. Sabit Veriler (Constants)

### 6.1 Duygu Verileri

```dart
// lib/data/emotion_data.dart

import '../models/emotion.dart';
import '../models/suggestion.dart';

const Map<Emotion, String> emotionLabels = {
  Emotion.happy: 'Mutlu',
  Emotion.sad: 'Üzgün',
  Emotion.angry: 'Kızgın',
  Emotion.anxious: 'Endişeli',
  Emotion.calm: 'Sakin',
  Emotion.excited: 'Heyecanlı',
  Emotion.grateful: 'Minnettar',
  Emotion.frustrated: 'Sinirli',
  Emotion.hopeful: 'Umutlu',
  Emotion.lonely: 'Yalnız',
};

const Map<Emotion, String> emotionEmojis = {
  Emotion.happy: '😊',
  Emotion.sad: '😢',
  Emotion.angry: '😠',
  Emotion.anxious: '😰',
  Emotion.calm: '😌',
  Emotion.excited: '🤩',
  Emotion.grateful: '🙏',
  Emotion.frustrated: '😤',
  Emotion.hopeful: '🌟',
  Emotion.lonely: '😔',
};

const Map<Emotion, Color> emotionColors = {
  Emotion.happy: Color(0xFF22C55E),
  Emotion.sad: Color(0xFF3B82F6),
  Emotion.angry: Color(0xFFEF4444),
  Emotion.anxious: Color(0xFFF59E0B),
  Emotion.calm: Color(0xFF06B6D4),
  Emotion.excited: Color(0xFFF97316),
  Emotion.grateful: Color(0xFF8B5CF6),
  Emotion.frustrated: Color(0xFFDC2626),
  Emotion.hopeful: Color(0xFF10B981),
  Emotion.lonely: Color(0xFF6366F1),
};

// Duyguya göre öneriler
const Map<Emotion, List<Suggestion>> emotionSuggestions = {
  Emotion.happy: [
    Suggestion(id: 'h1', text: 'Bu anı bir fotoğrafla ölümsüzleştir', icon: '📸'),
    Suggestion(id: 'h2', text: 'Sevdiklerinle bu mutluluğu paylaş', icon: '💬'),
    Suggestion(id: 'h3', text: 'Günlüğüne bu anı detaylı yaz', icon: '📝'),
    Suggestion(id: 'h4', text: 'Bu mutluluğun kaynağını not et', icon: '✨'),
  ],
  Emotion.sad: [
    Suggestion(id: 's1', text: 'Kendine bir fincan sıcak içecek hazırla', icon: '☕'),
    Suggestion(id: 's2', text: 'Sevdiğin bir müzik dinle', icon: '🎵'),
    Suggestion(id: 's3', text: 'Bir arkadaşınla konuş', icon: '📞'),
    Suggestion(id: 's4', text: 'Kısa bir yürüyüşe çık', icon: '🚶'),
  ],
  Emotion.angry: [
    Suggestion(id: 'a1', text: 'Derin nefes egzersizi yap (4-7-8 tekniği)', icon: '🌬️'),
    Suggestion(id: 'a2', text: '10 dakika yürüyüşe çık', icon: '🚶'),
    Suggestion(id: 'a3', text: 'Duygularını kağıda dök', icon: '📝'),
    Suggestion(id: 'a4', text: 'Soğuk su iç', icon: '💧'),
  ],
  Emotion.anxious: [
    Suggestion(id: 'x1', text: '5-4-3-2-1 grounding tekniğini dene', icon: '🧘'),
    Suggestion(id: 'x2', text: 'Derin nefes al, yavaşça ver', icon: '🌬️'),
    Suggestion(id: 'x3', text: 'Endişelerini listele ve analiz et', icon: '📋'),
    Suggestion(id: 'x4', text: 'Rahatlatıcı müzik dinle', icon: '🎶'),
  ],
  Emotion.calm: [
    Suggestion(id: 'c1', text: 'Bu huzurlu anın tadını çıkar', icon: '🌸'),
    Suggestion(id: 'c2', text: 'Meditasyon yap', icon: '🧘'),
    Suggestion(id: 'c3', text: 'Kitap oku', icon: '📚'),
    Suggestion(id: 'c4', text: 'Doğada vakit geçir', icon: '🌳'),
  ],
  Emotion.excited: [
    Suggestion(id: 'e1', text: 'Bu enerjiyi yaratıcı bir işe yönlendir', icon: '🎨'),
    Suggestion(id: 'e2', text: 'Hedeflerini ve planlarını yaz', icon: '🎯'),
    Suggestion(id: 'e3', text: 'Bu heyecanı sevdiklerinle paylaş', icon: '🎉'),
    Suggestion(id: 'e4', text: 'Yeni bir şey öğrenmeye başla', icon: '💡'),
  ],
  Emotion.grateful: [
    Suggestion(id: 'g1', text: 'Minnettar olduğun 3 şeyi yaz', icon: '🙏'),
    Suggestion(id: 'g2', text: 'Birine teşekkür mesajı gönder', icon: '💌'),
    Suggestion(id: 'g3', text: 'Bu duyguyu günlüğüne detaylı kaydet', icon: '📖'),
    Suggestion(id: 'g4', text: 'İyilik yap, iyilik bul', icon: '💝'),
  ],
  Emotion.frustrated: [
    Suggestion(id: 'f1', text: 'Problemi küçük parçalara böl', icon: '🧩'),
    Suggestion(id: 'f2', text: 'Kısa bir mola ver', icon: '⏸️'),
    Suggestion(id: 'f3', text: 'Farklı bir yaklaşım dene', icon: '🔄'),
    Suggestion(id: 'f4', text: 'Birisinden yardım iste', icon: '🤝'),
  ],
  Emotion.hopeful: [
    Suggestion(id: 'o1', text: 'Hedeflerini somutlaştır', icon: '🎯'),
    Suggestion(id: 'o2', text: 'Vizyon panosu oluştur', icon: '🖼️'),
    Suggestion(id: 'o3', text: 'İlk adımı bugün at', icon: '👣'),
    Suggestion(id: 'o4', text: 'Bu umudu besleyen şeyleri not et', icon: '🌱'),
  ],
  Emotion.lonely: [
    Suggestion(id: 'l1', text: 'Bir arkadaşını ara', icon: '📱'),
    Suggestion(id: 'l2', text: 'Sosyal bir aktiviteye katıl', icon: '👥'),
    Suggestion(id: 'l3', text: 'Kendinle kaliteli vakit geçir', icon: '🧘'),
    Suggestion(id: 'l4', text: 'Bir topluluk etkinliğine git', icon: '🏘️'),
  ],
};

/// Belirli bir duygu için rastgele öneriler döndürür
List<Suggestion> getRandomSuggestions(Emotion emotion, {int count = 3}) {
  final suggestions = List<Suggestion>.from(emotionSuggestions[emotion] ?? []);
  suggestions.shuffle();
  return suggestions.take(count).toList();
}
```

### 6.2 Başarı Verileri

```dart
// lib/data/achievements_data.dart

import '../models/achievement.dart';

final List<Achievement> achievementTemplates = [
  const Achievement(
    id: 'first_entry',
    title: 'İlk Adım',
    description: 'İlk günlük kaydını oluşturdun',
    icon: '🌱',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'week_streak',
    title: 'Haftalık Seri',
    description: '7 gün üst üste günlük yazdın',
    icon: '🔥',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'emotion_explorer',
    title: 'Duygu Kaşifi',
    description: '5 farklı duygu keşfettin',
    icon: '🎭',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'deep_writer',
    title: 'Derin Yazar',
    description: '500 karakterden uzun bir günlük yazdın',
    icon: '✍️',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'consistent',
    title: 'Kararlı',
    description: '30 gün üst üste günlük yazdın',
    icon: '💪',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'level_5',
    title: 'Deneyimli',
    description: 'Seviye 5\'e ulaştın',
    icon: '⭐',
    requiredPoints: 500,
  ),
  const Achievement(
    id: 'level_10',
    title: 'Uzman',
    description: 'Seviye 10\'a ulaştın',
    icon: '🏆',
    requiredPoints: 2000,
  ),
  const Achievement(
    id: 'entries_10',
    title: 'Düzenli Yazar',
    description: '10 günlük kaydı tamamladın',
    icon: '📝',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'entries_50',
    title: 'Aktif Yazar',
    description: '50 günlük kaydı tamamladın',
    icon: '📚',
    requiredPoints: 0,
  ),
  const Achievement(
    id: 'entries_100',
    title: 'Usta Yazar',
    description: '100 günlük kaydı tamamladın',
    icon: '🎖️',
    requiredPoints: 0,
  ),
];

// Seviye eşikleri
const List<int> levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000];

// Seviye başlıkları
const List<String> levelTitles = [
  'Başlangıç',
  'Meraklı', 
  'Keşifçi',
  'Deneyimli',
  'Uzman',
  'Usta',
  'Efsane',
  'Şampiyon',
];

/// Puandan seviye hesapla
int getLevelFromPoints(int points) {
  for (int i = levelThresholds.length - 1; i >= 0; i--) {
    if (points >= levelThresholds[i]) return i + 1;
  }
  return 1;
}

/// Sonraki seviye için gereken puan
int getPointsForNextLevel(int points) {
  final level = getLevelFromPoints(points);
  if (level >= levelThresholds.length) return 0;
  return levelThresholds[level] - points;
}

/// Seviye başlığını getir
String getLevelTitle(int level) {
  final index = (level - 1).clamp(0, levelTitles.length - 1);
  return levelTitles[index];
}

/// Mevcut seviyenin ilerleme yüzdesini hesapla
double getLevelProgress(int points) {
  final level = getLevelFromPoints(points);
  if (level >= levelThresholds.length) return 1.0;
  
  final currentThreshold = levelThresholds[level - 1];
  final nextThreshold = levelThresholds[level];
  final progress = (points - currentThreshold) / (nextThreshold - currentThreshold);
  
  return progress.clamp(0.0, 1.0);
}
```

---

## 7. Edge Function - AI Duygu Analizi

### 7.1 Endpoint Bilgileri

```yaml
URL: https://lfmcfduupuwokmngdvbz.supabase.co/functions/v1/analyze-emotion
Method: POST
Content-Type: application/json
```

### 7.2 İstek Formatı

```json
{
  "text": "Bugün çok mutluyum, arkadaşlarımla güzel vakit geçirdim"
}
```

### 7.3 Yanıt Formatı

```json
{
  "primaryEmotion": "happy",
  "intensity": 8,
  "triggers": ["arkadaşlar", "sosyal aktivite"]
}
```

### 7.4 Edge Function Kodu (TypeScript/Deno)

```typescript
// supabase/functions/analyze-emotion/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Sen bir duygu analizi uzmanısın. Kullanıcının yazdığı metni analiz et ve JSON formatında yanıt ver.

Tespit edebileceğin duygular: happy, sad, angry, anxious, calm, excited, grateful, frustrated, hopeful, lonely

Yanıt formatı (sadece JSON, başka bir şey yazma):
{
  "primaryEmotion": "duygu_adı",
  "intensity": 1-10 arası sayı,
  "triggers": ["tetikleyici1", "tetikleyici2"]
}

Kurallar:
- intensity: Duygunun yoğunluğu (1=çok hafif, 10=çok yoğun)
- triggers: Metinden çıkarılan duygu tetikleyicileri (en fazla 3 tane)
- Sadece JSON döndür, açıklama ekleme`;

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
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // JSON parse
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validasyon
    const validEmotions = ['happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'grateful', 'frustrated', 'hopeful', 'lonely'];
    if (!validEmotions.includes(analysis.primaryEmotion)) {
      analysis.primaryEmotion = 'calm';
    }
    
    analysis.intensity = Math.max(1, Math.min(10, Number(analysis.intensity) || 5));
    analysis.triggers = Array.isArray(analysis.triggers) ? analysis.triggers.slice(0, 3) : [];

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-emotion:', error);
    
    // Fallback yanıt
    return new Response(
      JSON.stringify({
        primaryEmotion: 'calm',
        intensity: 5,
        triggers: [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 8. Service Katmanı (Flutter)

### 8.1 Emotion Service

```dart
// lib/services/emotion_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/emotion_analysis.dart';

class EmotionService {
  final SupabaseClient _supabase;

  EmotionService(this._supabase);

  Future<EmotionAnalysis> analyzeEmotion(String text) async {
    try {
      final response = await _supabase.functions.invoke(
        'analyze-emotion',
        body: {'text': text},
      );

      if (response.status != 200) {
        throw Exception('Analiz başarısız: ${response.status}');
      }

      return EmotionAnalysis.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      // Fallback
      return const EmotionAnalysis(
        primaryEmotion: Emotion.calm,
        intensity: 5,
        triggers: [],
      );
    }
  }
}
```

### 8.2 Journal Service

```dart
// lib/services/journal_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/journal_entry.dart';
import '../models/emotion_analysis.dart';

class JournalService {
  final SupabaseClient _supabase;

  JournalService(this._supabase);

  /// Tüm günlük kayıtlarını getir (en yeniden eskiye)
  Future<List<JournalEntry>> getEntries() async {
    final response = await _supabase
        .from('journal_entries')
        .select()
        .order('created_at', ascending: false);

    return (response as List)
        .map((e) => JournalEntry.fromSupabase(e as Map<String, dynamic>))
        .toList();
  }

  /// Yeni günlük kaydı ekle
  Future<JournalEntry> addEntry({
    required String content,
    required EmotionAnalysis analysis,
  }) async {
    final response = await _supabase
        .from('journal_entries')
        .insert({
          'content': content,
          'primary_emotion': analysis.primaryEmotion.name,
          'intensity': analysis.intensity,
          'triggers': analysis.triggers,
        })
        .select()
        .single();

    return JournalEntry.fromSupabase(response as Map<String, dynamic>);
  }

  /// Günlük kaydı sil
  Future<void> deleteEntry(String id) async {
    await _supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);
  }

  /// Belirli tarihteki kaydı getir
  Future<JournalEntry?> getEntryForDate(DateTime date) async {
    final startOfDay = DateTime(date.year, date.month, date.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    final response = await _supabase
        .from('journal_entries')
        .select()
        .gte('created_at', startOfDay.toIso8601String())
        .lt('created_at', endOfDay.toIso8601String())
        .maybeSingle();

    if (response == null) return null;
    return JournalEntry.fromSupabase(response as Map<String, dynamic>);
  }
}
```

### 8.3 Rewards Service

```dart
// lib/services/rewards_service.dart

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_stats.dart';
import '../models/journal_entry.dart';
import '../data/achievements_data.dart';

class RewardsService {
  final SupabaseClient _supabase;

  RewardsService(this._supabase);

  /// Kullanıcı istatistiklerini getir
  Future<UserStats> getStats(List<JournalEntry> entries) async {
    final response = await _supabase
        .from('user_stats')
        .select()
        .maybeSingle();

    final currentStreak = _calculateStreak(entries);

    if (response == null) {
      // İlk kullanım - yeni stat oluştur
      await _supabase.from('user_stats').insert({
        'total_points': 0,
        'longest_streak': 0,
      });
      return UserStats.empty();
    }

    return UserStats.fromSupabase(
      response as Map<String, dynamic>,
      currentStreak,
    );
  }

  /// Puan ekle
  Future<void> addPoints(int points) async {
    final current = await _supabase
        .from('user_stats')
        .select('total_points')
        .single();

    final newPoints = (current['total_points'] as int) + points;

    await _supabase
        .from('user_stats')
        .update({
          'total_points': newPoints,
          'updated_at': DateTime.now().toIso8601String(),
        })
        .eq('id', current['id']);
  }

  /// En uzun seriyi güncelle
  Future<void> updateLongestStreak(int streak) async {
    final current = await _supabase
        .from('user_stats')
        .select()
        .single();

    if (streak > (current['longest_streak'] as int)) {
      await _supabase
          .from('user_stats')
          .update({
            'longest_streak': streak,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', current['id']);
    }
  }

  /// Açılmış başarıları getir
  Future<List<String>> getUnlockedAchievements() async {
    final response = await _supabase
        .from('user_achievements')
        .select('achievement_id');

    return (response as List)
        .map((e) => e['achievement_id'] as String)
        .toList();
  }

  /// Başarı aç
  Future<void> unlockAchievement(String achievementId) async {
    // Zaten açık mı kontrol et
    final existing = await _supabase
        .from('user_achievements')
        .select()
        .eq('achievement_id', achievementId)
        .maybeSingle();

    if (existing != null) return;

    await _supabase.from('user_achievements').insert({
      'achievement_id': achievementId,
    });
  }

  /// Mevcut seriyi hesapla
  int _calculateStreak(List<JournalEntry> entries) {
    if (entries.isEmpty) return 0;

    // Tarihe göre sırala (en yeniden eskiye)
    final sorted = List<JournalEntry>.from(entries)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

    int streak = 0;
    DateTime? lastDate;

    for (final entry in sorted) {
      final entryDate = DateTime(
        entry.createdAt.year,
        entry.createdAt.month,
        entry.createdAt.day,
      );

      if (lastDate == null) {
        // İlk kayıt - bugün veya dün mü kontrol et
        final today = DateTime.now();
        final todayDate = DateTime(today.year, today.month, today.day);
        final yesterday = todayDate.subtract(const Duration(days: 1));

        if (entryDate == todayDate || entryDate == yesterday) {
          streak = 1;
          lastDate = entryDate;
        } else {
          break; // Seri kırılmış
        }
      } else {
        final expectedDate = lastDate.subtract(const Duration(days: 1));
        if (entryDate == expectedDate) {
          streak++;
          lastDate = entryDate;
        } else if (entryDate == lastDate) {
          // Aynı gün birden fazla kayıt
          continue;
        } else {
          break; // Seri kırılmış
        }
      }
    }

    return streak;
  }
}
```

---

## 9. Mutluluk Skoru Hesaplama

```dart
// lib/utils/happiness_calculator.dart

import '../models/emotion.dart';

/// Duygu tipine ve yoğunluğuna göre mutluluk seviyesi hesapla (0-10)
int calculateHappinessLevel(Emotion emotion, int intensity) {
  const positiveEmotions = [
    Emotion.happy,
    Emotion.excited,
    Emotion.grateful,
    Emotion.hopeful,
    Emotion.calm,
  ];

  const negativeEmotions = [
    Emotion.sad,
    Emotion.angry,
    Emotion.anxious,
    Emotion.frustrated,
    Emotion.lonely,
  ];

  if (positiveEmotions.contains(emotion)) {
    // Pozitif duygular: intensity ile doğru orantılı (5-10 arası)
    return 5 + ((intensity / 10) * 5).round();
  } else if (negativeEmotions.contains(emotion)) {
    // Negatif duygular: intensity ile ters orantılı (0-5 arası)
    return 5 - ((intensity / 10) * 5).round();
  }

  return 5; // Nötr
}

/// Mutluluk seviyesine göre emoji döndür
String getHappinessEmoji(int level) {
  if (level >= 8) return '😄';
  if (level >= 6) return '🙂';
  if (level >= 4) return '😐';
  if (level >= 2) return '😔';
  return '😢';
}

/// Mutluluk seviyesine göre renk döndür
Color getHappinessColor(int level) {
  if (level >= 8) return const Color(0xFF22C55E); // Yeşil
  if (level >= 6) return const Color(0xFF84CC16); // Açık yeşil
  if (level >= 4) return const Color(0xFFFACC15); // Sarı
  if (level >= 2) return const Color(0xFFF97316); // Turuncu
  return const Color(0xFFEF4444); // Kırmızı
}
```

---

## 10. State Management (Riverpod)

### 10.1 Providers

```dart
// lib/providers/providers.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/journal_service.dart';
import '../services/emotion_service.dart';
import '../services/rewards_service.dart';

// Supabase client provider
final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

// Service providers
final journalServiceProvider = Provider<JournalService>((ref) {
  return JournalService(ref.read(supabaseProvider));
});

final emotionServiceProvider = Provider<EmotionService>((ref) {
  return EmotionService(ref.read(supabaseProvider));
});

final rewardsServiceProvider = Provider<RewardsService>((ref) {
  return RewardsService(ref.read(supabaseProvider));
});
```

### 10.2 Journal State

```dart
// lib/providers/journal_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/journal_entry.dart';
import '../models/emotion_analysis.dart';
import 'providers.dart';

// Günlük kayıtları
final journalEntriesProvider = StateNotifierProvider<JournalNotifier, AsyncValue<List<JournalEntry>>>((ref) {
  final service = ref.read(journalServiceProvider);
  return JournalNotifier(service)..loadEntries();
});

class JournalNotifier extends StateNotifier<AsyncValue<List<JournalEntry>>> {
  final JournalService _service;

  JournalNotifier(this._service) : super(const AsyncValue.loading());

  Future<void> loadEntries() async {
    try {
      final entries = await _service.getEntries();
      state = AsyncValue.data(entries);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> addEntry(String content, EmotionAnalysis analysis) async {
    try {
      final entry = await _service.addEntry(content: content, analysis: analysis);
      state = state.whenData((entries) => [entry, ...entries]);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteEntry(String id) async {
    await _service.deleteEntry(id);
    state = state.whenData((entries) => entries.where((e) => e.id != id).toList());
  }
}

// Mevcut analiz
final currentAnalysisProvider = StateProvider<EmotionAnalysis?>((ref) => null);

// Analiz durumu
final isAnalyzingProvider = StateProvider<bool>((ref) => false);
```

### 10.3 Rewards State

```dart
// lib/providers/rewards_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_stats.dart';
import '../models/achievement.dart';
import '../data/achievements_data.dart';
import 'providers.dart';
import 'journal_provider.dart';

// Kullanıcı istatistikleri
final userStatsProvider = FutureProvider<UserStats>((ref) async {
  final service = ref.read(rewardsServiceProvider);
  final entries = ref.watch(journalEntriesProvider).value ?? [];
  return service.getStats(entries);
});

// Açılmış başarılar
final unlockedAchievementsProvider = FutureProvider<List<String>>((ref) async {
  final service = ref.read(rewardsServiceProvider);
  return service.getUnlockedAchievements();
});

// Tüm başarılar (açık/kapalı durumu ile)
final allAchievementsProvider = Provider<List<Achievement>>((ref) {
  final unlockedIds = ref.watch(unlockedAchievementsProvider).value ?? [];
  
  return achievementTemplates.map((template) {
    return template.copyWith(
      isUnlocked: unlockedIds.contains(template.id),
    );
  }).toList();
});
```

---

## 11. Ekran Yapıları

### 11.1 Ana Ekran Wireframe

```
┌─────────────────────────────────────┐
│  📖 Duygu Günlüğü         [📊] [🏆] │ ← AppBar
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Bugün nasıl hissediyorsun?  │   │ ← TextField
│  │                             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│         [ 💾 Kaydet ]               │ ← ElevatedButton
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  😊 Mutlu              8/10 │   │ ← EmotionCard
│  │  ████████████████░░░░       │   │   (analiz sonrası görünür)
│  │                             │   │
│  │  Tetikleyiciler:            │   │
│  │  • arkadaşlar • güzel hava  │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  💡 Öneriler                        │
│  ┌───────────────────────────┐     │
│  │ 📸 Bu anı fotoğrafla...   │     │ ← SuggestionCard
│  └───────────────────────────┘     │
│  ┌───────────────────────────┐     │
│  │ 💬 Sevdiklerinle paylaş   │     │
│  └───────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│  📅 Duygu Takvimi                   │
│  ┌─────────────────────────────┐   │
│  │  Kas 2024                   │   │ ← TableCalendar
│  │  Pzt Sal Çar Per Cum Cmt Paz│   │
│  │   ..  ..  ..  ..  1   2   3 │   │
│  │   4   5   6😊 7😢 8   9  10 │   │
│  │  ...                        │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  📜 Geçmiş Kayıtlar                 │
│  ┌─────────────────────────────┐   │
│  │ 28 Kasım 2024      😊 Mutlu │   │ ← EntryCard
│  │ Bugün arkadaşlarımla...     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 27 Kasım 2024      😰 Endişe│   │
│  │ İş yerinde toplantı...      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 11.2 İstatistikler Modal

```
┌─────────────────────────────────────┐
│  📊 İstatistikler              [X]  │
├─────────────────────────────────────┤
│                                     │
│  Seviye: ⭐ 3 - Keşifçi             │
│  ████████████░░░░░░░░  250/500 puan │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📝 Toplam Kayıt: 15                │
│  🔥 Mevcut Seri: 5 gün              │
│  🏆 En Uzun Seri: 12 gün            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  En Sık Duygular:                   │
│                                     │
│  😊 Mutlu ████████████  8           │
│  😌 Sakin ██████        4           │
│  😰 Endişeli ████       3           │
│                                     │
└─────────────────────────────────────┘
```

### 11.3 Ödüller Modal

```
┌─────────────────────────────────────┐
│  🏆 Başarılar                  [X]  │
├─────────────────────────────────────┤
│                                     │
│  ✅ 🌱 İlk Adım                     │
│     İlk günlük kaydını oluşturdun   │
│                                     │
│  ✅ 🔥 Haftalık Seri                │
│     7 gün üst üste günlük yazdın    │
│                                     │
│  ✅ 🎭 Duygu Kaşifi                 │
│     5 farklı duygu keşfettin        │
│                                     │
│  🔒 ⭐ Deneyimli                    │
│     Seviye 5'e ulaş (500 puan)      │
│                                     │
│  🔒 📚 Aktif Yazar                  │
│     50 günlük kaydı tamamla         │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Tema ve Renkler

```dart
// lib/theme/app_theme.dart

import 'package:flutter/material.dart';

class AppColors {
  // Primary
  static const primary = Color(0xFF8B5CF6);
  static const primaryLight = Color(0xFFA78BFA);
  static const primaryDark = Color(0xFF7C3AED);

  // Background (Dark theme)
  static const background = Color(0xFF0F0F23);
  static const surface = Color(0xFF1A1A2E);
  static const card = Color(0xFF16213E);

  // Text
  static const textPrimary = Color(0xFFFFFFFF);
  static const textSecondary = Color(0xFF94A3B8);
  static const textMuted = Color(0xFF64748B);

  // Accent
  static const accent = Color(0xFF06B6D4);
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);

  // Border
  static const border = Color(0xFF334155);
  static const borderLight = Color(0xFF475569);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.accent,
        surface: AppColors.surface,
        background: AppColors.background,
        error: AppColors.error,
      ),
      scaffoldBackgroundColor: AppColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surface,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardTheme(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
      ),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 28,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 16,
        ),
        bodyMedium: TextStyle(
          color: AppColors.textSecondary,
          fontSize: 14,
        ),
        bodySmall: TextStyle(
          color: AppColors.textMuted,
          fontSize: 12,
        ),
      ),
    );
  }
}
```

---

## 13. pubspec.yaml

```yaml
name: duygu_gunlugu
description: AI destekli duygu günlüğü uygulaması
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # Backend
  supabase_flutter: ^2.3.0
  
  # State Management
  flutter_riverpod: ^2.4.9
  
  # UI
  table_calendar: ^3.0.9
  flutter_animate: ^4.5.0
  shimmer: ^3.0.0
  
  # Utils
  intl: ^0.19.0
  uuid: ^4.3.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
  
  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Medium.ttf
          weight: 500
        - asset: assets/fonts/Inter-SemiBold.ttf
          weight: 600
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
```

---

## 14. Proje Klasör Yapısı

```
lib/
├── main.dart
├── data/
│   ├── achievements_data.dart
│   └── emotion_data.dart
├── models/
│   ├── achievement.dart
│   ├── emotion.dart
│   ├── emotion_analysis.dart
│   ├── journal_entry.dart
│   ├── suggestion.dart
│   └── user_stats.dart
├── providers/
│   ├── journal_provider.dart
│   ├── providers.dart
│   └── rewards_provider.dart
├── screens/
│   └── home_screen.dart
├── services/
│   ├── emotion_service.dart
│   ├── journal_service.dart
│   └── rewards_service.dart
├── theme/
│   └── app_theme.dart
├── utils/
│   └── happiness_calculator.dart
└── widgets/
    ├── emotion_calendar.dart
    ├── emotion_display.dart
    ├── entry_card.dart
    ├── journal_input.dart
    ├── rewards_modal.dart
    ├── stats_modal.dart
    └── suggestion_card.dart
```

---

## 15. Önemli Notlar

### 15.1 Puan Sistemi
- Her günlük kaydı: **10 puan**
- Günlük seri bonusu: **+5 puan/gün**
- 500+ karakter yazı: **+5 puan**

### 15.2 Başarı Açma Koşulları
- `first_entry`: İlk kayıt oluşturulduğunda
- `week_streak`: 7 günlük seri
- `emotion_explorer`: 5 farklı duygu tespit edildiğinde
- `deep_writer`: 500+ karakter yazıldığında
- `level_5`: 500 puana ulaşıldığında
- `entries_10`: 10 kayıt tamamlandığında

### 15.3 API Rate Limits
- Lovable AI Gateway: Dakikada maksimum istek sınırı var
- 429 hatası alınırsa kullanıcıya bilgi ver

---

## 16. Test Senaryoları

1. **Günlük Ekleme:** Metin yaz → Kaydet → AI analizi → Sonuç göster
2. **Takvim:** Geçmiş günleri emoji ile göster → Tıkla → Detay göster
3. **İstatistikler:** Toplam kayıt, seri, seviye doğru hesaplansın
4. **Başarılar:** Koşullar sağlandığında otomatik açılsın
5. **Offline:** İnternet yokken uygun hata mesajı göster

---

*Bu dokümantasyon ile Flutter kullanan bir AI, uygulamanın birebir aynısını oluşturabilir.*
