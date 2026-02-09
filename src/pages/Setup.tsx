import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const Setup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [faithJourney, setFaithJourney] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [timeAvailable, setTimeAvailable] = useState("");
  const navigate = useNavigate();

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const faithOptions = [
    { value: "beginning", label: "Estou começando a conhecer" },
    { value: "catechumen", label: "Sou catecúmeno (preparação)" },
    { value: "deepening", label: "Já sou católico e quero aprofundar" },
    { value: "returning", label: "Afastado e retornando" }
  ];

  const interestOptions = [
    { value: "scripture", label: "Escrituras Sagradas" },
    { value: "sacraments", label: "Sacramentos" },
    { value: "prayer", label: "Vida de Oração" },
    { value: "moral", label: "Moral Católica" },
    { value: "history", label: "História da Igreja" },
    { value: "saints", label: "Santos e Virtudes" }
  ];

  const timeOptions = [
    { value: "5-10", label: "5-10 minutos", icon: "⏱️" },
    { value: "15-20", label: "15-20 minutos", icon: "⏰" },
    { value: "30+", label: "30 minutos ou mais", icon: "🕐" }
  ];

  const handleInterestToggle = (value: string) => {
    setInterests(prev =>
      prev.includes(value)
        ? prev.filter(i => i !== value)
        : [...prev, value]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save setup data to localStorage
      localStorage.setItem("fides-setup", JSON.stringify({
        faithJourney,
        interests,
        timeAvailable,
        completedAt: new Date().toISOString()
      }));
      navigate("/login");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return faithJourney !== "";
      case 1:
        return true; // Optional step
      case 2:
        return timeAvailable !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 bg-card shadow-sm z-10">
        <Progress value={progress} className="h-1 rounded-none" />
        <div className="px-6 py-4">
          <p className="text-sm text-muted-foreground font-body">
            Etapa {currentStep + 1} de {totalSteps}
          </p>
        </div>
      </div>

      <div className="pt-20 pb-6 px-6 max-w-2xl mx-auto animate-fade-in">
        {/* Step 1: Faith Journey */}
        {currentStep === 0 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-primary">
                Onde você está na sua jornada de fé?
              </h2>
              <p className="text-muted-foreground font-body">
                Isso nos ajuda a personalizar seu conteúdo
              </p>
            </div>

            <RadioGroup value={faithJourney} onValueChange={setFaithJourney}>
              <div className="space-y-3">
                {faithOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      faithJourney === option.value
                        ? "border-liturgical-gold bg-accent-light"
                        : "border-border hover:border-accent"
                    }`}
                    onClick={() => setFaithJourney(option.value)}
                  >
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer font-body text-base"
                    >
                      {option.label}
                    </Label>
                    {faithJourney === option.value && (
                      <Check className="h-5 w-5 text-liturgical-gold" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Step 2: Interests */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl md:text-3xl font-heading font-semibold text-primary">
                  Quais temas mais te interessam?
                </h2>
                <Button
                  variant="ghost"
                  onClick={handleNext}
                  className="text-muted-foreground hover:text-primary"
                >
                  Pular
                </Button>
              </div>
              <p className="text-muted-foreground font-body">
                Selecione quantos quiser
              </p>
            </div>

            <div className="space-y-3">
              {interestOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    interests.includes(option.value)
                      ? "border-liturgical-gold bg-accent-light"
                      : "border-border hover:border-accent"
                  }`}
                  onClick={() => handleInterestToggle(option.value)}
                >
                  <Checkbox
                    id={option.value}
                    checked={interests.includes(option.value)}
                    onCheckedChange={() => handleInterestToggle(option.value)}
                  />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-body text-base"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Time Available */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-primary">
                Quanto tempo você tem por dia?
              </h2>
              <p className="text-muted-foreground font-body">
                Vamos ajustar o conteúdo ao seu ritmo
              </p>
            </div>

            <div className="grid gap-4">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer text-center ${
                    timeAvailable === option.value
                      ? "border-liturgical-gold bg-accent-light"
                      : "border-border hover:border-accent"
                  }`}
                  onClick={() => setTimeAvailable(option.value)}
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <p className="font-body text-lg font-medium">{option.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Notifications */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-primary">
                Quando gostaria de receber lembretes?
              </h2>
              <p className="text-muted-foreground font-body">
                Você pode alterar depois
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-medium">Liturgia diária</p>
                    <p className="text-sm text-muted-foreground">Leituras do dia</p>
                  </div>
                  <input
                    type="time"
                    defaultValue="07:00"
                    className="px-3 py-2 border rounded-lg font-body"
                  />
                </div>
              </div>

              <div className="p-6 rounded-xl border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-medium">Plano de estudos</p>
                    <p className="text-sm text-muted-foreground">Lição do dia</p>
                  </div>
                  <input
                    type="time"
                    defaultValue="20:00"
                    className="px-3 py-2 border rounded-lg font-body"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-accent-light border border-accent/20">
                <p className="text-sm text-accent-foreground font-body">
                  🔔 As notificações ajudam você a manter consistência na jornada de fé
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Voltar
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {currentStep === totalSteps - 1 ? "Finalizar configuração" : "Continuar"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
