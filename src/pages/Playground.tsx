import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Plus, X } from 'lucide-react';
import SQLEditor from '../components/SQLEditor';
import { Database, BookOpen, Code2, Layout, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import initSqlJs from 'sql.js';

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
}

interface Table {
  id: string;
  name: string;
  definition: string;
  columns: Column[];
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  fields?: string[];
}

export default function Playground() {
  const location = useLocation();
  const [storedUser, setUser] = useState(localStorage.getItem("user"));
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  
  // SQL.js states
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableDefinition, setNewTableDefinition] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  
  // Add the missing query state
  const [sqlQuery, setSqlQuery] = useState<string>('');

  // Initialize SQL.js
  useEffect(() => {
    async function initDB() {
      try {
        setLoading(true);
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        // Create a new database instance
        const newDb = new SQL.Database();
        setDb(newDb);
        
        // Try to load saved database from localStorage
        const savedDB = localStorage.getItem('sql_playground_db');
        if (savedDB) {
          try {
            const binaryArray = new Uint8Array(JSON.parse(savedDB));
            const restoredDb = new SQL.Database(binaryArray);
            setDb(restoredDb);
            refreshTablesList(restoredDb);
          } catch (err) {
            console.error("Failed to restore database:", err);
            // Continue with the new database if restoration fails
            refreshTablesList(newDb);
          }
        } else {
          refreshTablesList(newDb);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize SQL.js:", err);
        setLoading(false);
      }
    }
    
    initDB();
    
    return () => {
      // Clean up database when component unmounts
      if (db) {
        saveDatabase();
        db.close();
      }
    };
  }, []);

  // Save database to localStorage whenever tables are modified
  const saveDatabase = () => {
    if (!db) return;
    
    try {
      const binaryArray = db.export();
      const arrayToSave = Array.from(binaryArray);
      localStorage.setItem('sql_playground_db', JSON.stringify(arrayToSave));
    } catch (err) {
      console.error("Failed to save database:", err);
    }
  };

  // Refresh tables list from database
  const refreshTablesList = (database = db) => {
    if (!database) return;
    
    try {
      // Get all table names
      const tablesResult = database.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      
      if (tablesResult.length === 0 || !tablesResult[0].values) {
        setTables([]);
        return;
      }
      
      const tableNames = tablesResult[0].values.map(val => val[0].toString());
      
      // Get details for each table
      const tablesList = tableNames.map(tableName => {
        // Get table creation SQL
        const createSqlResult = database.exec(`SELECT sql FROM sqlite_master WHERE name='${tableName}'`);
        const definition = createSqlResult[0]?.values[0][0].toString() || '';
        
        // Get table columns
        const columnsResult = database.exec(`PRAGMA table_info('${tableName}')`);
        const columns = columnsResult[0]?.values.map(col => ({
          name: col[1].toString(),
          type: col[2].toString(),
          nullable: col[3] === 0,
          isPrimary: col[5] === 1
        })) || [];
        
        return {
          id: tableName,
          name: tableName,
          definition: definition,
          columns: columns
        };
      });
      
      setTables(tablesList);
      
      // If a table was previously selected, refresh its selection
      if (selectedTable) {
        const updatedTable = tablesList.find(t => t.name === selectedTable.name);
        if (updatedTable) {
          setSelectedTable(updatedTable);
          loadTableData(updatedTable.name);
        } else {
          setSelectedTable(null);
          setTableData([]);
        }
      }
    } catch (err) {
      console.error("Failed to refresh tables list:", err);
    }
  };

  // Load data for a selected table
  const loadTableData = (tableName) => {
    if (!db) return;
    
    try {
      const result = db.exec(`SELECT * FROM ${tableName}`);
      
      if (result.length === 0) {
        setTableData([]);
        return;
      }
      
      const columns = result[0].columns;
      const rows = result[0].values.map(row => {
        const rowObj = {};
        columns.forEach((col, idx) => {
          rowObj[col] = row[idx];
        });
        return rowObj;
      });
      
      setTableData(rows);
    } catch (err) {
      console.error(`Failed to load data for table ${tableName}:`, err);
      setTableData([]);
    }
  };

  // Handle table selection
  const handleSelectTable = (table) => {
    setSelectedTable(table);
    loadTableData(table.name);
  };

  // Execute SQL query
  const executeQuery = (sql) => {
    if (!db) {
      setQueryResult({
        success: false,
        error: "Database not initialized"
      });
      return;
    }
    
    try {
      setQueryHistory([...queryHistory, sql]);
      
      // Execute the query
      const result = db.exec(sql);
      
      // Handle statements that don't return data (CREATE, INSERT, UPDATE, DELETE)
      if (result.length === 0) {
        // Refresh the tables list if the query might have modified the schema
        if (sql.trim().toUpperCase().startsWith("CREATE") || 
            sql.trim().toUpperCase().startsWith("DROP") || 
            sql.trim().toUpperCase().startsWith("ALTER")) {
          refreshTablesList();
        }
        
        // Refresh data if the table is selected and the query might have modified its data
        if (selectedTable && 
           (sql.trim().toUpperCase().startsWith("INSERT") ||
            sql.trim().toUpperCase().startsWith("UPDATE") || 
            sql.trim().toUpperCase().startsWith("DELETE"))) {
          loadTableData(selectedTable.name);
        }
        
        setQueryResult({
          success: true,
          data: [],
          fields: [],
        });
        
        // Save database state after modification
        saveDatabase();
        return;
      }
      
      // Handle SELECT statements that return data
      const columns = result[0].columns;
      const rows = result[0].values.map(row => {
        const rowObj = {};
        columns.forEach((col, idx) => {
          rowObj[col] = row[idx];
        });
        return rowObj;
      });
      
      setQueryResult({
        success: true,
        data: rows,
        fields: columns
      });
      
    } catch (err) {
      console.error("Query execution error:", err);
      setQueryResult({
        success: false,
        error: err.message
      });
    }
  };

  // Handle creating a new table
  const handleCreateTable = () => {
    if (!db) {
      alert('Database not initialized');
      return;
    }
    
    try {
      // Execute CREATE TABLE statement
      db.exec(newTableDefinition);
      
      // Refresh tables list
      refreshTablesList();
      
      // Close modal and clear input
      setShowCreateModal(false);
      setNewTableDefinition('');
      
      // Save database state
      saveDatabase();
    } catch (err) {
      alert(`Error creating table: ${err.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("sql_playground_db");
    if (db) {
      db.close();
    }
    setUser(null);
    navigate("/");
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
            className={`hover:text-indigo-200 transition ${isActive("/") ? "text-indigo-200" : ""}`}
          >
            Home
          </Link>
            <>
              <Link
                to="/theory"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${isActive("/theory") ? "text-indigo-200" : ""}`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Theory</span>
              </Link>
              <Link
                to="/practice"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${isActive("/practice") ? "text-indigo-200" : ""}`}
              >
                <Code2 className="w-5 h-5" />
                <span>Practice</span>
              </Link>
              <Link
                to="/playground"
                className={`flex items-center space-x-1 hover:text-indigo-200 transition ${isActive("/playground") ? "text-indigo-200" : ""}`}
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
        </div>
      </div>
    </div>
  </nav>
    <div className="h-screen flex flex-col pt-16">
      <div className="flex-1 px-8 py-6 min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Initializing SQL Database...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-8 h-full">
            {/* Left Sidebar - Tables List */}
            <div className="w-1/4 flex flex-col min-h-0">
              <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Tables</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 pr-4">
                  <div className="space-y-3">
                    {tables.map(table => (
                      <button
                        key={table.id}
                        onClick={() => handleSelectTable(table)}
                        className={`w-full text-left p-4 rounded-lg border transition
                          ${selectedTable?.id === table.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{table.name}</span>
                          <Database className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    ))}
                    
                    {tables.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No tables created yet</p>
                        <button 
                          onClick={() => setShowCreateModal(true)}
                          className="mt-2 text-indigo-600 hover:text-indigo-700"
                        >
                          Create your first table
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {selectedTable ? (
                <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                  <div className="overflow-y-auto flex-1 min-h-0 pr-4">
                    {/* Table Definition */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Table Definition</h3>
                      <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                        {selectedTable.definition}
                      </pre>
                    </div>

                    {/* Table Structure */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Table Structure</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Constraints</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedTable.columns.map((col, idx) => (
                              <tr key={idx}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{col.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{col.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {[
                                    col.isPrimary && 'PRIMARY KEY',
                                    !col.nullable && 'NOT NULL',
                                  ].filter(Boolean).join(', ')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Current Table Data */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Current Table Data</h3>
                      <div className="overflow-x-auto">
                        {tableData.length > 0 ? (
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {selectedTable.columns.map(col => (
                                  <th key={col.name} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {tableData.map((row, idx) => (
                                <tr key={idx}>
                                  {selectedTable.columns.map(col => (
                                    <td key={col.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {row[col.name]?.toString()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                            No data in table. Use INSERT queries to add data.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Query Editor */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">SQL Query</h3>
                      <div className="mb-4 text-sm text-gray-600">
                        Available fields in <strong>{selectedTable.name}</strong>: {selectedTable.columns.map(col => col.name).join(', ')}
                      </div>
                      <SQLEditor
                        query={sqlQuery}
                        setQuery={setSqlQuery}
                        onExecute={executeQuery}
                        placeholder={`Enter your SQL query for ${selectedTable.name}...`}
                      />
                      
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Try queries like:</p>
                        <ul className="mt-1 list-disc list-inside">
                          <li><code>SELECT * FROM {selectedTable.name};</code></li>
                          <li><code>INSERT INTO {selectedTable.name} ({selectedTable.columns.map(c => c.name).join(', ')}) VALUES (...);</code></li>
                          <li><code>UPDATE {selectedTable.name} SET column = value WHERE condition;</code></li>
                          <li><code>DELETE FROM {selectedTable.name} WHERE condition;</code></li>
                        </ul>
                      </div>
                    </div>

                    {/* Query Results */}
                    {queryResult && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Query Results</h3>
                        {queryResult.error ? (
                          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                            {queryResult.error}
                          </div>
                        ) : queryResult.fields && queryResult.fields.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {queryResult.fields.map(field => (
                                    <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                      {field}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {queryResult.data.map((row, idx) => (
                                  <tr key={idx}>
                                    {queryResult.fields.map(field => (
                                      <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {row[field]?.toString()}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                            Query executed successfully. {queryResult.data?.length === 0 ? 'No data returned.' : ''}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Query History */}
                    {queryHistory.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Query History</h3>
                        <div className="overflow-y-auto max-h-60 bg-gray-50 rounded-lg">
                          <ul className="divide-y divide-gray-200">
                            {queryHistory.slice().reverse().map((query, idx) => (
                              <li key={idx} className="p-3 hover:bg-gray-100 cursor-pointer text-sm font-mono" onClick={() => {
                                setSqlQuery(query);
                                executeQuery(query);
                              }}>
                                {query}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg">Select a table to view details and run queries</p>
                    {tables.length === 0 && (
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Create Your First Table
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Create New Table</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SQL Definition
                </label>
                <div className="text-sm text-gray-500 mb-4">
                  Example: CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT)
                </div>
                <textarea
                  value={newTableDefinition}
                  onChange={(e) => setNewTableDefinition(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter CREATE TABLE statement..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTable}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}