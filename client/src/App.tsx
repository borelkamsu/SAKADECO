import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Crea from "@/pages/Crea";
import Rent from "@/pages/Rent";
import Events from "@/pages/Events";
import SKDHome from "@/pages/SKDHome";
import Co from "@/pages/Co";
import Checkout from "@/pages/Checkout";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import Themes from "@/pages/Themes";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't wait for authentication - show content immediately
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/crea" component={Crea} />
      <Route path="/rent" component={Rent} />
      <Route path="/events" component={Events} />
      <Route path="/home" component={SKDHome} />
      <Route path="/co" component={Co} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/themes" component={Themes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
