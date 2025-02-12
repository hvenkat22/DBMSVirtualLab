import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";



export default function Login() {
  const isActive = (path) => location.pathname === path;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log(data);
    if (response.ok) {
      localStorage.setItem("user", data.user);
      navigate("/");
    } else {
      alert(data.error);
    }
  };

  return (
    <>
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
            </div>
          </div>
         </div>
      </nav>
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Login</h2>
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <button onClick={handleLogin}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Login
        </button>
      </div>
    </div>
    </>
  );
}
