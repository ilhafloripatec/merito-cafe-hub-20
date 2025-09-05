// src/hooks/useAuth.tsx
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  is_admin: boolean; // agora buscamos is_admin direto
  created_at: string;
  role: "admin" | "authenticated"; // campo virtual
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Busca o perfil do usuário no Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, is_admin, created_at")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("⚠️ Perfil não encontrado:", error.message);
        setProfile(null);
        return;
      }

      if (data) {
        const profileWithRole: Profile = {
          ...data,
          role: data.is_admin ? "admin" : "authenticated", // 🔑 campo virtual
        };
        console.log("✅ Perfil carregado:", profileWithRole);
        setProfile(profileWithRole);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar perfil:", err);
      setProfile(null);
    }
  }, []);

  // 🔹 Checa a sessão inicial e escuta mudanças
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 Verificando sessão inicial...");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erro ao obter sessão inicial:", error.message);
      }

      handleSessionChange(data.session ?? null);
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("📡 onAuthStateChange event:", event, "session:", session);
        handleSessionChange(session);
      }
    );

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // 🔹 Função central para lidar com mudanças de sessão
  const handleSessionChange = async (session: Session | null) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setProfile(null); // reseta antes de buscar novamente

    if (currentUser) {
      console.log("👤 Usuário logado:", currentUser.email);
      await fetchProfile(currentUser.id);
    } else {
      console.log("🚪 Usuário deslogado");
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin", // 🔑 depende do profile do banco
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
