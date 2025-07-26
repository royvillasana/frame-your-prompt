import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import Generator from "./pages/Generator";
import Library from "./pages/Library";
import Pricing from "./pages/Pricing";
import Learn from "./pages/Learn";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Chat from "./pages/Chat";
import PromptLibrary from "./pages/PromptLibrary";
import ProjectDetail from "./pages/ProjectDetail";
import PromptDetail from "./pages/PromptDetail";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generator" element={<Generator />} />
                <Route path="/library" element={<Library />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/prompt-library" element={<PromptLibrary />} />
                <Route path="/project/:projectId" element={<ProjectDetail />} />
                <Route path="/prompt/:promptId" element={<PromptDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
