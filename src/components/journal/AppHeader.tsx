import { BookHeart } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flow-gradient flex items-center justify-center">
            <BookHeart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Duygu Günlüğü</h1>
            <p className="text-xs text-muted-foreground">Duygularını keşfet</p>
          </div>
        </div>
      </div>
    </header>
  );
}
