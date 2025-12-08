# Duygu Günlüğü - Teknik Dokümantasyon

**Versiyon:** 1.0  
**Tarih:** 2025-12-08  
**Proje Tipi:** React + TypeScript + Supabase (Lovable Cloud)

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Veritabanı Şeması](#3-veritabanı-şeması)
4. [UI Akış Diyagramı](#4-ui-akış-diyagramı)
5. [Veri Akış Diyagramı](#5-veri-akış-diyagramı)
6. [Bileşen Yapısı](#6-bileşen-yapısı)
7. [Hook'lar](#7-hooklar)
8. [Edge Functions](#8-edge-functions)
9. [Güvenlik (RLS Politikaları)](#9-güvenlik-rls-politikaları)
10. [API Referansı](#10-api-referansı)

---

## 1. Proje Özeti

**Duygu Günlüğü**, kullanıcıların günlük tutmasını ve yapay zeka destekli duygu analizi almasını sağlayan bir mobil uyumlu web uygulamasıdır.

### Temel Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📝 Günlük Yazma | Kullanıcılar düşüncelerini yazabilir |
| 🤖 AI Duygu Analizi | Gemini 2.5 Flash ile otomatik duygu tespiti |
| 📊 Mutluluk Skoru | 0-10 arası mutluluk seviyesi |
| 💡 Öneriler | Duyguya özel aktivite önerileri |
| 📅 Takvim Görünümü | Günlük duygusal durumu emoji ile gösterim |
| 🏆 Başarım Sistemi | Gamification ile motivasyon |
| 🔥 Seri Takibi | Günlük giriş serisi |
| 📤 Veri Dışa Aktarma | JSON/CSV formatında export |

---

## 2. Teknoloji Yığını

### Frontend

| Teknoloji | Versiyon | Kullanım |
|-----------|----------|----------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.x | Tip Güvenliği |
| Vite | 5.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Shadcn/UI | - | Bileşen Kütüphanesi |
| React Router | 6.30.1 | Routing |
| TanStack Query | 5.83.0 | Server State |
| Lucide React | 0.462.0 | İkonlar |

### Backend (Lovable Cloud / Supabase)

| Teknoloji | Kullanım |
|-----------|----------|
| Supabase Auth | Kimlik Doğrulama |
| PostgreSQL | Veritabanı |
| Edge Functions (Deno) | Serverless API |
| Row Level Security | Veri Güvenliği |

### AI Entegrasyonu

| Model | Kullanım |
|-------|----------|
| Google Gemini 2.5 Flash | Duygu Analizi |

### Mobil Dağıtım

| Teknoloji | Kullanım |
|-----------|----------|
| Capacitor | Native App Wrapper |
| PWA | Progressive Web App |

---

## 3. Veritabanı Şeması

### 3.1 ER Diyagramı

```
┌─────────────────┐       ┌─────────────────────┐
│   auth.users    │       │      profiles       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──1:1──│ id (PK)             │
│ email           │       │ user_id (FK)        │
│ encrypted_pass  │       │ display_name        │
│ raw_user_meta   │       │ created_at          │
│ created_at      │       └─────────────────────┘
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│   journal_entries   │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ content             │
│ primary_emotion     │
│ intensity           │
│ triggers[]          │
│ created_at          │
└─────────────────────┘

┌─────────────────────┐   ┌─────────────────────┐
│  user_achievements  │   │     user_stats      │
├─────────────────────┤   ├─────────────────────┤
│ id (PK)             │   │ id (PK)             │
│ user_id (FK)        │   │ user_id (FK)        │
│ achievement_id      │   │ total_points        │
│ unlocked_at         │   │ longest_streak      │
└─────────────────────┘   │ updated_at          │
                          └─────────────────────┘
```

### 3.2 Tablo Detayları

#### profiles

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### journal_entries

```sql
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  content TEXT NOT NULL,
  primary_emotion TEXT NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 5,
  triggers TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### user_achievements

```sql
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

#### user_stats

```sql
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  total_points INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### 3.3 Veritabanı Trigger'ları

```sql
-- Yeni kullanıcı kaydında otomatik profil oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 4. UI Akış Diyagramı

```
┌─────────────────────────────────────────────────────────────────┐
│                        UYGULAMA AKIŞI                           │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   App.tsx    │
                    │   (Router)   │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │  /auth   │    │    /     │    │/reset-password│
    │ Auth.tsx │    │Index.tsx │    │ResetPassword │
    └────┬─────┘    └────┬─────┘    └──────────────┘
         │               │
         │               │
    ┌────┴────┐    ┌─────┴─────────────────────────┐
    │         │    │                               │
    ▼         ▼    ▼                               │
┌───────┐ ┌───────┐ ┌─────────────────────────────┐│
│ Login │ │SignUp │ │         TABS                ││
│ Form  │ │ Form  │ ├─────┬─────┬─────┬──────────┤│
└───────┘ └───────┘ │Günlük│Geçmiş│Takvim│Ödüller ││
                    └─────┴─────┴─────┴──────────┘│
                                                   │
                    ┌──────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬───────────────┐
    │               │               │               │
    ▼               ▼               ▼               ▼
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Journal  │   │Journal   │   │Emotion   │   │Rewards   │
│Input    │   │History   │   │Calendar  │   │Panel     │
└────┬────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │             │              │              │
     ▼             ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│Emotion  │   │Entry     │   │Day       │   │Achievement│
│Display  │   │Card      │   │Details   │   │Cards     │
└─────────┘   └──────────┘   └──────────┘   └──────────┘
     │             │
     ▼             ▼
┌─────────┐   ┌──────────┐
│Suggestion│  │EntryDetail│
│List      │  │Modal     │
└─────────┘   └──────────┘
```

---

## 5. Veri Akış Diyagramı

### 5.1 Günlük Girişi Akışı

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Kullanıcı  │────▶│ JournalInput│────▶│  addEntry() │
│  Metin Yazar│     │  Bileşeni   │     │  Hook       │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Supabase  │◀────│Edge Function│◀────│   Lovable   │
│   Database  │     │analyze-emotion│   │  AI Gateway │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       │                                        ▼
       │            ┌─────────────┐     ┌─────────────┐
       │            │   Gemini    │────▶│  Emotion    │
       │            │  2.5 Flash  │     │  Analysis   │
       │            └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│                  YANIT                               │
├─────────────────────────────────────────────────────┤
│ • primaryEmotion: "happy" | "sad" | "angry" | ...   │
│ • intensity: 1-10                                    │
│ • triggers: ["iş", "aile", ...]                     │
└─────────────────────────────────────────────────────┘
```

### 5.2 Başarım Sistemi Akışı

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  entries    │────▶│ useRewards  │────▶│calculateStreak│
│  (değişir)  │     │   Hook      │     │              │
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │checkAchieve-│
                    │   ments     │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │first_entry│   │streak_3  │    │entries_10│
    │ Başarım  │    │ Başarım  │    │ Başarım  │
    └──────────┘    └──────────┘    └──────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │user_achieve-│
                    │ments INSERT │
                    └─────────────┘
```

### 5.3 Kimlik Doğrulama Akışı

```
┌─────────────────────────────────────────────────────┐
│                  AUTH AKIŞI                          │
└─────────────────────────────────────────────────────┘

KAYIT (Sign Up):
┌──────┐   ┌────────┐   ┌─────────┐   ┌──────────┐
│Form  │──▶│signUp()│──▶│Supabase │──▶│ profiles │
│Submit│   │        │   │Auth     │   │ (trigger)│
└──────┘   └────────┘   └─────────┘   └──────────┘

GİRİŞ (Sign In):
┌──────┐   ┌────────┐   ┌─────────┐   ┌──────────┐
│Form  │──▶│signIn()│──▶│Supabase │──▶│ Session  │
│Submit│   │        │   │Auth     │   │ Created  │
└──────┘   └────────┘   └─────────┘   └──────────┘

ŞİFRE SIFIRLAMA:
┌──────┐   ┌────────────┐   ┌─────────┐   ┌──────────┐
│Form  │──▶│resetPassword│──▶│Email    │──▶│/reset-   │
│Submit│   │            │   │Link     │   │password  │
└──────┘   └────────────┘   └─────────┘   └──────────┘
```

---

## 6. Bileşen Yapısı

### 6.1 Dosya Ağacı

```
src/
├── components/
│   ├── journal/
│   │   ├── AppHeader.tsx         # Üst menü (export, çıkış)
│   │   ├── JournalInput.tsx      # Günlük yazma alanı
│   │   ├── EmotionDisplay.tsx    # Duygu sonucu gösterimi
│   │   ├── SuggestionCard.tsx    # Öneri kartı
│   │   ├── SuggestionList.tsx    # Öneri listesi
│   │   ├── EntryCard.tsx         # Geçmiş giriş kartı
│   │   ├── JournalHistory.tsx    # Geçmiş listesi
│   │   ├── EntryDetailModal.tsx  # Giriş detay modalı
│   │   ├── EmotionCalendar.tsx   # Takvim görünümü
│   │   ├── RewardsPanel.tsx      # Ödüller paneli
│   │   ├── RewardsModal.tsx      # Başarım detay modalı
│   │   ├── StatsModal.tsx        # İstatistik modalı
│   │   └── ExportDataModal.tsx   # Veri export modalı
│   └── ui/                       # Shadcn bileşenleri
│
├── hooks/
│   ├── useAuth.ts                # Kimlik doğrulama
│   ├── useJournal.ts             # Günlük CRUD işlemleri
│   ├── useRewards.ts             # Başarım ve istatistik
│   └── use-mobile.tsx            # Mobil tespit
│
├── pages/
│   ├── Index.tsx                 # Ana sayfa (tab'lar)
│   ├── Auth.tsx                  # Giriş/Kayıt sayfası
│   ├── ResetPassword.tsx         # Şifre sıfırlama
│   └── NotFound.tsx              # 404 sayfası
│
├── data/
│   ├── emotionData.ts            # Duygu verileri ve öneriler
│   └── achievementsData.ts       # Başarım tanımları
│
├── types/
│   ├── journal.ts                # Journal tipleri
│   └── rewards.ts                # Reward tipleri
│
├── utils/
│   └── exportData.ts             # Veri export fonksiyonları
│
└── integrations/
    └── supabase/
        ├── client.ts             # Supabase client (auto-generated)
        └── types.ts              # DB tipleri (auto-generated)
```

### 6.2 Bileşen Hiyerarşisi

```
App
├── AuthHashHandler (global hata yakalama)
└── Routes
    ├── /auth → Auth
    │   ├── LoginForm
    │   ├── SignUpForm
    │   └── ForgotPasswordForm
    │
    ├── / → Index
    │   ├── AppHeader
    │   │   └── DropdownMenu (Export, Çıkış)
    │   ├── Tabs
    │   │   ├── TabsContent[journal]
    │   │   │   ├── JournalInput
    │   │   │   ├── EmotionDisplay
    │   │   │   └── SuggestionList
    │   │   │       └── SuggestionCard[]
    │   │   │
    │   │   ├── TabsContent[history]
    │   │   │   └── JournalHistory
    │   │   │       └── EntryCard[]
    │   │   │
    │   │   ├── TabsContent[calendar]
    │   │   │   └── EmotionCalendar
    │   │   │
    │   │   └── TabsContent[rewards]
    │   │       └── RewardsPanel
    │   │
    │   ├── EntryDetailModal
    │   └── ExportDataModal
    │
    └── /reset-password → ResetPassword
```

---

## 7. Hook'lar

### 7.1 useAuth

```typescript
interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{error: AuthError | null}>;
  signIn: (email: string, password: string) => Promise<{error: AuthError | null}>;
  signOut: () => Promise<{error: AuthError | null}>;
  resetPassword: (email: string) => Promise<{error: AuthError | null}>;
  updatePassword: (newPassword: string) => Promise<{error: AuthError | null}>;
}
```

### 7.2 useJournal

```typescript
interface UseJournalReturn {
  entries: JournalEntry[];
  currentAnalysis: EmotionAnalysis | null;
  isAnalyzing: boolean;
  isLoading: boolean;
  addEntry: (content: string) => Promise<JournalEntry | null>;
  deleteEntry: (id: string) => Promise<void>;
  clearCurrentAnalysis: () => void;
}
```

### 7.3 useRewards

```typescript
interface UseRewardsReturn {
  achievements: Achievement[];
  stats: UserStats;
  getProgress: () => { current: number; next: number; percentage: number };
}
```

---

## 8. Edge Functions

### 8.1 analyze-emotion

**Endpoint:** `POST /functions/v1/analyze-emotion`

**Request:**
```json
{
  "text": "Bugün çok mutluyum, harika bir gün geçirdim!"
}
```

**Response:**
```json
{
  "primaryEmotion": "happy",
  "intensity": 8,
  "triggers": ["pozitif düşünceler", "güzel deneyimler"]
}
```

**Kaynak Kod:**
```typescript
// supabase/functions/analyze-emotion/index.ts

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Sen bir duygu analizi uzmanısın. Kullanıcının yazdığı metni analiz et ve JSON formatında yanıt ver.
            
            Duygu türleri: happy, sad, angry, anxious, excited, calm, confused, hopeful, grateful, lonely, neutral
            
            Yanıt formatı:
            {
              "primaryEmotion": "duygu_türü",
              "intensity": 1-10 arası sayı (mutluluk seviyesi - happy için yüksek, sad için düşük),
              "triggers": ["tetikleyici1", "tetikleyici2"]
            }`
          },
          { role: 'user', content: text }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

---

## 9. Güvenlik (RLS Politikaları)

### 9.1 Genel Prensipler

- Tüm tablolarda Row Level Security (RLS) aktif
- Kullanıcılar SADECE kendi verilerini görebilir/düzenleyebilir
- `auth.uid() = user_id` kontrolü tüm işlemlerde zorunlu

### 9.2 Tablo Bazlı Politikalar

#### profiles

| İşlem | Politika | Koşul |
|-------|----------|-------|
| SELECT | Users can view their own profile | `auth.uid() = user_id` |
| INSERT | Users can insert their own profile | `auth.uid() = user_id` |
| UPDATE | Users can update their own profile | `auth.uid() = user_id` |
| DELETE | ❌ İzin yok | - |

#### journal_entries

| İşlem | Politika | Koşul |
|-------|----------|-------|
| SELECT | Users can view their own entries | `auth.uid() = user_id` |
| INSERT | Users can create their own entries | `auth.uid() = user_id` |
| UPDATE | Users can update their own entries | `auth.uid() = user_id` |
| DELETE | Users can delete their own entries | `auth.uid() = user_id` |

#### user_achievements

| İşlem | Politika | Koşul |
|-------|----------|-------|
| SELECT | Users can view their own achievements | `auth.uid() = user_id` |
| INSERT | Users can insert their own achievements | `auth.uid() = user_id` |
| UPDATE | ❌ İzin yok | - |
| DELETE | Users can delete their own achievements | `auth.uid() = user_id` |

#### user_stats

| İşlem | Politika | Koşul |
|-------|----------|-------|
| SELECT | Users can view their own stats | `auth.uid() = user_id` |
| INSERT | Users can insert their own stats | `auth.uid() = user_id` |
| UPDATE | Users can update their own stats | `auth.uid() = user_id` |
| DELETE | ❌ İzin yok | - |

---

## 10. API Referansı

### 10.1 Supabase Client Kullanımı

```typescript
import { supabase } from '@/integrations/supabase/client';

// Giriş yükle
const { data, error } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Yeni giriş ekle
const { data, error } = await supabase
  .from('journal_entries')
  .insert({
    content: 'Günlük içeriği',
    primary_emotion: 'happy',
    intensity: 8,
    triggers: ['iş', 'aile'],
    user_id: userId
  })
  .select()
  .single();

// Giriş sil
const { error } = await supabase
  .from('journal_entries')
  .delete()
  .eq('id', entryId);
```

### 10.2 Duygu Tipleri

```typescript
type Emotion = 
  | 'happy'     // 😊 Mutlu
  | 'sad'       // 😢 Üzgün
  | 'angry'     // 😠 Kızgın
  | 'anxious'   // 😰 Endişeli
  | 'excited'   // 🤩 Heyecanlı
  | 'calm'      // 😌 Sakin
  | 'confused'  // 😕 Karmaşık
  | 'hopeful'   // 🌟 Umutlu
  | 'grateful'  // 🙏 Minnettar
  | 'lonely'    // 😔 Yalnız
  | 'neutral';  // 😐 Nötr
```

### 10.3 Başarım Sistemi

| Başarım ID | Açıklama | Gereksinim |
|------------|----------|------------|
| first_entry | İlk Adım | 1 giriş yap |
| streak_3 | Tutarlı | 3 günlük seri |
| streak_7 | Haftalık Kahraman | 7 günlük seri |
| streak_30 | Ay Ustası | 30 günlük seri |
| entries_10 | Yazar | 10 giriş yap |
| entries_50 | Deneyimli Yazar | 50 giriş yap |
| entries_100 | Usta Yazar | 100 giriş yap |
| emotion_explorer | Duygu Kaşifi | 5 farklı duygu |
| happiness_master | Mutluluk Ustası | 10 mutlu giriş |

### 10.4 Puan Sistemi

| Aksiyon | Puan |
|---------|------|
| Günlük giriş | +10 |
| Seri bonusu (x gün) | +5 × gün sayısı |

---

## Ekler

### A. Ortam Değişkenleri

```env
VITE_SUPABASE_URL=https://lfmcfduupuwokmngdvbz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=lfmcfduupuwokmngdvbz
```

### B. Edge Function Secrets

| Secret | Açıklama |
|--------|----------|
| LOVABLE_API_KEY | Lovable AI Gateway API anahtarı |
| SUPABASE_URL | Supabase proje URL'i |
| SUPABASE_ANON_KEY | Supabase anonymous key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key |

---

**Doküman Sonu**

*Bu doküman Duygu Günlüğü uygulamasının teknik yapısını detaylı şekilde açıklamaktadır. Herhangi bir soru için geliştirici ekibiyle iletişime geçiniz.*
