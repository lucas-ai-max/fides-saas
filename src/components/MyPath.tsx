import { useNavigate } from "react-router-dom";
import { BookOpen, HandHeart, Sparkles, ChevronRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DayActivity {
    date: string; // YYYY-MM-DD
    hasLiturgy: boolean;
    hasPrayer: boolean;
    hasSilence: boolean;
}

export function MyPath() {
    const navigate = useNavigate();

    // Mock data - eventually will come from Supabase/LocalStorage
    const stats = {
        daysWalking: 7,
        prayerMoments: 3,
        liturgyReads: 4,
    };

    // Mock last 7 days (including today)
    const generateMockWeek = () => {
        const days: DayActivity[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Randomly assign activities for demo
            days.push({
                date: dateStr,
                hasLiturgy: i % 2 === 0, // Mock: true on even days
                hasPrayer: i % 3 === 0,  // Mock: true on every 3rd day
                hasSilence: false,
            });
        }
        return days;
    };

    const weekDays = generateMockWeek();

    const getDayLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date().toISOString().split('T')[0];

        if (dateStr === today) return "Hoje";

        // Returns "Seg", "Ter", etc.
        return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    };

    return (
        <Card className="p-0 bg-white/95 dark:bg-card/95 shadow-md border-0 rounded-3xl overflow-hidden">
            {/* Header com gradiente suave */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-100/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-heading font-semibold text-primary/90">
                            Meu Caminho
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Pequenos passos, com constância.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/5 -mr-2 text-xs"
                        onClick={() => navigate("/history")} // Futura página de histórico
                    >
                        Ver histórico <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Cards Principais (3 Colunas) */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Dias Caminhando */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 text-center">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-500 mb-0.5">
                            {stats.daysWalking}d
                        </span>
                        <p className="text-[10px] uppercase tracking-wide font-medium text-amber-800/60 dark:text-amber-400/60 leading-tight">
                            Caminhando
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">
                            nos últimos 10
                        </p>
                    </div>

                    {/* Momentos Oração */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-900/30 text-center">
                        <span className="text-2xl font-bold text-pink-600 dark:text-pink-500 mb-0.5">
                            {stats.prayerMoments}
                        </span>
                        <p className="text-[10px] uppercase tracking-wide font-medium text-pink-800/60 dark:text-pink-400/60 leading-tight">
                            Orações
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">
                            esta semana
                        </p>
                    </div>

                    {/* Liturgia Lida */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 text-center">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-500 mb-0.5">
                            {stats.liturgyReads}<span className="text-sm font-normal text-blue-400">/7</span>
                        </span>
                        <p className="text-[10px] uppercase tracking-wide font-medium text-blue-800/60 dark:text-blue-400/60 leading-tight">
                            Liturgias
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-1">
                            lidas
                        </p>
                    </div>
                </div>

                {/* Semana em Bolinhas */}
                <div>
                    <div className="flex justify-between px-1 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Sua semana</span>
                        <span className="text-xs text-muted-foreground/60">Toque para ver</span>
                    </div>
                    <div className="flex justify-between items-end gap-2">
                        {weekDays.map((day, index) => {
                            const isEmpty = !day.hasLiturgy && !day.hasPrayer && !day.hasSilence;

                            return (
                                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                    {/* Bolinha do dia */}
                                    <div className={`
                    w-full aspect-[4/5] rounded-xl flex items-center justify-center flex-col gap-0.5 transition-all
                    ${isEmpty
                                            ? 'bg-gray-50 border border-gray-100 text-gray-300 dark:bg-gray-900/40 dark:border-gray-800'
                                            : 'bg-gradient-to-b from-white to-gray-50 border border-indigo-100 shadow-sm dark:bg-gray-800 dark:border-gray-700'
                                        }
                  `}>
                                        {isEmpty ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
                                        ) : (
                                            <>
                                                {day.hasLiturgy && <BookOpen className="w-3 h-3 text-blue-500" />}
                                                {day.hasPrayer && <HandHeart className="w-3 h-3 text-pink-500" />}
                                                {/* {day.hasSilence && <Sparkles className="w-3 h-3 text-amber-500" />} */}
                                            </>
                                        )}
                                    </div>
                                    {/* Label do dia */}
                                    <span className={`text-[10px] ${getDayLabel(day.date) === 'Hoje'
                                            ? 'font-bold text-primary'
                                            : 'text-muted-foreground'
                                        }`}>
                                        {getDayLabel(day.date).charAt(0)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <Button
                    className="w-full bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 shadow-none justify-between group"
                    onClick={() => navigate('/prayers')}
                >
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold">Começar agora</span>
                    </span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        3 min de oração <ChevronRight className="w-3 h-3 inline ml-1" />
                    </span>
                </Button>
            </div>
        </Card>
    );
}
