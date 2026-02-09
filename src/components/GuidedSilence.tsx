import { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";

interface GuidedSilenceProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GuidedSilence({ open, onOpenChange }: GuidedSilenceProps) {
    const [duration, setDuration] = useState<1 | 3 | 5>(1); // Minutes
    const [timeLeft, setTimeLeft] = useState(60); // Seconds
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Reset when opened
    useEffect(() => {
        if (open) {
            setIsActive(false);
            setIsFinished(false);
            setTimeLeft(duration * 60);
        }
    }, [open, duration]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            setIsFinished(true);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleStart = () => setIsActive(true);
    const handlePause = () => setIsActive(false);
    const handleReset = () => {
        setIsActive(false);
        setIsFinished(false);
        setTimeLeft(duration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background border border-border shadow-2xl overflow-hidden [&>button]:hidden">
                {/* Close Button Override */}
                <div className="absolute right-4 top-4 z-50">
                    <DialogClose asChild>
                        <button className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </DialogClose>
                </div>

                <DialogHeader className="sr-only">
                    <DialogTitle>Silêncio Guiado</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-10 relative">

                    {/* Background Ambient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/20 pointer-events-none" />

                    {/* Main Content */}
                    <div className="z-10 text-center w-full max-w-xs space-y-8">

                        {/* Context Message */}
                        <div className="space-y-2 h-16 flex flex-col justify-end pb-2">
                            {!isActive && !isFinished && (
                                <>
                                    <h3 className="text-xl font-heading font-semibold text-sky-900">Silêncio</h3>
                                    <p className="text-sm text-sky-700/80">Um minuto com Deus já é um começo.</p>
                                </>
                            )}
                            {isActive && (
                                <p
                                    className="text-lg font-serif italic text-sky-800 animate-pulse"
                                    style={{ animationDuration: '3s' }}
                                >
                                    "Fala Senhor, que teu servo escuta."
                                </p>
                            )}
                            {isFinished && (
                                <h3 className="text-xl font-heading font-semibold text-sky-900">Obrigado por este momento.</h3>
                            )}
                        </div>

                        {/* Timer Display */}
                        <div className={`relative flex items-center justify-center transition-all duration-700 ${isActive ? "scale-110" : "scale-100"}`}>
                            {/* Rings */}
                            <div className={`absolute inset-0 rounded-full border-4 border-primary/20 ${isActive ? "animate-ping opacity-20" : "opacity-0"}`} />
                            <div className="absolute inset-0 rounded-full border-4 border-white shadow-sm" />

                            <div className="w-48 h-48 rounded-full bg-card/60 backdrop-blur-sm flex items-center justify-center relative z-10 border border-border shadow-inner">
                                <span className="text-5xl font-light tabular-nums text-foreground tracking-tight">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-6">
                            {!isFinished ? (
                                <>
                                    {!isActive && (
                                        <div className="flex justify-center gap-2">
                                            {[1, 3, 5].map(min => (
                                                <button
                                                    key={min}
                                                    onClick={() => setDuration(min as 1 | 3 | 5)}
                                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${duration === min
                                                        ? "bg-primary/20 text-foreground shadow-sm"
                                                        : "text-primary hover:bg-primary/10"
                                                        }`}
                                                >
                                                    {min} min
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-4">
                                        {!isActive ? (
                                            <Button
                                                size="lg"
                                                className="rounded-full w-16 h-16 bg-primary hover:opacity-90 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-primary-foreground"
                                                onClick={handleStart}
                                            >
                                                <Play className="w-6 h-6 fill-current ml-1" />
                                            </Button>
                                        ) : (
                                            <Button
                                                size="lg"
                                                variant="secondary"
                                                className="rounded-full w-16 h-16 bg-card hover:bg-muted text-foreground border border-border shadow-lg hover:scale-105 transition-all"
                                                onClick={handlePause}
                                            >
                                                <Pause className="w-6 h-6 fill-current" />
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => onOpenChange(false)}
                                        className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg"
                                    >
                                        Encerrar
                                    </Button>
                                    <Button variant="ghost" onClick={handleReset} className="text-sky-700 hover:bg-sky-50">
                                        <RotateCcw className="w-4 h-4 mr-2" /> Repetir
                                    </Button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
