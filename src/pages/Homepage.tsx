import { Link } from 'react-router-dom';

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-indigo-600 mb-6">Welcome to DBMS Virtual Lab</h1>
        <p className="text-xl text-gray-700 mb-8">
          Explore the world of Database Management Systems with interactive theory, practice, and a playground.
        </p>
        <div className="space-x-4">
          <Link
            to="/theory"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Learn Theory
          </Link>
          <Link
            to="/practice"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Practice Queries
          </Link>
          <Link
            to="/playground"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Explore Playground
          </Link>
        </div>
      </div>
    </div>
  );
}