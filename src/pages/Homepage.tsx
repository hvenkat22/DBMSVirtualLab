import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Database, BookOpen, Code2, Layout, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Homepage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const [user, setUser] = useState(localStorage.getItem("user"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem("user"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", { method: "POST" });
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full bg-indigo-600 text-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="w-8 h-8" />
              <span className="font-bold text-xl">DBMS Virtual Lab</span>
            </Link>
            <div className="flex space-x-8 items-center">
              <Link
                to="/"
                className={`hover:text-indigo-200 transition ${
                  isActive("/") ? "text-indigo-200" : ""
                }`}
              >
                Home
              </Link>
              {user && (
                <>
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
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-red-600 px-3 py-2 rounded-md text-white hover:bg-red-700 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-grow mt-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-indigo-600 mb-6">
            Welcome to DBMS Virtual Lab
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            {user ? `Hello, ${user}! Explore DBMS below.` : "Please log in to access content."}
          </p>
          {!user ? (
            <>
              <Link to="/login" className="px-6 py-3 bg-green-600 text-white rounded-lg mr-3">
                Login
              </Link>
              <Link to="/register" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/theory" className="px-6 py-3 bg-indigo-600 text-white rounded-lg mr-3">
                Learn Theory
              </Link>
              <Link to="/practice" className="px-6 py-3 bg-indigo-600 text-white rounded-lg mr-3">
                Practice Problems
              </Link>
              <Link to="/playground" className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
                Explore Playground
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
