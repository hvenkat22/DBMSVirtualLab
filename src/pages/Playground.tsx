import { useState, useEffect } from 'react';
import { Database, Plus, X } from 'lucide-react';
import SQLEditor from '../components/SQLEditor';

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
  data: any[];
}

interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  fields?: string[];
}

export default function Playground() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableDefinition, setNewTableDefinition] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  // Sync selectedTable with tables
  useEffect(() => {
    if (selectedTable) {
      const updatedTable = tables.find(t => t.id === selectedTable.id);
      if (updatedTable) {
        setSelectedTable(updatedTable);
      }
    }
  }, [tables]);

  const parseCreateTableSQL = (sql: string): Table | null => {
    try {
      const tableNameMatch = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\(/i);
      if (!tableNameMatch) throw new Error("Invalid CREATE TABLE syntax");

      const tableName = tableNameMatch[1];
      const columnsSection = sql.slice(sql.indexOf('(') + 1, sql.lastIndexOf(')'));

      const columnDefinitions = columnsSection.split(',').map(col => col.trim());
      const columns: Column[] = columnDefinitions.map(colDef => {
        const parts = colDef.split(/\s+/);
        return {
          name: parts[0],
          type: parts[1],
          nullable: !colDef.toLowerCase().includes('not null'),
          isPrimary: colDef.toLowerCase().includes('primary key'),
        };
      });

      return {
        id: Date.now().toString(),
        name: tableName,
        definition: sql,
        columns,
        data: [],
      };
    } catch (error) {
      return null;
    }
  };

  const handleCreateTable = () => {
    const newTable = parseCreateTableSQL(newTableDefinition);
    if (newTable) {
      setTables([...tables, newTable]);
      setShowCreateModal(false);
      setNewTableDefinition('');
    } else {
      alert('Invalid table definition. Please check your SQL syntax.');
    }
  };

  const executeQuery = (sql: string) => {
    try {
      const lowerSQL = sql.toLowerCase();
      setQueryHistory([...queryHistory, sql]);

      if (lowerSQL.startsWith('select')) {
        handleSelect(sql);
      } else if (lowerSQL.startsWith('insert')) {
        handleInsert(sql);
      } else if (lowerSQL.startsWith('update')) {
        handleUpdate(sql);
      } else if (lowerSQL.startsWith('delete')) {
        handleDelete(sql);
      } else {
        setQueryResult({
          success: false,
          error: 'Unsupported query type. Please use SELECT, INSERT, UPDATE, or DELETE.',
        });
      }
    } catch (error) {
      setQueryResult({
        success: false,
        error: 'Error executing query: ' + (error as Error).message,
      });
    }
  };

  const handleSelect = (sql: string) => {
    const tableName = sql.match(/from\s+(\w+)/i)?.[1];
    const table = tables.find(t => t.name.toLowerCase() === tableName?.toLowerCase());

    if (!table) {
      setQueryResult({ success: false, error: 'Table not found' });
      return;
    }

    setQueryResult({
      success: true,
      data: table.data,
      fields: table.columns.map(col => col.name),
    });
  };

  const handleInsert = (sql: string) => {
    const matches = sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (!matches) {
      setQueryResult({ success: false, error: 'Invalid INSERT syntax' });
      return;
    }

    const [_, tableName, columns, values] = matches;
    const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());

    if (!table) {
      setQueryResult({ success: false, error: 'Table not found' });
      return;
    }

    const columnNames = columns.split(',').map(c => c.trim());
    const valueList = values.split(',').map(v => v.trim().replace(/'/g, ''));

    const newRow: any = {};
    columnNames.forEach((col, idx) => {
      newRow[col] = valueList[idx];
    });

    const updatedTable = {
      ...table,
      data: [...table.data, newRow],
    };

    setTables(tables.map(t => (t.id === table.id ? updatedTable : t)));
    setQueryResult({
      success: true,
      data: [newRow],
      fields: columnNames,
    });
  };

  const handleUpdate = (sql: string) => {
    const tableNameMatch = sql.match(/UPDATE\s+(\w+)\s+SET/i);
    if (!tableNameMatch) {
      setQueryResult({ success: false, error: 'Invalid UPDATE syntax' });
      return;
    }

    const tableName = tableNameMatch[1];
    const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());

    if (!table) {
      setQueryResult({ success: false, error: 'Table not found' });
      return;
    }

    const setClause = sql.match(/SET\s+(.*?)\s+WHERE/i)?.[1];
    if (!setClause) {
      setQueryResult({ success: false, error: 'Invalid SET clause' });
      return;
    }

    const whereClause = sql.match(/WHERE\s+(.*)/i)?.[1];
    if (!whereClause) {
      setQueryResult({ success: false, error: 'Invalid WHERE clause' });
      return;
    }

    const updatedData = table.data.map(row => {
      const matchesCondition = whereClause.split('AND').every(condition => {
        const [col, value] = condition.split('=').map(s => s.trim());
        return row[col] === value.replace(/'/g, '');
      });

      if (matchesCondition) {
        setClause.split(',').forEach(assignment => {
          const [col, value] = assignment.split('=').map(s => s.trim());
          row[col] = value.replace(/'/g, '');
        });
      }

      return row;
    });

    const updatedTable = {
      ...table,
      data: updatedData,
    };

    setTables(tables.map(t => (t.id === table.id ? updatedTable : t)));
    setQueryResult({
      success: true,
      data: updatedData.filter(row => {
        const matchesCondition = whereClause.split('AND').every(condition => {
          const [col, value] = condition.split('=').map(s => s.trim());
          return row[col] === value.replace(/'/g, '');
        });
        return matchesCondition;
      }),
      fields: table.columns.map(col => col.name),
    });
  };

  const handleDelete = (sql: string) => {
    const tableNameMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (!tableNameMatch) {
      setQueryResult({ success: false, error: 'Invalid DELETE syntax' });
      return;
    }

    const tableName = tableNameMatch[1];
    const table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());

    if (!table) {
      setQueryResult({ success: false, error: 'Table not found' });
      return;
    }

    const whereClause = sql.match(/WHERE\s+(.*)/i)?.[1];
    if (!whereClause) {
      setQueryResult({ success: false, error: 'Invalid WHERE clause' });
      return;
    }

    const updatedData = table.data.filter(row => {
      return !whereClause.split('AND').every(condition => {
        const [col, value] = condition.split('=').map(s => s.trim());
        return row[col] === value.replace(/'/g, '');
      });
    });

    const updatedTable = {
      ...table,
      data: updatedData,
    };

    setTables(tables.map(t => (t.id === table.id ? updatedTable : t)));
    setQueryResult({
      success: true,
      data: [],
      fields: table.columns.map(col => col.name),
    });
  };

  return (
    <div className="h-screen flex flex-col pt-16">
      <div className="flex-1 px-8 py-6 min-h-0 overflow-hidden">
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
                      onClick={() => setSelectedTable(table)}
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
                          {selectedTable.data.map((row, idx) => (
                            <tr key={idx}>
                              {selectedTable.columns.map(col => (
                                <td key={col.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {row[col.name]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Query Editor */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">SQL Query</h3>
                    <div className="mb-4 text-sm text-gray-600">
                      Available fields: {selectedTable.columns.map(col => col.name).join(', ')}
                    </div>
                    <SQLEditor
                      onExecute={executeQuery}
                      placeholder={`Enter your SQL query for ${selectedTable.name}...`}
                    />
                  </div>

                  {/* Query Results */}
                  {queryResult && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-3">Query Results</h3>
                      {queryResult.error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                          {queryResult.error}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {queryResult.fields?.map(field => (
                                  <th key={field} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {field}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {queryResult.data?.map((row, idx) => (
                                <tr key={idx}>
                                  {queryResult.fields?.map(field => (
                                    <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {row[field]?.toString()}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">Select a table to view details and run queries</p>
                </div>
              </div>
            )}
          </div>
        </div>
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
  );
}

// ..................................................................................................................................................................................

