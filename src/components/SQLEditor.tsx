import { useState } from 'react';
import { Play, Trash2 } from 'lucide-react';

interface Props {
  query: string;
  setQuery: (val: string) => void;
  onExecute: (query: string) => void;
  placeholder?: string;
}

export default function SQLEditor({ query, setQuery, onExecute, placeholder }: Props) {
  return (
    <div className="relative border border-gray-700 rounded-lg">
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || 'Enter your SQL query here...'}
          className="w-full h-40 p-4 bg-gray-800 text-white font-mono rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setQuery('')}
            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => onExecute(query)}
            className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition"
          >
            <Play className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}