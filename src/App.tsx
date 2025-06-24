
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import StravaTokens from "./pages/StravaTokens";
import StravaCallback from "./pages/StravaCallback";
import AddRun from "./pages/AddRun";
import ImportRuns from "./pages/ImportRuns";
import Secreto from "./pages/Secreto";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/add-run" element={<AddRun />} />
            <Route path="/import-runs" element={<ImportRuns />} />
            <Route path="/secreto" element={<Secreto />} />
            <Route path="/strava-tokens" element={<StravaTokens />} />
            <Route path="/strava/callback" element={<StravaCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
