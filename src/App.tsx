import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Catechist from "./pages/Catechist";
import Prayers from "./pages/Prayers";
import PrayerDetail from "./pages/PrayerDetail";
import PrayNow from "./pages/PrayNow";
import ExameConsciencia from "./pages/ExameConsciencia";
import RealizarExame from "./pages/RealizarExame";
import ExameConclusao from "./pages/ExameConclusao";
import NotFound from "./pages/NotFound";
import LiturgiaDiaria from "./pages/LiturgiaDiaria";
import SantoDoDia from "./pages/SantoDoDia";
import Profile from "./pages/Profile";
import Library from "./pages/Library";
import Intentions from "./pages/Intentions";
import Learn from "./pages/Learn";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <PageTransition><Home /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catechist"
                element={
                  <ProtectedRoute>
                    <PageTransition><Catechist /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/liturgy"
                element={
                  <ProtectedRoute>
                    <LiturgiaDiaria />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/santo"
                element={
                  <ProtectedRoute>
                    <SantoDoDia />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/plans"
                element={
                  <ProtectedRoute>
                    <div className="p-6 text-center font-heading text-xl">Planos (Em breve)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prayers"
                element={
                  <ProtectedRoute>
                    <PageTransition><Prayers /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prayers/:id"
                element={
                  <ProtectedRoute>
                    <PageTransition><PrayerDetail /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pray/:id"
                element={
                  <ProtectedRoute>
                    <PrayNow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/examination"
                element={
                  <ProtectedRoute>
                    <ExameConsciencia />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/examination/realizar"
                element={
                  <ProtectedRoute>
                    <RealizarExame />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/examination/conclusao"
                element={
                  <ProtectedRoute>
                    <ExameConclusao />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PageTransition><Profile /></PageTransition>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intentions"
                element={
                  <ProtectedRoute>
                    <Intentions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learn"
                element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
