import { Loader2 } from "lucide-react";
import { Dashboard } from "./pages/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

export function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f8f9]">
        <Loader2 className="h-8 w-8 animate-spin text-ocean" />
      </main>
    );
  }

  return token ? <Dashboard /> : <LoginPage />;
}
