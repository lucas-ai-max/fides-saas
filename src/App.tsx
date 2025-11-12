import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Onboarding from "./pages/Onboarding";
import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Catechist from "./pages/Catechist";
import Prayers from "./pages/Prayers";
import PrayerDetail from "./pages/PrayerDetail";
import PrayNow from "./pages/PrayNow";
import ExameConsciencia from "./pages/ExameConsciencia";
import RealizarExame from "./pages/RealizarExame";
import ExameConclusao from "./pages/ExameConclusao";
import Igrejas from "./pages/Igrejas";
import IgrejasProximas from "./pages/IgrejasProximas";
import NotFound from "./pages/NotFound";
import LiturgiaDiaria from "./pages/LiturgiaDiaria";
import SantoDoDia from "./pages/SantoDoDia";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/onboarding" replace />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/catechist" element={<Catechist />} />
          <Route path="/liturgy" element={<LiturgiaDiaria />} />
          <Route path="/santo" element={<SantoDoDia />} />
          <Route path="/plans" element={<div className="p-6 text-center font-heading text-xl">Planos (Em breve)</div>} />
          <Route path="/prayers" element={<Prayers />} />
          <Route path="/prayers/:id" element={<PrayerDetail />} />
          <Route path="/pray/:id" element={<PrayNow />} />
          <Route path="/churches" element={<Igrejas />} />
          <Route path="/igrejas-proximas" element={<IgrejasProximas />} />
          <Route path="/examination" element={<ExameConsciencia />} />
          <Route path="/examination/realizar" element={<RealizarExame />} />
          <Route path="/examination/conclusao" element={<ExameConclusao />} />
          <Route path="/library" element={<div className="p-6 text-center font-heading text-xl">Biblioteca (Em breve)</div>} />
          <Route path="/profile" element={<div className="p-6 text-center font-heading text-xl">Perfil (Em breve)</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
