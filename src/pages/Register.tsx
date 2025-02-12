import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "lucide-react";
import { Link } from "react-router-dom";


export default function Register() {
  const isActive = (path) => location.pathname === path;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [reg_no, setReg_no] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleRegister = async () => {
    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, reg_no, institution, name }),
    });

    const data = await response.json();
    if (response.ok) {
      navigate("/login");
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
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Register</h2>
        <input type="text" placeholder="Name" value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="text" placeholder="Reg No" value={reg_no}
          onChange={(e) => setReg_no(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="text" placeholder="Institution" value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-3" />
        <button onClick={handleRegister}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Register
        </button>
      </div>
    </div>
    </>
  );
}
