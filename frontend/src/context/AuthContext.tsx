import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextValue {
  user: User | null;
  refreshUser: () => Promise<boolean>;
  clearUser: () => void;
}

const API_URL =
  import.meta.env.APP_API_URL ?? "http://localhost:3000";

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(
    async (): Promise<boolean> => {
      try {
        const response = await fetch(
          `${API_URL}/api/user/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUser(null);
          return false;
        }

        const data: { user: User } =
          await response.json();

        setUser(data.user);

        return true;
      } catch (error) {
        console.error(
          "Benutzer konnte nicht geladen werden:",
          error
        );

        setUser(null);

        return false;
      }
    },
    []
  );

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        refreshUser,
        clearUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth muss innerhalb von AuthProvider verwendet werden"
    );
  }

  return context;
}