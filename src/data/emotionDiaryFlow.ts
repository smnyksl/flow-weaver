import { FlowDiagram } from '@/types/flowchart';

export const emotionDiaryFlow: FlowDiagram = {
  id: 'emotion-diary-flow',
  title: 'Duygu Günlüğü Akış Diyagramı',
  nodes: [
    {
      id: 'N1',
      text: 'Günlük Yazma / Ses Kaydı',
      type: 'start',
      description: ['Yazı yazar', 'Ses kaydı alır (otomatik)']
    },
    {
      id: 'N2',
      text: 'Veri Ön İşleme',
      type: 'process',
      description: ['Yazım hatası düzeltme', 'Cümleleri ayrıştırma', 'Gereksiz kelime temizliği']
    },
    {
      id: 'N3',
      text: 'Duygu Analizi (AI)',
      type: 'action',
      description: ['Ana duygu tespiti', 'Yoğunluk ölçümü', "Metinden 'tetikleyici konular' çıkarma"]
    },
    {
      id: 'N4',
      text: 'Öneri Üretimi',
      type: 'action',
      description: ['1-2 kısa öneri', 'Nefes egzersizi / mini görev', 'Motivasyon cümlesi']
    },
    {
      id: 'N5',
      text: 'Günlük Kaydetme',
      type: 'process',
      description: ['Tarih + duygu etiketi + not', 'Kullanıcı isterse kilitleyebilir']
    },
    {
      id: 'N6',
      text: 'Hatırlatma Sistemi',
      type: 'parallel',
      description: ['Günlük yazma hatırlatıcısı', 'Haftalık özet bildirimleri']
    },
    {
      id: 'N7',
      text: 'Bulut Senkronizasyonu',
      type: 'end',
      description: ['Tüm veriler güvenli şekilde senkronize']
    }
  ],
  edges: [
    { id: 'E1', from: 'N1', to: 'N2' },
    { id: 'E2', from: 'N2', to: 'N3' },
    { id: 'E3', from: 'N3', to: 'N4' },
    { id: 'E4', from: 'N4', to: 'N5' },
    { id: 'E5', from: 'N5', to: 'N6' },
    { id: 'E6', from: 'N6', to: 'N7' }
  ],
  metadata: {
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    author: 'System'
  }
};
