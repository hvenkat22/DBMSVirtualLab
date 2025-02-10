import { Database, BookOpen, Code2, Layout } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full bg-indigo-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Database className="w-8 h-8" />
            <span className="font-bold text-xl">DBMS Virtual Lab</span>
          </Link>

          <div className="flex space-x-8">
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
          </div>
        </div>
      </div>
    </nav>
  );
}
