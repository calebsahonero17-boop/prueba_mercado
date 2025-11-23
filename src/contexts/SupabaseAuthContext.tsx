import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthActions, RegisterData, AuthUser } from '../types/product';
import { supabase } from '../lib/supabase';

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTH_USER'; payload: AuthUser | null }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case 'SET_AUTH_USER':
      return {
        ...state,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
}

// Validation functions
const validateCI = (ci: string): boolean => {
  // Basic CI boliviano validation (7-8 digits)
  const ciRegex = /^\d{7,8}$/;
  return ciRegex.test(ci.replace(/\s/g, ''));
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Basic Bolivia phone validation (7-8 digits, optionally with country code)
  const phoneRegex = /^(\+591)?[67]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Context
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // Cargar perfil de usuario desde Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: perfiles, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId);

      console.log(`DEBUG: Búsqueda de perfil para ${userId} encontró ${perfiles?.length ?? 0} resultados.`);

      if (error) {
        console.error('Error al cargar perfil de usuario en loadUserProfile para userId:', userId, 'Error:', error.message);
        return null;
      }
      
      if (perfiles && perfiles.length > 1) {
        console.error(`¡ERROR CRÍTICO! Se encontraron ${perfiles.length} perfiles duplicados para el id ${userId}. Usando el primero.`);
        return perfiles[0];
      }

      if (perfiles && perfiles.length === 1) {
        return perfiles[0];
      }
      
      return null;

    } catch (error: any) {
      console.error('Excepción al cargar perfil de usuario en loadUserProfile para userId:', userId, 'Excepción:', error.message);
      return null;
    }
  };

  // --- Lógica de Acciones --- 
  // Se definen aquí para que puedan llamarse entre sí si es necesario

  const logoutAction = async () => {
    dispatch({ type: 'LOGOUT' });
    await supabase.auth.signOut();
  };

  const loginAction = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        let errorMessage = 'Error de autenticación.';
        if (error.message.includes('invalid login credentials')) {
          errorMessage = 'Credenciales incorrectas.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Problema de conexión.';
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: false, message: errorMessage };
      }

      if (data.user) {
        const profile = await loadUserProfile(data.user.id);
        dispatch({ type: 'SET_USER', payload: profile });

        return { success: true, message: 'Inicio de sesión exitoso.' };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: 'Error desconocido.' };

    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, message: error.message || 'Error de conexión.' };
    }
  };

  const refreshUser = async () => {
    if (state.user?.id) {
      dispatch({ type: 'SET_LOADING', payload: true });
      const profile = await loadUserProfile(state.user.id);
      dispatch({ type: 'SET_USER', payload: profile });
    }
  };

  // --- Fin Lógica de Acciones ---


  useEffect(() => {
    // Timeout de seguridad para la carga inicial
    const safetyTimeout = setTimeout(() => {
      if (isInitialLoad) {
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsInitialLoad(false);
      }
    }, 10000); // 10 segundos

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('checkSession result - session:', session, 'error:', error); // TEMP LOG

        if (error) {
            console.error('Error al obtener sesión en checkSession:', error);
            // Si el error es específicamente por refresh token inválido, forzar logout y redirigir
            if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
                console.warn('Refresh Token inválido o no encontrado, forzando logout y redirigiendo a /iniciar-sesion');
                await logoutAction(); // Forzar el logout a nivel de Supabase y limpiar estado
                // No podemos usar `navigate` directamente aquí ya que no es un componente
                // La redirección será manejada por los ProtectedRoutes o el usuario deberá volver
                // manualmente a /iniciar-sesion
            }
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          // SET_USER también pone loading en false
          dispatch({ type: 'SET_USER', payload: profile });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Excepción verificando sesión en checkSession:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      } finally {
        clearTimeout(safetyTimeout);
        setIsInitialLoad(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
            loadUserProfile(session.user.id).then(profile => {
                dispatch({ type: 'SET_USER', payload: profile });
            });
        } else {
            dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const actions: AuthActions = {
    login: loginAction,
    logout: logoutAction,
    refreshUser: refreshUser, // Añadir refreshUser a las acciones
    // El resto de las acciones complejas de register, updateProfile, etc. se mantienen igual
    // pero sin usar el cliente optimizado.
    register: async (userData: RegisterData): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (userData.password !== userData.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: { 
              nombres: userData.nombres, 
              apellidos: userData.apellidos,
              carnet_identidad: userData.carnet_identidad,
              telefono: userData.telefono,
              ciudad: userData.ciudad,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            throw new Error('Este email ya está registrado. Por favor, inicia sesión o usa otro email.');
          }
          throw signUpError;
        }

        if (data.user) {
          const { data: existingProfile, error: fetchProfileError } = await supabase
            .from('perfiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (fetchProfileError && fetchProfileError.code !== 'PGRST116') { // PGRST116: no rows found
            await supabase.auth.signOut();
            throw new Error('Error al verificar perfil existente: ' + fetchProfileError.message);
          }

          let profileOperationError = null;

          if (existingProfile) {
            const { error } = await supabase.from('perfiles').update({
              email: data.user.email,
              nombres: userData.nombres,
              apellidos: userData.apellidos,
              telefono: userData.telefono,
              carnet_identidad: userData.carnet_identidad,
              ciudad: userData.ciudad,
            }).eq('id', data.user.id);
            profileOperationError = error;
          } else {
            const { error } = await supabase.from('perfiles').insert({
              id: data.user.id,
              email: data.user.email,
              nombres: userData.nombres,
              apellidos: userData.apellidos,
              telefono: userData.telefono,
              carnet_identidad: userData.carnet_identidad,
              ciudad: userData.ciudad,
              rol: 'usuario',
              avatar: null,
            });
            profileOperationError = error;
          }

          if (profileOperationError) {
            await supabase.auth.signOut();
            throw new Error('Error al crear/actualizar el perfil: ' + profileOperationError.message);
          }

          // Perfil creado/actualizado exitosamente.
          // Ahora, cargamos el perfil real desde la base de datos para asegurar consistencia
          // y evitar race conditions con onAuthStateChange.
          const newProfile = await loadUserProfile(data.user.id);
          dispatch({ type: 'SET_USER', payload: newProfile });

        } else {
          throw new Error('Registro fallido: No se pudo crear el usuario.');
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } catch (error: any) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw error;
      }
    },
    updateProfile: async (userData: Partial<User>) => {
      if (!state.user) throw new Error("No hay un usuario para actualizar.");
      
      const optimisticUser = { ...state.user, ...userData };
      dispatch({ type: 'SET_USER', payload: optimisticUser });

      try {
        console.log('DEBUG: Intentando actualizar perfil con datos:', userData);
        console.log('DEBUG: Para el usuario con ID:', state.user.id);
        
        const { data, error } = await supabase
          .from('perfiles')
          .update(userData)
          .eq('id', state.user.id)
          .select();

        console.log('DEBUG: Resultado de la operación de update:', { data, error });

        if (error) {
          console.error('ERROR DETALLADO en updateProfile:', JSON.stringify(error, null, 2));
          dispatch({ type: 'SET_USER', payload: state.user }); // Revertir
          throw error;
        }

        // Forzar la recarga del perfil desde la base de datos para asegurar que el contexto esté actualizado
        const updatedProfile = await loadUserProfile(state.user.id);
        dispatch({ type: 'SET_USER', payload: updatedProfile });
        return true;
      } catch (error: any) {
        dispatch({ type: 'SET_USER', payload: state.user }); // Revertir en caso de excepción
        throw new Error(error.message || 'Error al actualizar el perfil');
      }
    },
    // Las funciones de debugging se han omitido por simplicidad y para evitar errores
    clearAllSessions: async () => { await logoutAction(); window.location.reload(); },
    forceStopLoading: () => dispatch({ type: 'SET_LOADING', payload: false }),
    emergencyReset: () => { logoutAction(); localStorage.clear(); sessionStorage.clear(); },
    testSupabaseConnection: async () => {
        const { data, error } = await supabase.from('perfiles').select('id').limit(1);
        return !error;
    },
    enableDemoMode: () => { /* Lógica de modo demo omitida */ },
  };

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}