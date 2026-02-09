import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    PrayingHands, // Using custom icon or generic
    Archive,
    CheckCircle2,
    Trash2,
    Calendar,
    Tag as TagIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Tipos
interface Intention {
    id: string;
    title: string;
    description?: string;
    type: 'pedido' | 'agradecimento';
    tags: string[];
    createdAt: string;
    status: 'active' | 'answered' | 'archived';
    prayerCount: number;
}

export default function Intentions() {
    const navigate = useNavigate();
    const [intentions, setIntentions] = useState<Intention[]>([]);
    const [showNewIntention, setShowNewIntention] = useState(false);

    // Form States
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<'pedido' | 'agradecimento'>('pedido');

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('user_intentions');
        if (saved) {
            setIntentions(JSON.parse(saved));
        }
    }, []);

    const saveIntentions = (data: Intention[]) => {
        setIntentions(data);
        localStorage.setItem('user_intentions', JSON.stringify(data));
    };

    const handleCreate = () => {
        if (!newTitle.trim()) {
            toast.error('Dê um título para sua intenção');
            return;
        }

        const newIntention: Intention = {
            id: crypto.randomUUID(),
            title: newTitle,
            description: newDesc,
            type: newType,
            tags: [], // Implement tags later
            createdAt: new Date().toISOString(),
            status: 'active',
            prayerCount: 0
        };

        const updated = [newIntention, ...intentions];
        saveIntentions(updated);

        // Reset form
        setNewTitle('');
        setNewDesc('');
        setNewType('pedido');
        setShowNewIntention(false);
        toast.success('Intenção criada com sucesso!');
    };

    const handlePray = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = intentions.map(i => {
            if (i.id === id) {
                return { ...i, prayerCount: i.prayerCount + 1 };
            }
            return i;
        });
        saveIntentions(updated);
        toast.success('Sua oração foi registrada 🙏');
    };

    const handleStatusChange = (id: string, status: Intention['status']) => {
        const updated = intentions.map(i => {
            if (i.id === id) {
                return { ...i, status };
            }
            return i;
        });
        saveIntentions(updated);
        toast.success('Status atualizado');
    };

    const handleDelete = (id: string) => {
        const updated = intentions.filter(i => i.id !== id);
        saveIntentions(updated);
        toast.success('Intenção removida');
    };

    const activeIntentions = intentions.filter(i => i.status === 'active');
    const answeredIntentions = intentions.filter(i => i.status === 'answered');

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background pb-28">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <h1 className="font-heading font-semibold text-lg text-foreground">Minhas Intenções</h1>
                    </div>
                    <Dialog open={showNewIntention} onOpenChange={setShowNewIntention}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
                                <Plus className="w-4 h-4" />
                                Nova
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Nova Intenção</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">O que você quer pedir ou agradecer?</label>
                                    <Input
                                        placeholder="Ex: Saúde da minha mãe, Emprego novo..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewType('pedido')}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${newType === 'pedido' ? 'bg-primary/10 border-primary/20 text-muted-foreground' : 'bg-transparent border-input text-foreground'}`}
                                        >
                                            🙏 Pedido
                                        </button>
                                        <button
                                            onClick={() => setNewType('agradecimento')}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${newType === 'agradecimento' ? 'bg-accent/10 border-accent/30 text-muted-foreground' : 'bg-transparent border-input text-foreground'}`}
                                        >
                                            ✨ Agradecimento
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Detalhes (opcional)</label>
                                    <Textarea
                                        placeholder="Escreva mais detalhes para te ajudar a rezar..."
                                        className="resize-none h-24"
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                    />
                                </div>

                                <Button onClick={handleCreate} className="w-full mt-2">
                                    Salvar Intenção
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6 space-y-8">
                {activeIntentions.length === 0 && answeredIntentions.length === 0 && (
                    <div className="text-center py-12 px-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">🙏</span>
                        </div>
                        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Comece suas intenções</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                            Registre pedidos e agradecimentos para organizar sua vida de oração. Deus ouve cada detalhe.
                        </p>
                        <Button onClick={() => setShowNewIntention(true)} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                            Criar primeira intenção
                        </Button>
                    </div>
                )}

                {/* Lista de Ativas */}
                {activeIntentions.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            Em Oração ({activeIntentions.length})
                        </h2>
                        {activeIntentions.map((intention) => (
                            <div
                                key={intention.id}
                                className="bg-white dark:bg-card border border-border shadow-sm rounded-xl p-5 relative group transition-all hover:shadow-md"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2 mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${intention.type === 'pedido'
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                                                : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                                            }`}>
                                            {intention.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* Menu de ações (simplificado para demo) */}
                                        <button
                                            onClick={() => handleStatusChange(intention.id, 'answered')}
                                            className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Marcar como atendida"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(intention.id)}
                                            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-heading font-semibold text-foreground mb-1">
                                    {intention.title}
                                </h3>

                                {intention.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                        {intention.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(intention.createdAt).toLocaleDateString('pt-BR')}
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                                        onClick={(e) => handlePray(intention.id, e)}
                                    >
                                        <span>🙏</span>
                                        <span>Rezar ({intention.prayerCount})</span>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Lista de Atendidas */}
                {answeredIntentions.length > 0 && (
                    <div className="space-y-4 pt-4 opacity-80">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                Graças Alcançadas ({answeredIntentions.length})
                            </h2>
                            <div className="h-px bg-border flex-1" />
                        </div>

                        {answeredIntentions.map((intention) => (
                            <div
                                key={intention.id}
                                className="bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 rounded-xl p-4 flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-medium text-foreground line-through decoration-green-500/50 decoration-2">
                                        {intention.title}
                                    </h3>
                                    <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
                                        Atendida em {new Date().toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-card p-2 rounded-full shadow-sm">
                                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>

            <BottomNav />
        </div>
    );
}
