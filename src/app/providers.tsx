import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppDataProvider>
        {children}
      </AppDataProvider>
    </AuthProvider>
  );
}

export default Providers;