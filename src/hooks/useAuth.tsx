
// import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { User, Session } from '@supabase/supabase-js';
// import { toast } from '@/hooks/use-toast';

// interface Profile {
//   id: string;
//   name: string;
//   is_admin: boolean;
//   created_at: string;
// }

// export function useAuth() {
//   const [user, setUser] = useState<User | null>(null);
//   const [session, setSession] = useState<Session | null>(null);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log('[Auth] Inicializando useAuth hook');
    
//     // Set up the auth state listener FIRST
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log('[Auth] Auth state changed:', event, session?.user?.id);
      
//       setSession(session);
//       setUser(session?.user ?? null);
      
//       if (session?.user) {
//         // Use setTimeout to prevent potential deadlocks
//         setTimeout(() => {
//           fetchProfile(session.user.id);
//         }, 0);
//       } else {
//         setProfile(null);
//         setLoading(false);
//       }
//     });

//     // THEN check for existing session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       console.log('[Auth] Sessão inicial encontrada:', session?.user?.id);
//       setSession(session);
//       setUser(session?.user ?? null);
      
//       if (session?.user) {
//         fetchProfile(session.user.id);
//       } else {
//         setLoading(false);
//       }
//     });

//     return () => {
//       console.log('[Auth] Limpando subscription do useAuth');
//       subscription.unsubscribe();
//     };
//   }, []);

//   const fetchProfile = async (userId: string) => {
//     try {
//       console.log('[Auth] Buscando perfil para usuário:', userId);
      
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userId)
//         .single();

//       if (error) {
//         console.error('[Auth] Erro ao buscar perfil:', error);
//         throw error;
//       }
      
//       console.log('[Auth] Perfil encontrado:', data);
//       setProfile(data);
//     } catch (error) {
//       console.error('[Auth] Erro ao buscar perfil:', error);
//       // Se não conseguir buscar o perfil, não deve quebrar a aplicação
//       setProfile(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signUp = async (email: string, password: string, name: string) => {
//     try {
//       const redirectUrl = `${window.location.origin}/`;
      
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: redirectUrl,
//           data: {
//             name
//           }
//         }
//       });

//       if (error) throw error;

//       toast({
//         title: "Conta criada com sucesso!",
//         description: "Verifique seu email para confirmar a conta.",
//       });

//       return { data, error: null };
//     } catch (error: any) {
//       toast({
//         title: "Erro ao criar conta",
//         description: error.message,
//         variant: "destructive"
//       });
//       return { data: null, error };
//     }
//   };

//   const signIn = async (email: string, password: string) => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       });

//       if (error) throw error;

//       toast({
//         title: "Login realizado com sucesso!",
//         description: "Bem-vindo de volta!"
//       });

//       return { data, error: null };
//     } catch (error: any) {
//       toast({
//         title: "Erro no login",
//         description: error.message,
//         variant: "destructive"
//       });
//       return { data: null, error };
//     }
//   };

//   const signOut = async () => {
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;

//       // Limpar estados locais
//       setUser(null);
//       setSession(null);
//       setProfile(null);

//       toast({
//         title: "Logout realizado com sucesso!",
//         description: "Até logo!"
//       });
//     } catch (error: any) {
//       toast({
//         title: "Erro no logout",
//         description: error.message,
//         variant: "destructive"
//       });
//     }
//   };

//   const isAdmin = profile?.is_admin || false;

//   // Debug logs para ajudar a identificar problemas
//   useEffect(() => {
//     console.log('[Auth] Estado atual:', {
//       user: user?.id,
//       session: session?.access_token ? 'presente' : 'ausente',
//       profile: profile?.id,
//       isAdmin,
//       loading
//     });
//   }, [user, session, profile, isAdmin, loading]);

//   return {
//     user,
//     session,
//     profile,
//     loading,
//     signUp,
//     signIn,
//     signOut,
//     isAdmin
//   };
// }
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  is_admin: boolean;
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

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Perfil não encontrado para o usuário:', error.message);
        setProfile(null);
        return;
      };
      setProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
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
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!"
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
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
        description: "Até logo!"
      });
    } catch (error: any) {
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.is_admin ?? false,
    signIn,
    signUp,
    signOut,
  };

  // Renderiza os filhos apenas quando o loading inicial terminar
  return <AuthContext.Provider value={value}>{!loading ? children : null}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
