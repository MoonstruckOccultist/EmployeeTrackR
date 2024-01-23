SELECT e.id, 
e.first_name, 
e.last_name, 
role.title AS role, 
department.name AS department, 
role.salary,
CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM employee e
INNER JOIN
role ON e.role_id = role.id
INNER JOIN
department ON role.department_id = department.id
LEFT JOIN
employee m ON e.manager_id = m.id;

-- SELECT role.title, role.id, department.name, role.salary
-- FROM role
-- JOIN department ON role.department_id = department.id;