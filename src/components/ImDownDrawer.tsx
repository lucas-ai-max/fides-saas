import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Wind, Heart, Shield, Frown, Users, ArrowRight } from "lucide-react";

// Content Data
const feelings = [
    {
        id: "anxiety",
        label: "Ansiedade",
        emoji: "😰",
        color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        prayer: "Senhor, acalma meu coração. Entrego a Ti o que não posso controlar. Dá-me a Tua paz que excede todo entendimento.",
        verse: "Não andeis ansiosos por coisa alguma; antes em tudo sejam os vossos pedidos conhecidos diante de Deus. (Filipenses 4:6)"
    },
    {
        id: "sadness",
        label: "Tristeza",
        emoji: "😢",
        color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
        prayer: "Senhor, tu conheces a dor que carrego agora. Sê o meu consolo e enxuga minhas lágrimas. Renova minha esperança.",
        verse: "O Senhor está perto dos que têm o coração quebrantado e salva os de espírito abatido. (Salmos 34:18)"
    },
    {
        id: "fear",
        label: "Medo",
        emoji: "😨",
        color: "bg-amber-100 text-amber-700 hover:bg-amber-200",
        prayer: "Deus, tu és meu refúgio e fortaleza. Afasta de mim todo temor e enche-me com a Tua coragem e proteção.",
        verse: "Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo. (Salmos 23:4)"
    },
    {
        id: "anger",
        label: "Raiva",
        emoji: "😠",
        color: "bg-red-100 text-red-700 hover:bg-red-200",
        prayer: "Senhor, acalma esta tempestade dentro de mim. Ajuda-me a perdoar e a não agir por impulso. Dá-me mansidão.",
        verse: "Todo o homem seja pronto para ouvir, tardio para falar, tardio para se irar. (Tiago 1:19)"
    },
    {
        id: "loneliness",
        label: "Solidão",
        emoji: "😞",
        color: "bg-teal-100 text-teal-700 hover:bg-teal-200",
        prayer: "Jesus, tu disseste que estarias conosco todos os dias. Preenche este vazio com a Tua presença amorosa.",
        verse: "E eis que estou convosco todos os dias, até à consumação dos séculos. (Mateus 28:20)"
    }
];

export function ImDownDrawer({ children }: { children: React.ReactNode }) {
    const [selectedFeeling, setSelectedFeeling] = useState<typeof feelings[0] | null>(null);
    const [step, setStep] = useState<"select" | "breathe" | "prayer">("select");
    const [breathCount, setBreathCount] = useState(0); // 0: inhale, 1: hold, 2: exhale

    // Reset state when closed
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setTimeout(() => {
                setSelectedFeeling(null);
                setStep("select");
                setBreathCount(0);
            }, 300);
        }
    };

    const handleSelect = (feeling: typeof feelings[0]) => {
        setSelectedFeeling(feeling);
        setStep("breathe");
    };

    return (
        <Drawer onOpenChange={handleOpenChange}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent className="bg-white dark:bg-slate-900 rounded-t-[2rem] max-h-[90vh]">
                <div className="mx-auto w-full max-w-md p-6 pb-12">

                    {/* Header with Close */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-heading font-semibold text-xl text-foreground">
                            {step === "select" && "Como você está?"}
                            {step === "breathe" && "Respire fundo..."}
                            {step === "prayer" && "Uma palavra para você"}
                        </h2>
                        <DrawerClose asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <X className="w-4 h-4" />
                            </Button>
                        </DrawerClose>
                    </div>

                    <div className="min-h-[300px] transition-all duration-500 ease-in-out">

                        {/* STEP 1: SELECT FEELING */}
                        {step === "select" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <p className="text-muted-foreground text-center mb-4">
                                    Você não está sozinho. Compartilhe o que sente e vamos encontrar um alívio juntos.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {feelings.map((feeling) => (
                                        <button
                                            key={feeling.id}
                                            onClick={() => handleSelect(feeling)}
                                            className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95 ${feeling.color}`}
                                        >
                                            <span className="text-3xl">{feeling.emoji}</span>
                                            <span className="font-medium">{feeling.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: BREATHE */}
                        {step === "breathe" && selectedFeeling && (
                            <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 py-8">
                                <BreathingCircle onComplete={() => setStep("prayer")} />

                                <div className="text-center space-y-2">
                                    <h3 className="font-heading font-medium text-lg text-primary">Vamos acalmar o coração</h3>
                                    <p className="text-sm text-muted-foreground">Siga a respiração por alguns segundos...</p>
                                </div>

                                <Button variant="ghost" className="mt-4" onClick={() => setStep("prayer")}>
                                    Pular respiração <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* STEP 3: PRAYER & WORD */}
                        {step === "prayer" && selectedFeeling && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">

                                {/* Verse Card */}
                                <div className="bg-accent/10 dark:bg-accent/10 p-6 rounded-3xl border border-accent/20">
                                    <p className="font-serif italic text-foreground text-lg leading-relaxed text-center">
                                        "{selectedFeeling.verse}"
                                    </p>
                                </div>

                                {/* Prayer */}
                                <div>
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Heart className="w-4 h-4" /> Oração sugerida
                                    </h3>
                                    <div className="p-4 bg-muted rounded-2xl">
                                        <p className="text-foreground leading-relaxed">
                                            {selectedFeeling.prayer}
                                        </p>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="pt-4 flex gap-3">
                                    <DrawerClose asChild>
                                        <Button className="flex-1 rounded-xl" size="lg">
                                            Estou melhor 🙏
                                        </Button>
                                    </DrawerClose>
                                    {/* Future: Link to Chat with Catechist */}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </DrawerContent>
        </Drawer>
    );
}

// Simple Breathing Indicator Component
function BreathingCircle({ onComplete }: { onComplete: () => void }) {
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
    const [timeLeft, setTimeLeft] = useState(3); // 3 cycles just for demo

    useEffect(() => {
        // A simple cycle: Inhale (4s) -> Hold (2s) -> Exhale (4s)
        let mounted = true;

        const runCycle = async () => {
            if (!mounted) return;

            // Inhale
            setPhase("inhale");
            await new Promise(r => setTimeout(r, 4000));
            if (!mounted) return;

            // Hold
            setPhase("hold");
            await new Promise(r => setTimeout(r, 2000));
            if (!mounted) return;

            // Exhale
            setPhase("exhale");
            await new Promise(r => setTimeout(r, 4000));
            if (!mounted) return;

            setTimeLeft(prev => {
                if (prev <= 1) {
                    onComplete(); // Done 3 cycles
                    return 0;
                }
                runCycle(); // Next cycle
                return prev - 1;
            });
        };

        runCycle();

        return () => { mounted = false; };
    }, []);

    return (
        <div className="relative flex items-center justify-center w-48 h-48">
            {/* Background circles */}
            <div
                className={`absolute inset-0 rounded-full bg-blue-100/50 dark:bg-blue-900/20 transition-all ease-in-out
                    ${phase === "inhale" ? "scale-100 opacity-100" : phase === "hold" ? "scale-100 opacity-80" : "scale-50 opacity-50"}
                `}
                style={{ transitionDuration: '4000ms' }}
            />

            <div
                className={`absolute inset-4 rounded-full bg-blue-200/50 dark:bg-blue-800/20 transition-all ease-in-out
                    ${phase === "inhale" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-50"}
                `}
                style={{ transitionDuration: '4000ms' }}
            />

            {/* Label */}
            <div className="z-10 text-center">
                <span className="text-xl font-medium text-foreground block mb-1">
                    {phase === "inhale" && "Inspire..."}
                    {phase === "hold" && "Segure..."}
                    {phase === "exhale" && "Expire..."}
                </span>
                <Wind className={`w-6 h-6 mx-auto text-foreground transition-opacity duration-500 ${phase === "hold" ? "opacity-0" : "opacity-100"}`} />
            </div>
        </div>
    );
}
