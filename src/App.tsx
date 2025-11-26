import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy load dashboard and auth pages to reduce initial bundle size
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardPrograms = lazy(() => import("./pages/DashboardPrograms"));
const DashboardClasses = lazy(() => import("./pages/DashboardClasses"));
const DashboardExercises = lazy(() => import("./pages/DashboardExercises"));
const DashboardAssignments = lazy(() => import("./pages/DashboardAssignments"));
const DashboardUsers = lazy(() => import("./pages/DashboardUsers"));
const DashboardProfile = lazy(() => import("./pages/DashboardProfile"));
const AssignmentDetail = lazy(() => import("./pages/AssignmentDetail"));
const ClassDetail = lazy(() => import("./pages/ClassDetail"));
const PublicProgram = lazy(() => import("./pages/PublicProgram"));

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
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
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
            <Route path="/dashboard/users" element={<DashboardUsers />} />
            <Route path="/dashboard/profile" element={<DashboardProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
