import { useState } from 'react';
import { Check, Lock, Search, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExame } from '@/hooks/useExame';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const ExameConclusao = () => {
  const navigate = useNavigate();
  const { completeExam } = useExame();
  const [selectedPropositos, setSelectedPropositos] = useState<string[]>([]);
  const [customPropósito, setCustomPropósito] = useState('');

  const propositos = [
    'Ir à Missa no domingo',
    'Rezar 15 minutos por dia',
    'Ser mais paciente com minha família',
    'Evitar situações de tentação',
  ];

  const handleComplete = () => {
    completeExam();
  };

  const handleTogglePropósito = (propósito: string) => {
    if (selectedPropositos.includes(propósito)) {
      setSelectedPropositos(selectedPropositos.filter((p) => p !== propósito));
    } else {
      setSelectedPropositos([...selectedPropositos, propósito]);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-bg">
      <div className="max-w-3xl mx-auto p-4 space-y-8 py-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-primary">Exame Concluído</h1>
        </div>

        {/* Oração de Arrependimento */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl text-primary flex items-center gap-2">
            <span>🙏</span>
            Momento de Oração
          </h2>
          <div className="bg-gradient-to-br from-primary to-[#2C4A6C] rounded-3xl p-8 text-white">
            <p className="font-serif italic text-lg leading-loose text-center">
              Ó Deus, eu me arrependo, de todo o coração, de todos os meus pecados, e os detesto,
              porque, pecando, ofendi a Vós que sois o sumo Bem e digno de ser amado sobre todas as
              coisas.
            </p>
            <p className="font-serif italic text-lg leading-loose text-center mt-4">
              Proponho firmemente, com a ajuda da vossa graça, nunca mais pecar e fugir das
              ocasiões próximas de pecado.
            </p>
            <p className="font-serif italic text-lg leading-loose text-center mt-4 font-semibold">
              Senhor, tende piedade de mim, pecador. Ámen.
            </p>
          </div>
        </div>

        {/* Propósito de Emenda */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-xl text-primary flex items-center gap-2">
            <span>💡</span>
            Propósito de Emenda
          </h2>
          <p className="text-secondary text-sm">Escolha uma ação concreta para esta semana:</p>

          <div className="space-y-3">
            {propositos.map((propósito) => (
              <div key={propósito} className="flex items-center gap-3">
                <Checkbox
                  id={propósito}
                  checked={selectedPropositos.includes(propósito)}
                  onCheckedChange={() => handleTogglePropósito(propósito)}
                />
                <label
                  htmlFor={propósito}
                  className="text-sm cursor-pointer flex-1"
                >
                  {propósito}
                </label>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Input
              placeholder="Escrever meu próprio propósito..."
              value={customPropósito}
              onChange={(e) => setCustomPropósito(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Próximo Passo */}
        <div className="space-y-4">
          <h2 className="font-semibold text-xl text-primary flex items-center gap-2">
            <span>⛪</span>
            Próximo Passo
          </h2>
          <Button
            onClick={() => {
              handleComplete();
              navigate('/churches');
            }}
            className="w-full bg-accent text-primary hover:bg-accent/90 py-6 text-lg flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Encontrar Confessionário
          </Button>
          <div className="text-center">
            <p className="text-sm text-secondary font-medium">OU</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              handleComplete();
              navigate('/examination');
            }}
            className="w-full py-6 text-lg flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Anotar em Papel
          </Button>
        </div>

        {/* Aviso de Privacidade */}
        <div className="bg-success/10 border border-success/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-success font-medium text-sm">
                Nenhum dado foi salvo.
              </p>
              <p className="text-success/80 text-xs">
                Suas reflexões permanecem entre você e Deus. Apenas a data de conclusão foi
                registrada para fins estatísticos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExameConclusao;
