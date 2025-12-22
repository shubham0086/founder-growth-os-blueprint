import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Research from "./pages/Research";
import OfferBlueprint from "./pages/OfferBlueprint";
import LandingPages from "./pages/LandingPages";
import Assets from "./pages/Assets";
import Campaigns from "./pages/Campaigns";
import Leads from "./pages/Leads";
import Automations from "./pages/Automations";
import Experiments from "./pages/Experiments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper component for pages that need the layout
const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <AppLayout>{children}</AppLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/research" element={<WithLayout><Research /></WithLayout>} />
          <Route path="/offer" element={<WithLayout><OfferBlueprint /></WithLayout>} />
          <Route path="/landing-pages" element={<WithLayout><LandingPages /></WithLayout>} />
          <Route path="/assets" element={<WithLayout><Assets /></WithLayout>} />
          <Route path="/campaigns" element={<WithLayout><Campaigns /></WithLayout>} />
          <Route path="/leads" element={<WithLayout><Leads /></WithLayout>} />
          <Route path="/automations" element={<WithLayout><Automations /></WithLayout>} />
          <Route path="/experiments" element={<WithLayout><Experiments /></WithLayout>} />
          <Route path="/reports" element={<WithLayout><Reports /></WithLayout>} />
          <Route path="/settings" element={<WithLayout><Settings /></WithLayout>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
