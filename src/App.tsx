import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import KickTracker from "./pages/KickTracker";
import CheckIn from "./pages/CheckIn";
import MoodTracker from "./pages/MoodTracker";
import Profile from "./pages/Profile";
import FamilyDashboard from "./pages/FamilyDashboard";
import NotFound from "./pages/NotFound";
import { Heart } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><Heart className="w-8 h-8 text-primary animate-pulse-gentle" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/kicks" element={<ProtectedRoute><KickTracker /></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
        <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/family" element={<ProtectedRoute><FamilyDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <BottomNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
