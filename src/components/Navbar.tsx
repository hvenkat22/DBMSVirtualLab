import { Database, BookOpen, Code2, Layout, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  user: string | null;
  setUser: (user: string | null) => void;
}

export default function Navbar({ user, setUser }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", { method: "POST" });
    localStorage.removeItem("user");
    setUser(null); // Update global state
    navigate("/"); // Redirect to homepage
  };

  return (
    <nav className="fixed w-full bg-indigo-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="w-8 h-8" />
            <span className="font-bold text-xl">DBMS Virtual Lab</span>
          </Link>

          {user ? (
            <div className="flex space-x-8 items-center">
              <Link
                to="/theory"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${
                  isActive("/theory") ? "text-indigo-200" : ""
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Theory</span>
              </Link>

              <Link
                to="/practice"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${
                  isActive("/practice") ? "text-indigo-200" : ""
                }`}
              >
                <Code2 className="w-5 h-5" />
                <span>Practice</span>
              </Link>

              <Link
                to="/playground"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${
                  isActive("/playground") ? "text-indigo-200" : ""
                }`}
              >
                <Layout className="w-5 h-5" />
                <span>Playground</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-600 px-3 py-2 rounded-md text-white hover:bg-red-700 transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
