import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronRight, PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/BottomNav';

interface Step {
    id: string;
    title: string;
    duration: string;
    completed: boolean;
}

interface Trail {
    id: string;
    title: string;
    description: string;
    image: string;
    totalSteps: number;
    completedSteps: number;
    steps: Step[];
}

export default function Learn() {
    const navigate = useNavigate();
    const [activeTrail, setActiveTrail] = useState<string | null>(null);

    // Mock Data
    const trails: Trail[] = [
        {
            id: 'missa',
            title: 'Entendendo a Missa',
            description: 'Descubra o significado de cada parte da celebração e participe com mais amor.',
            image: '/back1.png', // Placeholder
            totalSteps: 5,
            completedSteps: 1,
            steps: [
                { id: '1', title: 'O que é a Missa?', duration: '3 min', completed: true },
                { id: '2', title: 'Ritos Iniciais', duration: '4 min', completed: false },
                { id: '3', title: 'Liturgia da Palavra', duration: '5 min', completed: false },
                { id: '4', title: 'Liturgia Eucarística', duration: '6 min', completed: false },
                { id: '5', title: 'Ritos Finais e Envio', duration: '2 min', completed: false },
            ]
        },
        {
            id: 'oracao',
            title: 'Como Rezar',
            description: 'Um guia prático para iniciantes conversa com Deus no dia a dia.',
            image: '/back2.png', // Placeholder
            totalSteps: 4,
            completedSteps: 0,
            steps: [
                { id: '1', title: 'O que é oração?', duration: '3 min', completed: false },
                { id: '2', title: 'Tipos de oração', duration: '4 min', completed: false },
                { id: '3', title: 'Lidando com distrações', duration: '3 min', completed: false },
                { id: '4', title: 'Criando um hábito', duration: '3 min', completed: false },
            ]
        },
        {
            id: 'sacramentos',
            title: 'Os 7 Sacramentos',
            description: 'Sinais visíveis da graça invisível de Deus.',
            image: '/back-saint-light.png', // Placeholder
            totalSteps: 7,
            completedSteps: 0,
            steps: []
        }
    ];

    const handleStepClick = (trailId: string, stepId: string) => {
        // In future: navigate to step detail
        console.log(`Open step ${stepId} of trail ${trailId}`);
    };

    if (activeTrail) {
        const trail = trails.find(t => t.id === activeTrail);
        if (!trail) return null;

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background pb-20">
                <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-sm">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                        <button onClick={() => setActiveTrail(null)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <h1 className="font-heading font-semibold text-lg text-foreground truncate">{trail.title}</h1>
                    </div>
                </header>

                <main className="max-w-3xl mx-auto p-4 space-y-6">
                    {/* Hero da Trilha */}
                    <div className="relative rounded-3xl overflow-hidden aspect-video shadow-md">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url('${trail.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                            <p className="text-sm font-medium opacity-90 mb-1">{trail.completedSteps}/{trail.totalSteps} passos concluídos</p>
                            <Progress value={(trail.completedSteps / trail.totalSteps) * 100} className="h-1.5 bg-white/30 mb-4 [&>div]:bg-white" />
                            <Button className="bg-white text-primary hover:bg-white/90 font-semibold rounded-full">
                                Continuar Trilha
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-heading font-semibold text-xl text-foreground">Passos da Jornada</h2>

                        <div className="space-y-3">
                            {trail.steps.length > 0 ? trail.steps.map((step, index) => {
                                const isLocked = index > 0 && !trail.steps[index - 1].completed && !step.completed;

                                return (
                                    <div
                                        key={step.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${step.completed
                                                ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30'
                                                : isLocked
                                                    ? 'bg-gray-50 border-gray-100 opacity-70 dark:bg-gray-900/40 dark:border-gray-800'
                                                    : 'bg-white border-border hover:border-primary/30 hover:shadow-sm dark:bg-card'
                                            }`}
                                        onClick={() => !isLocked && handleStepClick(trail.id, step.id)}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                                : isLocked
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                                    : 'bg-primary/10 text-primary'
                                            }`}>
                                            {step.completed ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : isLocked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className={`font-medium ${step.completed ? 'text-green-900 dark:text-green-100' : 'text-foreground'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">{step.duration}</p>
                                        </div>

                                        {!isLocked && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                    </div>
                                );
                            }) : (
                                <p className="text-center text-muted-foreground py-8">Conteúdo em breve...</p>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background pb-28">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => navigate('/home')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <h1 className="font-heading font-semibold text-lg text-foreground">Aprender</h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
                <div className="py-2">
                    <h2 className="text-2xl font-heading font-bold text-primary mb-1">Trilhas de Fé</h2>
                    <p className="text-muted-foreground">Escolha um tema e vá no seu ritmo.</p>
                </div>

                <div className="grid gap-4">
                    {trails.map((trail) => (
                        <div
                            key={trail.id}
                            onClick={() => setActiveTrail(trail.id)}
                            className="bg-white dark:bg-card border border-border rounded-2xl p-4 flex gap-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                        >
                            <div
                                className="w-24 aspect-square rounded-xl bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url('${trail.image}')` }}
                            />
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wide bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {trail.totalSteps} passos
                                    </span>
                                </div>
                                <h3 className="font-heading font-semibold text-lg text-foreground leading-tight mb-1">
                                    {trail.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                    {trail.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
