import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Cross, Users, BookOpen } from "lucide-react";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      icon: <Cross className="w-24 h-24 text-liturgical-gold" strokeWidth={1.5} />,
      title: "Sua Fé, Guiada pela Sabedoria da Igreja",
      subtitle: "Aprenda, cresça e aprofunde-se na fé católica com orientação personalizada"
    },
    {
      icon: <Users className="w-24 h-24 text-liturgical-gold" strokeWidth={1.5} />,
      title: "Converse com a Sabedoria dos Santos",
      subtitle: "Tire dúvidas com IA treinada no Catecismo, Escrituras e Doutores da Igreja"
    },
    {
      icon: <BookOpen className="w-24 h-24 text-liturgical-gold" strokeWidth={1.5} />,
      title: "Cresça no Seu Ritmo",
      subtitle: "Planos personalizados, liturgia diária e orações guiadas"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/setup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-stone-gray flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-12">
        {/* Icon */}
        <div className="animate-scale-in">
          {steps[currentStep].icon}
        </div>

        {/* Content */}
        <div className="space-y-4 animate-slide-up">
          <h1 className="text-4xl font-heading font-semibold text-primary leading-tight">
            {steps[currentStep].title}
          </h1>
          <p className="text-lg text-muted-foreground font-body leading-relaxed">
            {steps[currentStep].subtitle}
          </p>
        </div>

        {/* Page Indicators */}
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "w-8 bg-liturgical-gold"
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base rounded-xl h-14 shadow-md hover:shadow-lg transition-all duration-300"
        >
          {currentStep < steps.length - 1 ? "Próximo" : "Começar minha jornada"}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
