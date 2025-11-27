import { FlowHeader } from '@/components/flowchart/FlowHeader';
import { FlowDiagram } from '@/components/flowchart/FlowDiagram';
import { emotionDiaryFlow } from '@/data/emotionDiaryFlow';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FlowHeader diagram={emotionDiaryFlow} />
      
      <main className="container mx-auto px-4 py-8">
        <FlowDiagram diagram={emotionDiaryFlow} />
      </main>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
};

export default Index;
