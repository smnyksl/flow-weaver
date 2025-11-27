import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalInputProps {
  onSubmit: (content: string) => void;
  isAnalyzing: boolean;
}

export function JournalInput({ onSubmit, isAnalyzing }: JournalInputProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim() && !isAnalyzing) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flow-gradient flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="font-semibold text-foreground">Bugün nasıl hissediyorsun?</h2>
      </div>
      
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Düşüncelerini ve duygularını buraya yaz... Ne hissediyorsun? Bugün neler oldu?"
        className={cn(
          'min-h-[150px] resize-none border-border/50 focus:border-primary/50',
          'bg-background/50 placeholder:text-muted-foreground/60',
          'transition-all duration-200'
        )}
        disabled={isAnalyzing}
      />
      
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-muted-foreground">
          {content.length} karakter
        </p>
        <Button 
          onClick={handleSubmit}
          disabled={!content.trim() || isAnalyzing}
          className="flow-gradient hover:opacity-90 transition-opacity"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analiz ediliyor...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Gönder
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
