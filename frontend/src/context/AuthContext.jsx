import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem("token");
      const name  = localStorage.getItem("name");
      const role  = localStorage.getItem("role");
      return token && token !== "null" && token !== "undefined" && name && role
        ? { token, name, role }
        : null;
    } catch {
      return null;
    }
  });

  const login = ({ token, name, role }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    localStorage.setItem("role", role);
    setUser({ token, name, role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    // Clear session tracking on logout but PRESERVE quiz progress for resume
    sessionStorage.removeItem("lastPage");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
