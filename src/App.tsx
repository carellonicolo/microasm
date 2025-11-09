import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import DashboardPrograms from "./pages/DashboardPrograms";
import DashboardClasses from "./pages/DashboardClasses";
import DashboardExercises from "./pages/DashboardExercises";
import DashboardAssignments from "./pages/DashboardAssignments";
import AssignmentDetail from "./pages/AssignmentDetail";
import ClassDetail from "./pages/ClassDetail";
import PublicProgram from "./pages/PublicProgram";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/p/:token" element={<PublicProgram />} />
            <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/programs" element={<DashboardPrograms />} />
          <Route path="/dashboard/classes" element={<DashboardClasses />} />
          <Route path="/dashboard/classes/:classId" element={<ClassDetail />} />
          <Route path="/dashboard/assignments" element={<DashboardAssignments />} />
          <Route path="/dashboard/assignments/:assignmentId" element={<AssignmentDetail />} />
          <Route path="/dashboard/exercises" element={<DashboardExercises />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
