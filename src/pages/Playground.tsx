import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import {Plus, X } from 'lucide-react';
import SQLEditor from '../components/SQLEditor';
import { Database, BookOpen, Code2, Layout, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";



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
  const location = useLocation();
  const [storedUser, setUser] = useState(localStorage.getItem("user"));
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [tables, setTables] = useState(() => {
    const savedTables = localStorage.getItem('tables');
    return savedTables ? JSON.parse(savedTables) : [];
  }); 
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTableDefinition, setNewTableDefinition] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables));
  }, [tables]);
  

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
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tables");
    setUser(null);
    navigate("/");
  };

  const handleSelect = (sql: string) => {
    try {
        // Updated regex to match all types of joins
        console.log(sql)
        const regex = /select\s+(.*?)\s+from\s+(\w+)(?:\s+(left|right|full|inner|natural)?\s*(?:outer\s+)?join\s+(\w+)(?:\s+(?:on|using)\s+(?:\(?\s*(\w+)(?:\.(\w+))?\s*=\s*(\w+)(?:\.(\w+))?\s*\)?|\(([^)]+)\))?)?)?\s*(?:where\s+([^;]+))?(?:\s*group\s+by\s+([\w, ]+))?(?:\s*having\s+(.+))?/i;
        const match = sql.match(regex)
        console.log(match)             
        

if (!match) {
    setQueryResult({ success: false, error: "Invalid SQL query" });
    return;
}

const [, columns, tableName, joinType, joinTable, leftTable, leftColumn, rightTable, rightColumn, usingColumns, whereClause = '', groupByClause, havingClause] = match;

        let table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
        let joinData = joinTable ? tables.find(t => t.name.toLowerCase() === joinTable.toLowerCase()) : null;

        if (!table) {
            setQueryResult({ success: false, error: "Table not found" });
            return;
        }

        // Determine selected columns
        let selectedColumns = columns.trim() === '*' 
            ? table.columns.map(col => col.name)
            : columns.split(',').map(col => col.trim());

        // Start with a deep copy of the table data
        let filteredData = JSON.parse(JSON.stringify(table.data));

        // Handle different types of JOINs
        if (joinData) {
            const normalizedJoinType = (joinType || 'inner').toLowerCase();
            
            // Function to combine rows based on join condition
            const combineRows = (leftRow: any, rightRow: any) => {
                const combined = { ...leftRow };
                // Prefix columns from right table with table name to avoid conflicts
                Object.entries(rightRow).forEach(([key, value]) => {
                    combined[`${joinTable}.${key}`] = value;
                });
                return combined;
            };

            // Function to check if rows match based on join condition
            const rowsMatch = (leftRow: any, rightRow: any) => {
                if (usingColumns) {
                    // USING clause - match on specified columns
                    const cols = usingColumns.split(',').map(c => c.trim());
                    return cols.every(col => leftRow[col] === rightRow[col]);
                } else if (leftColumn && rightColumn) {
                    // ON clause
                    const leftVal = leftTable ? leftRow[leftColumn] : leftRow[leftColumn];
                    const rightVal = rightTable ? rightRow[rightColumn] : rightRow[rightColumn];
                    return leftVal === rightVal;
                }
                return false;
            };

            switch (normalizedJoinType) {
                case 'natural': {
                    // Find common column names between tables
                    const commonColumns = table.columns
                        .map(col => col.name)
                        .filter(col => joinData!.columns.map(jCol => jCol.name).includes(col));

                    filteredData = filteredData.flatMap(leftRow => {
                        const matches = joinData!.data.filter(rightRow =>
                            commonColumns.every(col => leftRow[col] === rightRow[col])
                        );
                        return matches.length ? matches.map(rightRow => ({ ...leftRow, ...rightRow })) : [];
                    });
                    break;
                }

                case 'left': {
                    filteredData = filteredData.map(leftRow => {
                        const matches = joinData!.data.filter(rightRow => rowsMatch(leftRow, rightRow));
                        return matches.length
                            ? matches.map(rightRow => combineRows(leftRow, rightRow))
                            : [{ ...leftRow }]; // Keep left row with nulls for right side
                    }).flat();
                    break;
                }

                case 'right': {
                    filteredData = joinData!.data.map(rightRow => {
                        const matches = filteredData.filter(leftRow => rowsMatch(leftRow, rightRow));
                        return matches.length
                            ? matches.map(leftRow => combineRows(leftRow, rightRow))
                            : [{ ...rightRow }]; // Keep right row with nulls for left side
                    }).flat();
                    break;
                }

                case 'full': {
                    // Start with left join
                    const leftJoin = filteredData.map(leftRow => {
                        const matches = joinData!.data.filter(rightRow => rowsMatch(leftRow, rightRow));
                        return matches.length
                            ? matches.map(rightRow => combineRows(leftRow, rightRow))
                            : [{ ...leftRow }];
                    }).flat();

                    // Add unmatched right rows
                    const rightOnly = joinData!.data.filter(rightRow =>
                        !filteredData.some(leftRow => rowsMatch(leftRow, rightRow))
                    ).map(rightRow => {
                        const nullLeft = Object.fromEntries(
                            table.columns.map(col => [col.name, null])
                        );
                        return combineRows(nullLeft, rightRow);
                    });

                    filteredData = [...leftJoin, ...rightOnly];
                    break;
                }

                default: { // inner join
                    filteredData = filteredData.flatMap(leftRow => {
                        const matches = joinData!.data.filter(rightRow => rowsMatch(leftRow, rightRow));
                        return matches.map(rightRow => combineRows(leftRow, rightRow));
                    });
                }
            }
        }
        console.log(whereClause)
        if (whereClause) {
          // Split the whereClause into individual conditions
          let conditions = whereClause.split(/\s+(AND|OR)\s+/i);
          filteredData = filteredData.filter(row => {
              let conditionResults: boolean[] = [];
              let currentOp = "AND"; // Default operation is AND
      
              for (let i = 0; i < conditions.length; i++) {
                  const condition = conditions[i].trim();
                  if (condition.toUpperCase() === "AND" || condition.toUpperCase() === "OR") {
                      currentOp = condition.toUpperCase(); // Update current operation
                      continue; // Skip to the next iteration
                  }
      
                  // Match the condition using regex
                  const conditionMatch = condition.match(/(\w+)\s*(=|!=|<>|>|<|>=|<=)\s*(.+)/);
                  if (!conditionMatch) {
                      console.warn(`Invalid condition: ${condition}`);
                      continue; // Skip if the condition is invalid
                  }
      
                  let [, column, operator, value] = conditionMatch;
      
                  // Check if the column exists in the row
                  if (!(column in row)) {
                      console.warn(`Column not found in row: ${column}`);
                      conditionResults.push(false);
                      continue; // Skip to the next condition
                  }
      
                  // Parse the value
                  if (!isNaN(Number(value))) {
                      value = Number(value); // Convert to number if applicable
                  } else if (value.startsWith("'") && value.endsWith("'")) {
                      value = value.slice(1, -1); // Remove quotes for string values
                  }
      
                  // Evaluate the condition
                  let result = false;
                  const rowValue = row[column]; // Get the value from the row
      
                  switch (operator) {
                      case "=": result = rowValue == value; break;
                      case "!=": result = rowValue != value; break;
                      case "<>": result = rowValue != value; break; // Handle <> as not equal
                      case ">": result = rowValue > value; break;
                      case "<": result = rowValue < value; break;
                      case ">=": result = rowValue >= value; break;
                      case "<=": result = rowValue <= value; break;
                      default: console.warn(`Unknown operator: ${operator}`); break; // Handle unknown operators
                  }
      
                  // Log the evaluation
                  console.log(`Evaluating: ${row[column]} ${operator} ${value} => ${result}`);
      
                  conditionResults.push(result); // Store the result of the condition
              }
      
              // Combine results based on the current operation (AND/OR)
              return conditionResults.reduce((acc, val, index) => {
                  if (index === 0) return val; // First value is the initial accumulator
                  return currentOp === "AND" ? acc && val : acc || val; // Combine results
              }, true);
          });
      }
        // Handle GROUP BY and aggregations
        if (groupByClause) {
            const groupByColumns = groupByClause.split(',').map(col => col.trim());
            const groups = new Map<string, any[]>();

            // Group the data
            filteredData.forEach(row => {
                const groupKey = groupByColumns.map(col => row[col]).join('|');
                if (!groups.has(groupKey)) {
                    groups.set(groupKey, []);
                }
                groups.get(groupKey)!.push(row);
            });

            // Process each group
            filteredData = Array.from(groups.values()).map(group => {
                const result: Record<string, any> = {};

                // Add group by columns
                groupByColumns.forEach(col => {
                    result[col] = group[0][col];
                });

                // Process aggregations
                selectedColumns.forEach(col => {
                    const aggMatch = col.match(/(COUNT|SUM|AVG|MIN|MAX)\((\*|\w+)\)/i);
                    if (aggMatch) {
                        const [, func, field] = aggMatch;
                        const values = field === '*' ? group : group.map(r => r[field]).filter(v => v != null);

                        switch (func.toUpperCase()) {
                            case 'COUNT':
                                result[col] = field === '*' ? group.length : values.length;
                                break;
                            case 'SUM':
                                result[col] = values.reduce((sum: number, val: number) => sum + val, 0);
                                break;
                            case 'AVG':
                                result[col] = values.length ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length : null;
                                break;
                            case 'MIN':
                                result[col] = values.length ? Math.min(...values) : null;
                                break;
                            case 'MAX':
                                result[col] = values.length ? Math.max(...values) : null;
                                break;
                        }
                    } else if (!col.includes('(')) {
                        result[col] = group[0][col];
                    }
                });

                return result;
            });

            // Handle HAVING clause
            if (havingClause) {
                const havingMatch = havingClause.match(/(\w+)\s*(=|!=|>|<|>=|<=)\s*(.+)/);
                if (havingMatch) {
                    const [, column, operator, rawValue] = havingMatch;
                    const value = !isNaN(Number(rawValue)) ? Number(rawValue) : rawValue.replace(/['"]/g, '');

                    filteredData = filteredData.filter(row => {
                        switch (operator) {
                            case '=': return row[column] == value;
                            case '!=': return row[column] != value;
                            case '>': return row[column] > value;
                            case '<': return row[column] < value;
                            case '>=': return row[column] >= value;
                            case '<=': return row[column] <= value;
                            default: return false;
                        }
                    });
                }
            }
        }

        // If no GROUP BY, but has aggregate functions
        else if (selectedColumns.some(col => /^(COUNT|SUM|AVG|MIN|MAX)\(/i.test(col))) {
            const result: Record<string, any> = {};
            
            selectedColumns.forEach(col => {
                const aggMatch = col.match(/(COUNT|SUM|AVG|MIN|MAX)\((\*|\w+)\)/i);
                if (aggMatch) {
                    const [, func, field] = aggMatch;
                    const values = field === '*' ? filteredData : filteredData.map(r => r[field]).filter(v => v != null);

                    switch (func.toUpperCase()) {
                        case 'COUNT':
                            result[col] = field === '*' ? filteredData.length : values.length;
                            break;
                        case 'SUM':
                            result[col] = values.reduce((sum: number, val: number) => sum + val, 0);
                            break;
                        case 'AVG':
                            result[col] = values.length ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length : null;
                            break;
                        case 'MIN':
                            result[col] = values.length ? Math.min(...values) : null;
                            break;
                        case 'MAX':
                            result[col] = values.length ? Math.max(...values) : null;
                            break;
                    }
                } else {
                    result[col] = filteredData[0]?.[col];
                }
            });

            filteredData = [result];
        }

        // Project only selected columns if not already handled by GROUP BY
        if (!groupByClause && !selectedColumns.some(col => /^(COUNT|SUM|AVG|MIN|MAX)\(/i.test(col))) {
            filteredData = filteredData.map(row => {
                const projectedRow: Record<string, any> = {};
                selectedColumns.forEach(col => {
                    projectedRow[col] = row[col];
                });
                return projectedRow;
            });
        }

        setQueryResult({
            success: true,
            data: filteredData,
            fields: selectedColumns
        });

    } catch (error) {
        console.error('Query error:', error);
        setQueryResult({ success: false, error: "Error processing SQL query" });
    }
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
    </>
  );
}

// ..................................................................................................................................................................................

