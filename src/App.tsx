import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Setup from "./pages/Setup";
import Home from "./pages/Home";
import Catechist from "./pages/Catechist";
import Prayers from "./pages/Prayers";
import PrayerDetail from "./pages/PrayerDetail";
import PrayNow from "./pages/PrayNow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/liturgy" element={<div className="p-6 text-center font-heading text-xl">Liturgia (Em breve)</div>} />
          <Route path="/plans" element={<div className="p-6 text-center font-heading text-xl">Planos (Em breve)</div>} />
          <Route path="/prayers" element={<Prayers />} />
          <Route path="/prayers/:id" element={<PrayerDetail />} />
          <Route path="/pray/:id" element={<PrayNow />} />
          <Route path="/churches" element={<div className="p-6 text-center font-heading text-xl">Igrejas (Em breve)</div>} />
          <Route path="/examination" element={<div className="p-6 text-center font-heading text-xl">Exame (Em breve)</div>} />
          <Route path="/library" element={<div className="p-6 text-center font-heading text-xl">Biblioteca (Em breve)</div>} />
          <Route path="/profile" element={<div className="p-6 text-center font-heading text-xl">Perfil (Em breve)</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
