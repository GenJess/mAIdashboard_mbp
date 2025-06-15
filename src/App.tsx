import React from 'react';
import { useAuth } from './hooks/useAuth';
import { useBusiness } from './hooks/useBusiness';
import AuthForm from './components/AuthForm';
import BusinessSetup from './components/BusinessSetup';
import Dashboard from './components/Dashboard';
import DemoPage from './components/DemoPage';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  // Check if we're on the demo route
  const isDemo = window.location.pathname === '/demo' || window.location.hash === '#demo';

  // If it's demo mode, show the demo page
  if (isDemo) {
    return <DemoPage />;
  }

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (!business) {
    return <BusinessSetup />;
  }

  return <Dashboard business={business} />;
}

export default App;