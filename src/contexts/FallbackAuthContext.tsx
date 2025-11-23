import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, AuthActions, RegisterData } from '../types/product';

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false, // Cambiado a false para evitar loading infinito
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

// Utility functions for localStorage (fallback)
const STORAGE_KEYS = {
  USER: 'mercado_express_user',
  USERS_DB: 'mercado_express_users',
};

const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

const getUser = (): User | null => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
};

const getUsersDB = (): User[] => {
  try {
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS_DB);
    return usersData ? JSON.parse(usersData) : [];
  } catch (error) {
    console.error('Error parsing users database:', error);
    return [];
  }
};

const saveUsersDB = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
};

// Context
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function FallbackAuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    console.log('Loading user from localStorage...');
    const user = getUser();
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const actions: AuthActions = {
    login: async (email: string, password: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const users = getUsersDB();
      const user = users.find(u => u.nombres + '@test.com' === email); // Simulación simple

      if (user && password.length >= 6) {
        saveUser(user);
        dispatch({ type: 'SET_USER', payload: user });
        return true;
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    },

    register: async (userData: RegisterData): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const users = getUsersDB();

      // Check if user already exists
      if (users.find(u => u.nombres + '@test.com' === userData.email)) {
        dispatch({ type: 'SET_LOADING', payload: false });
        throw new Error('Ya existe una cuenta con este email');
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        telefono: userData.telefono,
        carnet_identidad: userData.carnet_identidad,
        ciudad: userData.ciudad,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        avatar: `${userData.nombres.charAt(0)}${userData.apellidos.charAt(0)}`.toUpperCase(),
      };

      // Save to "database"
      users.push(newUser);
      saveUsersDB(users);

      // Auto login after registration
      saveUser(newUser);
      dispatch({ type: 'SET_USER', payload: newUser });

      return true;
    },

    logout: () => {
      saveUser(null);
      dispatch({ type: 'LOGOUT' });
    },

    updateProfile: (userData: Partial<User>) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          ...userData,
          fecha_actualizacion: new Date().toISOString()
        };

        // Update in users database
        const users = getUsersDB();
        const userIndex = users.findIndex(u => u.id === state.user!.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          saveUsersDB(users);
        }

        // Update current user
        saveUser(updatedUser);
        dispatch({ type: 'SET_USER', payload: updatedUser });
      }
    },
  };

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useFallbackAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFallbackAuth must be used within a FallbackAuthProvider');
  }
  return context;
}