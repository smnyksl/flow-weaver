import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import characterFront from '@/assets/character/front.svg';

const motivationalMessages = {
  tr: [
    "Bugün harika bir gün olacak! 🌟",
    "Her adım seni hedefe yaklaştırıyor! 💪",
    "Kendine inan, başarı senin! ✨",
    "Küçük adımlar büyük değişimlere yol açar! 🚀",
    "Sen düşündüğünden daha güçlüsün! 💫",
    "Her gün yeni bir başlangıç! 🌈",
    "Duygularını yazmak cesaret ister, aferin! 📝",
    "Kendine zaman ayırdığın için teşekkürler! 💜",
    "İlerleme mükemmellikten önemlidir! 🎯",
    "Bugün de burada olduğun için harikasın! ⭐",
  ],
  en: [
    "Today is going to be a great day! 🌟",
    "Every step brings you closer to your goal! 💪",
    "Believe in yourself, success is yours! ✨",
    "Small steps lead to big changes! 🚀",
    "You are stronger than you think! 💫",
    "Every day is a new beginning! 🌈",
    "Writing your feelings takes courage, well done! 📝",
    "Thank you for taking time for yourself! 💜",
    "Progress is more important than perfection! 🎯",
    "You're amazing for being here today! ⭐",
  ],
  de: [
    "Heute wird ein toller Tag! 🌟",
    "Jeder Schritt bringt dich näher ans Ziel! 💪",
    "Glaube an dich, der Erfolg gehört dir! ✨",
    "Kleine Schritte führen zu großen Veränderungen! 🚀",
    "Du bist stärker als du denkst! 💫",
    "Jeder Tag ist ein neuer Anfang! 🌈",
    "Gefühle aufzuschreiben erfordert Mut, gut gemacht! 📝",
    "Danke, dass du dir Zeit für dich nimmst! 💜",
    "Fortschritt ist wichtiger als Perfektion! 🎯",
    "Du bist großartig, dass du heute hier bist! ⭐",
  ],
};

export const AnimatedCharacter = () => {
  const { i18n } = useTranslation();

  const handleClick = () => {
    const lang = i18n.language as keyof typeof motivationalMessages;
    const messages = motivationalMessages[lang] || motivationalMessages.en;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    toast(randomMessage, {
      duration: 3000,
      position: 'top-center',
    });
  };

  return (
    <div className="absolute top-4 right-4 w-16 h-16 z-10">
      <button
        onClick={handleClick}
        className="w-full h-full cursor-pointer hover:scale-110 focus:outline-none transition-transform duration-300"
        aria-label="Get motivational message"
      >
        <img
          src={characterFront}
          alt="Animated character"
          className="w-full h-full object-contain drop-shadow-lg"
          style={{
            animation: 'float 3s ease-in-out infinite',
          }}
        />
      </button>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
      `}</style>
    </div>
  );
};
