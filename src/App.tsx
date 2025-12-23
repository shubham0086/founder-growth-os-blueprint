import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { TutorialProvider, TutorialOverlay, TutorialTrigger } from "@/components/tutorial";
import { AppLayout } from "@/components/layout/AppLayout";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import Auth from "./pages/Auth";
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
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Documentation from "./pages/Documentation";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Set your GA4 Measurement ID here (e.g., "G-XXXXXXXXXX")
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || "";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Wrapper component for pages that need the layout
const WithLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppLayout>
      {children}
      <TutorialTrigger />
      <TutorialOverlay />
    </AppLayout>
  </ProtectedRoute>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<WithLayout><Dashboard /></WithLayout>} />
    <Route path="/research" element={<WithLayout><Research /></WithLayout>} />
    <Route path="/offer" element={<WithLayout><OfferBlueprint /></WithLayout>} />
    <Route path="/landing-pages" element={<WithLayout><LandingPages /></WithLayout>} />
    <Route path="/assets" element={<WithLayout><Assets /></WithLayout>} />
    <Route path="/campaigns" element={<WithLayout><Campaigns /></WithLayout>} />
    <Route path="/leads" element={<WithLayout><Leads /></WithLayout>} />
    <Route path="/automations" element={<WithLayout><Automations /></WithLayout>} />
    <Route path="/experiments" element={<WithLayout><Experiments /></WithLayout>} />
    <Route path="/reports" element={<WithLayout><Reports /></WithLayout>} />
    <Route path="/analytics" element={<WithLayout><Analytics /></WithLayout>} />
    <Route path="/settings" element={<WithLayout><Settings /></WithLayout>} />
    <Route path="/docs" element={<WithLayout><Documentation /></WithLayout>} />
    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
        <AuthProvider>
          <WorkspaceProvider>
            <TutorialProvider>
              <AppRoutes />
            </TutorialProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
