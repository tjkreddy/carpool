import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initializeDemoUser, initializeDemoData } from '@/lib/storage';
import AuthGuard from '@/components/auth/AuthGuard';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import SearchRides from '@/pages/SearchRides';
import MyRides from '@/pages/MyRides';
import CreateRide from '@/pages/CreateRide';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Initialize demo data
initializeDemoUser();
initializeDemoData();

/**
 * The root component of the application.
 * It sets up the query client, tooltip provider, toaster, and router.
 * It also initializes demo data and wraps the application with an authentication guard.
 * @returns The rendered application component.
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<SearchRides />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/create-ride" element={<CreateRide />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;