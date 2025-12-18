import { TrendingUp, TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InsightsPanelProps {
  weeklyInsight?: string;
  monthlyInsight?: string;
}

export function InsightsPanel({ weeklyInsight, monthlyInsight }: InsightsPanelProps) {
  if (!weeklyInsight && !monthlyInsight) return null;

  const isWarning = monthlyInsight?.toLowerCase().includes('kötüye') || 
                    monthlyInsight?.toLowerCase().includes('uyarı') ||
                    monthlyInsight?.toLowerCase().includes('dikkat');

  return (
    <div className="space-y-3 animate-fade-in">
      {weeklyInsight && (
        <Card className="bg-card/80 backdrop-blur border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-1">Haftalık Özet</h4>
                <p className="text-sm text-muted-foreground">{weeklyInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {monthlyInsight && (
        <Card className={`backdrop-blur ${isWarning ? 'bg-destructive/10 border-destructive/30' : 'bg-card/80 border-accent/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${isWarning ? 'bg-destructive/20' : 'bg-accent/10'}`}>
                {isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                ) : monthlyInsight.toLowerCase().includes('iyiye') ? (
                  <TrendingUp className="w-4 h-4 text-accent" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <h4 className={`text-sm font-medium mb-1 ${isWarning ? 'text-destructive' : 'text-foreground'}`}>
                  Aylık Trend {isWarning && '⚠️'}
                </h4>
                <p className={`text-sm ${isWarning ? 'text-destructive/80' : 'text-muted-foreground'}`}>
                  {monthlyInsight}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
