import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AuthProvider } from "@/lib/authContext";
import { ModalProvider } from "@/lib/modalContext";
import Modals from "@/components/layout/Modals";
import { useState } from "react";
import { HistoryItem } from "@/types";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // State for history items
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  // Function to clear all history data
  const clearAllData = () => {
    setHistoryItems([]);
    // Could also clear localStorage or other stored data here
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <Router />
          <Modals clearAllData={clearAllData} />
          <Toaster />
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
