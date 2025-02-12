import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Homepage() {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem("user")); // Update user state when storage changes
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
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
  );
}
