import { useState, useEffect } from 'react';
import SQLEditor from '../components/SQLEditor';
import { Exercise } from '../types';
import { ChevronRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from "react-router-dom";
import { Database, BookOpen, Code2, Layout, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import initSqlJs from 'sql.js';

// Add these state variables to your component



const tableSchemas = {
  employees: `
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dept_id INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  salary DECIMAL(10,2),
  FOREIGN KEY (dept_id) REFERENCES departments (id)
);

-- Sample data:
INSERT INTO employees (dept_id, name, email, salary) VALUES
(1, 'John Doe', 'john@example.com', 75000),
(1, 'Jane Smith', 'jane@example.com', 65000),
(3, 'Bob Johnson', 'bob@example.com', 85000);
`,
  departments: `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(50) NOT NULL,
  location VARCHAR(100),
  budget DECIMAL(15,2)
);

-- Sample data:
INSERT INTO departments (name, location, budget) VALUES
('IT', 'New York', 1000000),
('HR', 'Chicago', 500000),
('Sales', 'Los Angeles', 800000);
`,
students:`
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  
  name VARCHAR(50) NOT NULL,
  age INT, 
  email varchar(50)
);

INSERT INTO students (name, age, email) VALUES
('Hari Venkataraman', 20, 'hv9961@srmist.edu.in'),
('Aman Singhal', 20, 'as4360@srmist.edu.in'),
('Bob Smith', 19, 'bs4530@srmist.edu.in')
`
};

const exercises: Exercise[] = [
  // Topic 1: SELECT Operations
  {
    id: '1',
    question: 'Write a query to select all columns from the `employees` table.',
    expectedResult: 'SELECT * FROM employees',
    difficulty: 'easy',
    hints: ['Use the SELECT statement', 'The * symbol selects all columns'],
    category: 'SELECT Operations'
  },
  {
    id: '2',
    question: 'Write a query to select only the `name` and `salary` columns from the `employees` table.',
    expectedResult: 'SELECT name, salary FROM employees',
    difficulty: 'easy',
    hints: ['Specify column names in the SELECT statement'],
    category: 'SELECT Operations'
  },
  {
    id: '3',
    question: 'Write a query to select employees whose salary is greater than 50000.',
    expectedResult: 'SELECT * FROM employees WHERE salary > 50000',
    difficulty: 'medium',
    hints: ['Use the WHERE clause', 'Use the > operator for comparison'],
    category: 'SELECT Operations'
  },
  {
    id: '4',
    question: 'Write a query to select employees from the `IT` department.',
    expectedResult: 'SELECT * FROM employees e join departments d WHERE d.name = \'IT\'',
    difficulty: 'medium',
    hints: ['Use the WHERE clause', 'Use the = operator for exact match'],
    category: 'SELECT Operations'
  },
  {
    id: '5',
    question: 'Write a query to select employees whose names start with the letter \'J\' and have a salary greater than 60000.',
    expectedResult: 'SELECT * FROM employees WHERE name LIKE \'J%\' AND salary > 60000',
    difficulty: 'hard',
    hints: ['Use the LIKE operator for pattern matching', 'Combine conditions with AND'],
    category: 'SELECT Operations'
  },

  // Topic 2: Data Definition Language (DDL)
  {
    id: '6',
    question: 'Write a query to create a table named `student` with columns `id`, `name`, and `age`.',
    expectedResult: 'CREATE TABLE students (id SERIAL PRIMARY KEY, name VARCHAR(100), age INT)',
    difficulty: 'easy',
    hints: ['Use the CREATE TABLE statement', 'Define columns with their data types'],
    category: 'DDL'
  },
  {
    id: '7',
    question: 'Write a query to add a new column `email` to the `students` table.',
    expectedResult: 'ALTER TABLE students ADD COLUMN email VARCHAR(255)',
    difficulty: 'easy',
    hints: ['Use the ALTER TABLE statement', 'Use ADD COLUMN to add a new column'],
    category: 'DDL'
  },
  {
    id: '8',
    question: 'Write a query to drop the `students` table.',
    expectedResult: 'DROP TABLE students',
    difficulty: 'medium',
    hints: ['Use the DROP TABLE statement'],
    category: 'DDL'
  },
  {
    id: '9',
    question: 'Write a query to rename the `students` table to `learners`.',
    expectedResult: 'ALTER TABLE students RENAME TO learners',
    difficulty: 'medium',
    hints: ['Use the ALTER TABLE statement', 'Use RENAME TO to rename the table'],
    category: 'DDL'
  },
  {
    id: '10',
    question: 'Write a query to create an index on the `email` column of the `students` table.',
    expectedResult: 'CREATE INDEX idx_email ON students(email)',
    difficulty: 'hard',
    hints: ['Use the CREATE INDEX statement', 'Specify the column to index'],
    category: 'DDL'
  },

  // Topic 3: Data Manipulation Language (DML)
  {
    id: '11',
    question: 'Write a query to insert a new employee into the `employees` table.',
    expectedResult: 'INSERT INTO employees (dept_id, name, email, salary) VALUES (3, \'Alice\', \'alice@example.com\', 80000)',
    difficulty: 'easy',
    hints: ['Use the INSERT INTO statement', 'Specify column names and values'],
    category: 'DML'
  },
  {
    id: '12',
    question: 'Write a query to update the salary of an employee with id 1 to 90000.',
    expectedResult: 'UPDATE employees SET salary = 90000 WHERE id = 1',
    difficulty: 'easy',
    hints: ['Use the UPDATE statement', 'Use the WHERE clause to specify the record'],
    category: 'DML'
  },
  {
    id: '13',
    question: 'Write a query to delete an employee with id 2 from the `employees` table.',
    expectedResult: 'DELETE FROM employees WHERE id = 2',
    difficulty: 'medium',
    hints: ['Use the DELETE FROM statement', 'Use the WHERE clause to specify the record'],
    category: 'DML'
  },
  {
    id: '14',
    question: 'Write a query to insert multiple employees into the `employees` table.',
    expectedResult: 'INSERT INTO employees (name, email, department, salary) VALUES (\'Bob\', \'bob@example.com\', \'IT\', 70000), (\'Charlie\', \'charlie@example.com\', \'HR\', 60000)',
    difficulty: 'medium',
    hints: ['Use the INSERT INTO statement', 'Specify multiple sets of values'],
    category: 'DML'
  },
  {
    id: '15',
    question: 'Write a query to update the department of all employees with a salary less than 50000 to \'Support\'.',
    expectedResult: 'UPDATE employees SET department = \'Support\' WHERE salary < 50000',
    difficulty: 'hard',
    hints: ['Use the UPDATE statement', 'Use the WHERE clause to filter records'],
    category: 'DML'
  },
    {
      id: '16',
      question: 'Write a query to grant SELECT permission on the `employees` table to a user named `john`.',
      expectedResult: 'GRANT SELECT ON employees TO john',
      difficulty: 'easy',
      hints: ['Use the GRANT statement', 'Specify the permission and table'],
      category: 'DCL'
    },
    {
      id: '17',
      question: 'Write a query to revoke INSERT permission on the `departments` table from a user named `jane`.',
      expectedResult: 'REVOKE INSERT ON departments FROM jane',
      difficulty: 'easy',
      hints: ['Use the REVOKE statement', 'Specify the permission and table'],
      category: 'DCL'
    },
    {
      id: '18',
      question: 'Write a query to grant ALL permissions on the `employees` table to a user named `admin`.',
      expectedResult: 'GRANT ALL ON employees TO admin',
      difficulty: 'medium',
      hints: ['Use the GRANT statement', 'Use ALL to grant all permissions'],
      category: 'DCL'
    },
    {
      id: '19',
      question: 'Write a query to revoke ALL permissions on the `departments` table from a user named `guest`.',
      expectedResult: 'REVOKE ALL ON departments FROM guest',
      difficulty: 'medium',
      hints: ['Use the REVOKE statement', 'Use ALL to revoke all permissions'],
      category: 'DCL'
    },
    {
      id: '20',
      question: 'Write a query to grant SELECT and UPDATE permissions on the `employees` table to a role named `manager`.',
      expectedResult: 'GRANT SELECT, UPDATE ON employees TO manager',
      difficulty: 'hard',
      hints: ['Use the GRANT statement', 'Specify multiple permissions separated by commas'],
      category: 'DCL'
    },
  
    // Topic 5: Transaction Control Language (TCL)
    {
      id: '21',
      question: 'Write a query to commit the current transaction.',
      expectedResult: 'COMMIT',
      difficulty: 'easy',
      hints: ['Use the COMMIT statement'],
      category: 'TCL'
    },
    {
      id: '22',
      question: 'Write a query to rollback the current transaction.',
      expectedResult: 'ROLLBACK',
      difficulty: 'easy',
      hints: ['Use the ROLLBACK statement'],
      category: 'TCL'
    },
    {
      id: '23',
      question: 'Write a query to create a savepoint named `sp1`.',
      expectedResult: 'SAVEPOINT sp1',
      difficulty: 'medium',
      hints: ['Use the SAVEPOINT statement'],
      category: 'TCL'
    },
    {
      id: '24',
      question: 'Write a query to rollback to a savepoint named `sp1`.',
      expectedResult: 'ROLLBACK TO sp1',
      difficulty: 'medium',
      hints: ['Use the ROLLBACK TO statement'],
      category: 'TCL'
    },
    {
      id: '25',
      question: 'Write a query to commit the current transaction and release all savepoints.',
      expectedResult: 'COMMIT',
      difficulty: 'hard',
      hints: ['Use the COMMIT statement', 'Savepoints are automatically released on commit'],
      category: 'TCL'
    },
  
    // Topic 6: Constraints
    {
      id: '26',
      question: 'Write a query to add a PRIMARY KEY constraint to the `id` column of the `students` table.',
      expectedResult: 'ALTER TABLE students ADD PRIMARY KEY (id)',
      difficulty: 'easy',
      hints: ['Use the ALTER TABLE statement', 'Use ADD PRIMARY KEY'],
      category: 'Constraints'
    },
    {
      id: '27',
      question: 'Write a query to add a UNIQUE constraint named unique_email to the `email` column of the `students` table.',
      expectedResult: 'ALTER TABLE students ADD CONSTRAINT unique_email UNIQUE (email)',
      difficulty: 'easy',
      hints: ['Use the ALTER TABLE statement', 'Use ADD CONSTRAINT'],
      category: 'Constraints'
    },
    {
      id: '28',
      question: 'Write a query to add a FOREIGN KEY constraint named fk_dept to the `dept_id` column of the `employees` table referencing the `id` column of the `departments` table.',
      expectedResult: 'ALTER TABLE employees ADD CONSTRAINT fk_dept FOREIGN KEY (dept_id) REFERENCES departments(id)',
      difficulty: 'medium',
      hints: ['Use the ALTER TABLE statement', 'Use ADD CONSTRAINT with FOREIGN KEY'],
      category: 'Constraints'
    },
    {
      id: '29',
      question: 'Write a query to add a CHECK constraint named chk_salary to the `salary` column of the `employees` table to ensure salary is greater than 0.',
      expectedResult: 'ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary > 0)',
      difficulty: 'medium',
      hints: ['Use the ALTER TABLE statement', 'Use ADD CONSTRAINT with CHECK'],
      category: 'Constraints'
    },
    {
      id: '30',
      question: 'Write a query to drop a FOREIGN KEY constraint named `fk_dept` from the `employees` table.',
      expectedResult: 'ALTER TABLE employees DROP CONSTRAINT fk_dept',
      difficulty: 'hard',
      hints: ['Use the ALTER TABLE statement', 'Use DROP CONSTRAINT'],
      category: 'Constraints'
    },
  
    // Topic 7: Joins
    {
      id: '31',
      question: 'Write a query to perform an INNER JOIN between the `employees` and `departments` tables on the `dept_id` column.',
      expectedResult: 'SELECT * FROM employees e INNER JOIN departments d ON e.dept_id = d.id',
      difficulty: 'easy',
      hints: ['Use the INNER JOIN keyword', 'Specify the join condition with ON'],
      category: 'Joins'
    },
    {
      id: '32',
      question: 'Write a query to perform a LEFT JOIN between the `employees` and `departments` tables on the `dept_id` column.',
      expectedResult: 'SELECT * FROM employees e LEFT JOIN departments d ON e.dept_id = d.id',
      difficulty: 'easy',
      hints: ['Use the LEFT JOIN keyword', 'Specify the join condition with ON'],
      category: 'Joins'
    },
    {
      id: '33',
      question: 'Write a query to perform a RIGHT JOIN between the `employees` and `departments` tables on the `dept_id` column.',
      expectedResult: 'SELECT * FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id',
      difficulty: 'medium',
      hints: ['Use the RIGHT JOIN keyword', 'Specify the join condition with ON'],
      category: 'Joins'
    },
    {
      id: '34',
      question: 'Write a query to perform a FULL OUTER JOIN between the `employees` and `departments` tables on the `dept_id` column.',
      expectedResult: 'SELECT * FROM employees e FULL OUTER JOIN departments d ON e.dept_id = d.id',
      difficulty: 'medium',
      hints: ['Use the FULL OUTER JOIN keyword', 'Specify the join condition with ON'],
      category: 'Joins'
    },
    {
      id: '35',
      question: 'Write a query to perform a SELF JOIN on the `employees` table to find employees who share the same department.',
      expectedResult: 'SELECT e1.name, e2.name FROM employees e1 JOIN employees e2 ON e1.dept_id = e2.dept_id AND e1.id != e2.id',
      difficulty: 'hard',
      hints: ['Use a self-join', 'Join the table to itself with different aliases'],
      category: 'Joins'
    },
  
    // Topic 8: Subqueries & Nested Queries
    {
      id: '36',
      question: 'Write a query to find employees whose salary is greater than the average salary.',
      expectedResult: 'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)',
      difficulty: 'easy',
      hints: ['Use a subquery in the WHERE clause', 'Calculate the average salary in the subquery'],
      category: 'Subqueries'
    },
    {
      id: '37',
      question: 'Write a query to find departments that have at least one employee.',
      expectedResult: 'SELECT * FROM departments WHERE id IN (SELECT DISTINCT dept_id FROM employees)',
      difficulty: 'easy',
      hints: ['Use a subquery with IN', 'Select distinct department IDs from the employees table'],
      category: 'Subqueries'
    },
    {
      id: '38',
      question: 'Write a query to find employees who earn more than the highest salary in the HR department.',
      expectedResult: 'SELECT * FROM employees WHERE salary > (SELECT MAX(salary) FROM employees e join departments d on e.dept_id == d.id WHERE d.name = \'HR\')',
      difficulty: 'medium',
      hints: ['Use a subquery in the WHERE clause', 'Calculate the maximum salary in the HR department'],
      category: 'Subqueries'
    },
    {
      id: '39',
      question: 'Write a query to find employees who work in departments located in New York.',
      expectedResult: 'SELECT * FROM employees WHERE dept_id IN (SELECT id FROM departments WHERE location = \'New York\')',
      difficulty: 'medium',
      hints: ['Use a subquery with IN', 'Select department IDs located in New York'],
      category: 'Subqueries'
    },
    {
      id: '40',
      question: 'Write a query to find the second highest salary in the `employees` table.',
      expectedResult: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)',
      difficulty: 'hard',
      hints: ['Use a subquery to find the highest salary', 'Use MAX() to find the second highest'],
      category: 'Subqueries'
    },
  
    // Topic 9: Aggregate Functions
    {
      id: '41',
      question: 'Write a query to count the total number of employees.',
      expectedResult: 'SELECT COUNT(*) FROM employees',
      difficulty: 'easy',
      hints: ['Use the COUNT() function'],
      category: 'Aggregate Functions'
    },
    {
      id: '42',
      question: 'Write a query to calculate the total salary of all employees.',
      expectedResult: 'SELECT SUM(salary) FROM employees',
      difficulty: 'easy',
      hints: ['Use the SUM() function'],
      category: 'Aggregate Functions'
    },
    {
      id: '43',
      question: 'Write a query to find the average salary of employees in the IT department.',
      expectedResult: 'select avg(salary) from employees e join departments d on e.dept_id == d.id where d.name == \'IT\'',
      difficulty: 'medium',
      hints: ['Use the AVG() function', 'Filter by department using WHERE'],
      category: 'Aggregate Functions'
    },
    {
      id: '44',
      question: 'Write a query to find the highest salary in the `employees` table.',
      expectedResult: 'SELECT MAX(salary) FROM employees',
      difficulty: 'medium',
      hints: ['Use the MAX() function'],
      category: 'Aggregate Functions'
    },
    {
      id: '45',
      question: 'Write a query to find the department with the highest total salary.',
      expectedResult: 'select sum(salary) from employees e join departments d on e.dept_id == d.id group by d.name order by sum(salary) desc limit 1',
      difficulty: 'hard',
      hints: ['Use GROUP BY and SUM()', 'Order the results in descending order'],
      category: 'Aggregate Functions'
    },
  
    // Topic 10: Grouping & Filtering Data
    {
      id: '46',
      question: 'Write a query to group employees by department and count the number of employees in each department.',
      expectedResult: 'SELECT d.name as department, COUNT(*) FROM employees e join departments d on e.dept_id == d.id GROUP BY d.name',
      difficulty: 'easy',
      hints: ['Use GROUP BY', 'Use COUNT() to count employees'],
      category: 'Grouping & Filtering'
    },
    {
      id: '47',
      question: 'Write a query to find departments with more than 5 employees.',
      expectedResult: 'SELECT d.name as department FROM employees e join departments d on e.dept_id == d.id GROUP BY d.name HAVING COUNT(*) > 5',
      difficulty: 'easy',
      hints: ['Use GROUP BY', 'Use HAVING to filter groups'],
      category: 'Grouping & Filtering'
    },
    {
      id: '48',
      question: 'Write a query to find the average salary by department, ordered by average salary in descending order.',
      expectedResult: 'SELECT d.name, AVG(e.salary) FROM employees e join departments d on e.dept_id == d.id GROUP BY d.name ORDER BY AVG(e.salary) DESC',
      difficulty: 'medium',
      hints: ['Use GROUP BY', 'Use ORDER BY to sort the results'],
      category: 'Grouping & Filtering'
    },
    {
      id: '49',
      question: 'Write a query to find departments where the average salary is greater than 60000.',
      expectedResult: 'SELECT d.name FROM employees e join departments d on e.dept_id == d.id GROUP BY d.name HAVING AVG(e.salary) > 60000',
      difficulty: 'medium',
      hints: ['Use GROUP BY', 'Use HAVING to filter groups'],
      category: 'Grouping & Filtering'
    },
    {
      id: '50',
      question: 'Write a query to find the department with the highest number of employees.',
      expectedResult: 'SELECT d.name FROM employees e join departments d on e.dept_id == d.id GROUP BY d.name ORDER BY COUNT(*) DESC LIMIT 1',
      difficulty: 'hard',
      hints: ['Use GROUP BY', 'Use ORDER BY and LIMIT to find the top result'],
      category: 'Grouping & Filtering'
    },
  
    // Topic 11: Indexing & Performance Optimization
    {
      id: '51',
      question: 'Write a query to create an index on the `email` column of the `employees` table.',
      expectedResult: 'CREATE INDEX idx_email ON employees(email)',
      difficulty: 'easy',
      hints: ['Use the CREATE INDEX statement'],
      category: 'Indexing & Performance'
    },
    {
      id: '52',
      question: 'Write a query to drop an index named `idx_email` from the `employees` table.',
      expectedResult: 'DROP INDEX idx_email',
      difficulty: 'easy',
      hints: ['Use the DROP INDEX statement'],
      category: 'Indexing & Performance'
    },
    {
      id: '53',
      question: 'Write a query to analyze the execution plan of a SELECT query on the `employees` table.',
      expectedResult: 'EXPLAIN SELECT * FROM employees',
      difficulty: 'medium',
      hints: ['Use the EXPLAIN statement'],
      category: 'Indexing & Performance'
    },
    {
      id: '54',
      question: 'Write a query to create a view named `high_salary_employees` that shows employees with a salary greater than 70000.',
      expectedResult: 'CREATE VIEW high_salary_employees AS SELECT * FROM employees WHERE salary > 70000',
      difficulty: 'medium',
      hints: ['Use the CREATE VIEW statement'],
      category: 'Indexing & Performance'
    },
    {
      id: '55',
      question: 'Write a query to drop a view named `high_salary_employees`.',
      expectedResult: 'DROP VIEW high_salary_employees',
      difficulty: 'hard',
      hints: ['Use the DROP VIEW statement'],
      category: 'Indexing & Performance'
    },
  
    // Topic 12: Stored Procedures & Functions
    {
      id: '56',
      question: 'Write a query to create a stored procedure named `get_employee_count` that returns the total number of employees.',
      expectedResult: 'CREATE PROCEDURE get_employee_count() BEGIN SELECT COUNT(*) FROM employees; END',
      difficulty: 'easy',
      hints: ['Use the CREATE PROCEDURE statement'],
      category: 'Stored Procedures & Functions'
    },
    {
      id: '57',
      question: 'Write a query to call a stored procedure named `get_employee_count`.',
      expectedResult: 'CALL get_employee_count()',
      difficulty: 'easy',
      hints: ['Use the CALL statement'],
      category: 'Stored Procedures & Functions'
    },
    {
      id: '58',
      question: 'Write a query to create a function named `get_employee_salary` that returns the salary of an employee given their ID.',
      expectedResult: 'CREATE FUNCTION get_employee_salary(emp_id INT) RETURNS DECIMAL(10,2) BEGIN RETURN (SELECT salary FROM employees WHERE id = emp_id); END',
      difficulty: 'medium',
      hints: ['Use the CREATE FUNCTION statement'],
      category: 'Stored Procedures & Functions'
    },
    {
      id: '59',
      question: 'Write a query to drop a stored procedure named `get_employee_count`.',
      expectedResult: 'DROP PROCEDURE get_employee_count',
      difficulty: 'medium',
      hints: ['Use the DROP PROCEDURE statement'],
      category: 'Stored Procedures & Functions'
    },
    {
      id: '60',
      question: 'Write a query to drop a function named `get_employee_salary`.',
      expectedResult: 'DROP FUNCTION get_employee_salary',
      difficulty: 'hard',
      hints: ['Use the DROP FUNCTION statement'],
      category: 'Stored Procedures & Functions'
    },
  
    // Topic 13: Triggers
    {
      id: '61',
      question: 'Write a query to create a trigger named `before_employee_insert` that sets the `created_at` column to the current timestamp before inserting a new employee.',
      expectedResult: 'CREATE TRIGGER before_employee_insert BEFORE INSERT ON employees FOR EACH ROW SET NEW.created_at = NOW()',
      difficulty: 'easy',
      hints: ['Use the CREATE TRIGGER statement'],
      category: 'Triggers'
    },
    {
      id: '62',
      question: 'Write a query to drop a trigger named `before_employee_insert`.',
      expectedResult: 'DROP TRIGGER before_employee_insert',
      difficulty: 'easy',
      hints: ['Use the DROP TRIGGER statement'],
      category: 'Triggers'
    },
    {
      id: '63',
      question: 'Write a query to create a trigger named `after_employee_update` that logs updates to the `employees` table.',
      expectedResult: 'CREATE TRIGGER after_employee_update AFTER UPDATE ON employees FOR EACH ROW INSERT INTO employee_logs (employee_id, action) VALUES (OLD.id, \'update\')',
      difficulty: 'medium',
      hints: ['Use the CREATE TRIGGER statement', 'Use OLD to reference the old row'],
      category: 'Triggers'
    },
    {
      id: '64',
      question: 'Write a query to create a trigger named `before_employee_delete` that prevents deletion of employees with a salary greater than 100000.',
      expectedResult: 'CREATE TRIGGER before_employee_delete BEFORE DELETE ON employees FOR EACH ROW IF OLD.salary > 100000 THEN SIGNAL SQLSTATE \'45000\' SET MESSAGE_TEXT = \'Cannot delete high-salary employees\'; END IF',
      difficulty: 'medium',
      hints: ['Use the CREATE TRIGGER statement', 'Use SIGNAL to raise an error'],
      category: 'Triggers'
    },
    {
      id: '65',
      question: 'Write a query to create a trigger named `after_employee_insert` that updates the `employee_count` table after a new employee is inserted.',
      expectedResult: 'CREATE TRIGGER after_employee_insert AFTER INSERT ON employees FOR EACH ROW UPDATE employee_count SET count = count + 1',
      difficulty: 'hard',
      hints: ['Use the CREATE TRIGGER statement', 'Use NEW to reference the new row'],
      category: 'Triggers'
    }

];

export default function Practice() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [storedUser, setUser] = useState(localStorage.getItem("user"));
  const [queryResult, setQueryResult] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sqlDb, setSqlDb] = useState<any>(null);

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);  // Update selected question
    setQuery('');                   // Clear SQL editor
    setQueryResult(null);           // Clear result table
    setError('');                   // Clear any error
  };
  


  useEffect(() => {
    const initSql = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        setSqlDb(SQL);
      } catch (err) {
        console.error('Failed to initialize SQL.js', err);
        setError('Failed to initialize SQL engine. Please refresh the page.');
      }
    };
    
    initSql();
  }, []);
  

  const checkAnswer = async (query: string) => {
    if (!selectedExercise || !sqlDb) return;
    
    setIsLoading(true);
    setError(null);
    setQueryResult(null);
    
    try {
      const db = new sqlDb.Database();
      
      // Execute the table creation schemas first
      Object.values(tableSchemas).forEach(schema => {
        try {
          db.exec(schema);
        } catch (err) {
          console.error('Error creating schema:', err);
        }
      });
      
      const category = selectedExercise.category;
      
      // Handle different query types differently
      if (['SELECT Operations', 'Joins', 'Subqueries', 'Aggregate Functions', 'Grouping & Filtering'].includes(category)) {
        // For SELECT queries, compare result sets
        try {
          // Execute user's query
          const userResult = db.exec(query);
          
          // Execute expected query
          const expectedResult = db.exec(selectedExercise.expectedResult);
          
          // Compare results
          const isCorrect = compareResults(userResult, expectedResult);
          
          // Display results
          setQueryResult({
            userResult: userResult.length > 0 ? userResult[0] : { columns: [], values: [] },
            expectedResult: expectedResult.length > 0 ? expectedResult[0] : { columns: [], values: [] },
            isCorrect
          });
        } catch (err: any) {
          setError(`SQL Error: ${err.message}`);
        }
      } else if (['DDL', 'Constraints', 'Indexing & Performance'].includes(category)) {
        try {
          let isCorrect = false;
          if (category === 'Constraints' || selectedExercise.expectedResult.toLowerCase().startsWith("drop")){
            const normalizeSQL = (sql: string) =>
              sql
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/;$/, '')
                .toLowerCase();
      
            isCorrect =
              normalizeSQL(query) === normalizeSQL(selectedExercise.expectedResult);
          } else{
              db.exec(query);
          }
          
      
          if (selectedExercise.expectedResult.toLowerCase().startsWith("create table") || selectedExercise.expectedResult.toLowerCase().startsWith("create index")) {
            // For CREATE TABLE, use structure verification
            isCorrect = verifyTableStructure(db, selectedExercise);
          } else {
            // Normalize both queries before comparing
            const normalizeSQL = (sql: string) =>
              sql
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/;$/, '')
                .toLowerCase();
      
            isCorrect =
              normalizeSQL(query) === normalizeSQL(selectedExercise.expectedResult);
          }
      
          setQueryResult({
            message: isCorrect
              ? "Correct!"
              : "Incorrect. The SQL query doesn't match the expected result.",
            isCorrect
          });
        } catch (err: any) {
          setError(`SQL Error: ${err.message}`);
        }
      }
      
      else if (['DML'].includes(category)) {
        try {
          // Normalize helper
          const normalizeSQL = (sql: string) =>
            sql.trim().replace(/\s+/g, ' ').replace(/;$/, '').toLowerCase();
      
          const isInsert = normalizeSQL(query).startsWith('insert');
      
          if (isInsert) {
            // Use a regex to match the table name and inserted columns
            const insertRegex = /insert\s+into\s+(\w+)\s*\((.*?)\)\s*values\s*\((.*?)\)/i;
            const userMatch = query.match(insertRegex);
            const expectedMatch = selectedExercise.expectedResult.match(insertRegex);
          
            let isCorrect = false;
          
            if (userMatch && expectedMatch) {
              const [, userTable, userCols] = userMatch;
              const [, expectedTable, expectedCols] = expectedMatch;
          
              const normalize = (str: string) =>
                str
                  .split(',')
                  .map(s => s.trim().toLowerCase())
                  .sort()
                  .join(',');
          
              isCorrect =
                userTable.toLowerCase() === expectedTable.toLowerCase() &&
                normalize(userCols) === normalize(expectedCols);
            }
          
            setQueryResult({
              message: isCorrect ? 'Correct!' : 'Incorrect query structure.',
              isCorrect,
            });
          }
           else {
            // For UPDATE/DELETE — run full table state comparison
            db.exec(query);
      
            const expectedDb = new sqlDb.Database();
            Object.values(tableSchemas).forEach(schema => {
              expectedDb.exec(schema);
            });
            expectedDb.exec(selectedExercise.expectedResult);
      
            const userTables = getRelevantTableData(db, selectedExercise);
            const expectedTables = getRelevantTableData(expectedDb, selectedExercise);
      
            const isCorrect = compareTableStates(userTables, expectedTables);
      
            setQueryResult({
              userTables,
              expectedTables,
              isCorrect
            });
          }
        } catch (err: any) {
          setError(`SQL Error: ${err.message}`);
        }
      }
       else if (['DCL', 'TCL', 'Stored Procedures & Functions', 'Triggers'].includes(category)) {
        // For these types, we'll just do string comparison as they're harder to validate
        const normalize = (str: string) =>
          str.replace(/\s+/g, " ").toLowerCase().trim();
        
        const userNormalized = normalize(query);
        const expectedNormalized = normalize(selectedExercise.expectedResult);
        
        // Flexibility for these complex statements
        const isCorrect = userNormalized === expectedNormalized ||
                          userNormalized.includes(expectedNormalized) ||
                          expectedNormalized.includes(userNormalized);
        
        setQueryResult({
          message: `Query syntax ${isCorrect ? 'matches' : 'does not match'} expected pattern.`,
          isCorrect
        });
      }
      
      // Close database
      db.close();
      
    } catch (err: any) {
      setError(`Execution error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const compareResults = (userResult: any[], expectedResult: any[]) => {
    if (userResult.length !== expectedResult.length) return false;
    if (userResult.length === 0) return true; // Both empty
    
    const user = userResult[0];
    const expected = expectedResult[0];
    
    // Compare column count
    if (user.columns.length !== expected.columns.length) return false;
    
    // Compare row count
    if (user.values.length !== expected.values.length) return false;
    
    // Compare data (ignoring column names for flexibility)
    for (let i = 0; i < user.values.length; i++) {
      const userRow = user.values[i];
      const expectedRow = expected.values[i];
      
      if (userRow.length !== expectedRow.length) return false;
      
      for (let j = 0; j < userRow.length; j++) {
        // Convert to string for comparison to handle different types
        if (String(userRow[j]) !== String(expectedRow[j])) return false;
      }
    }
    
    return true;
  };
  
  const verifyTableStructure = (db: any, exercise: Exercise) => {
    try {
      // Extract table name from the exercise (this would need refinement based on actual questions)
      const tableName = extractTableName(exercise.expectedResult);
      
      if (!tableName) return false;
      
      // Get table info
      const tableInfo = db.exec(`PRAGMA table_info(${tableName})`);
      
      // If we can get table info, consider it successful for basic DDL
      return tableInfo && tableInfo.length > 0;
    } catch (err) {
      return false;
    }
  };
  
  const extractTableName = (query: string) => {
    const match = query.match(/CREATE TABLE\s+(\w+)/i) || 
                  query.match(/ALTER TABLE\s+(\w+)/i) ||
                  query.match(/DROP TABLE\s+(\w+)/i) ||
                  query.match(/CREATE INDEX\s+\w+\s+ON\s+(\w+)/i);
    
    return match ? match[1] : null;
  };
  
  const getRelevantTableData = (db: any, exercise: Exercise) => {
    // For DML exercises, we need to determine which tables might have been affected
    const tables = ['employees', 'departments']; // Add other tables as needed
    
    const results: Record<string, any> = {};
    
    tables.forEach(table => {
      try {
        const result = db.exec(`SELECT * FROM ${table}`);
        if (result && result.length > 0) {
          results[table] = result[0];
        }
      } catch (err) {
        // Table might not exist
      }
    });
    
    return results;
  };
  
  const compareTableStates = (userTables: Record<string, any>, expectedTables: Record<string, any>) => {
    // Compare the states of all tables
    const allTables = new Set([...Object.keys(userTables), ...Object.keys(expectedTables)]);
    
    for (const table of allTables) {
      const userTable = userTables[table];
      const expectedTable = expectedTables[table];
      
      // If one has a table the other doesn't
      if (!userTable || !expectedTable) return false;
      
      // Compare the table contents
      if (!compareResults([userTable], [expectedTable])) return false;
    }
    
    return true;
  };  
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("tables");
    setUser(null);
    navigate("/");
  };



  const categories = Array.from(new Set(exercises.map(ex => ex.category)));

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
    <div className="h-screen flex flex-col">
      {/* Header - fixed height */}
      <div className="flex items-center space-x-3 p-6 border-b">
        <BookOpen className="w-8 h-8 text-indigo-600" />
        <h1 className="text-3xl font-bold">Practice SQL Queries</h1>
      </div>

      {/* Main Content Area - fills remaining height */}
      <div className="flex-1 px-8 py-6 min-h-0">
        <div className="flex gap-8 h-full">
          {/* Exercise List - Left Sidebar */}
          <div className="w-1/4 flex flex-col min-h-0">
            <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col min-h-0">
              <h2 className="text-xl font-semibold mb-6 flex-none">Exercises</h2>
              
              {/* Scrollable exercise list with right padding for scrollbar */}
              <div className="overflow-y-auto flex-1 min-h-0 pr-4">
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category}>
                      <h3 className="text-lg font-medium mb-3 text-gray-700">{category}</h3>
                      <div className="space-y-3">
                        {exercises
                          .filter(ex => ex.category === category)
                          .map(exercise => (
                            <button
                              key={exercise.id}
                              onClick={() => {
                                handleExerciseSelect(exercise);
                                setShowHint(false);
                                setQuery('');
                              }}
                              className={`w-full text-left p-4 rounded-lg border transition
                                ${selectedExercise?.id === exercise.id
                                  ? 'border-indigo-500 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Exercise {exercise.id}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium
                                  ${exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                    exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'}`}>
                                  {exercise.difficulty}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Details and Editor - Right Side */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedExercise ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col min-h-0">
                {/* Fixed header section */}
                <div className="flex-none">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Exercise {selectedExercise.id}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${selectedExercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        selectedExercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {selectedExercise.difficulty}
                    </span>
                  </div>
                </div>

                {/* Scrollable content with right padding for scrollbar */}
                <div className="overflow-y-auto flex-1 min-h-0 pr-4">
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Schema Reference</h3>
                    <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
                      {tableSchemas.employees}
                      {'\n'}
                      {tableSchemas.departments}
                    </pre>
                  </div>

                  <p className="text-gray-600 mb-8">{selectedExercise.question}</p>

                  {showHint && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
                      <p className="text-blue-700">{selectedExercise.hints[0]}</p>
                    </div>
                  )}

                  <div className="mb-6">
                  <SQLEditor 
                    query={query}
                    setQuery={setQuery}
                    onExecute={checkAnswer}
                                          />

                  </div>

                  {/* Query Results Section */}
                  {isLoading && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                      <span className="text-blue-600 font-medium">Executing query...</span>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="text-red-700 font-medium text-lg mb-2">Error</h3>
                      <p className="text-red-600 font-mono text-sm whitespace-pre-wrap">{error}</p>
                    </div>
                  )}

                  {queryResult && (
                    <div className="mt-6 flex flex-col space-y-6">
                      {/* Feedback Message */}
                      <div className={`p-4 rounded-lg ${
                        queryResult.isCorrect 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-amber-50 border border-amber-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          {queryResult.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-amber-600 mr-2" />
                          )}
                          <h3 className={`font-medium text-lg ${
                            queryResult.isCorrect ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            {queryResult.isCorrect ? 'Correct!' : 'Incorrect. Keep trying!'}
                          </h3>
                        </div>
                        {queryResult.message && (
                          <p className={`mt-1 ${
                            queryResult.isCorrect ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {queryResult.message}
                          </p>
                        )}
                      </div>

                      {/* Query Results Table */}
                      {queryResult.userResult && (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-gray-700 font-medium flex items-center">
                              <Database className="w-4 h-4 mr-2 text-indigo-500" />
                              Your Query Result:
                            </h3>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {queryResult.userResult.columns.map((col: string, i: number) => (
                                    <th 
                                      key={i}
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {queryResult.userResult.values.map((row: any[], i: number) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    {row.map((cell, j) => (
                                      <td 
                                        key={j}
                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono"
                                      >
                                        {String(cell)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                {queryResult.userResult.values.length === 0 && (
                                  <tr>
                                    <td 
                                      colSpan={queryResult.userResult.columns.length || 1}
                                      className="px-6 py-4 text-center text-sm text-gray-500 italic"
                                    >
                                      No results
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Updated Tables Section */}
                      {queryResult.userTables && Object.keys(queryResult.userTables).length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-medium text-gray-700">
                            Updated Table Data:
                          </h3>
                          {Object.entries(queryResult.userTables).map(([tableName, table]: [string, any]) => (
                            <div key={tableName} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="text-gray-700 font-medium flex items-center">
                                  <Database className="w-4 h-4 mr-2 text-indigo-500" />
                                  {tableName}
                                </h4>
                              </div>
                              
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      {table.columns.map((col: string, i: number) => (
                                        <th 
                                          key={i}
                                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {table.values.map((row: any[], i: number) => (
                                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        {row.map((cell, j) => (
                                          <td 
                                            key={j}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono"
                                          >
                                            {String(cell)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <ChevronRight className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">Select an exercise to begin practicing</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}