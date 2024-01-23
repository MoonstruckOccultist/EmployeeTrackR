// const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: 'root',
        // TODO: Add MySQL password here
        password: '',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

function padString(str, length) {
    while (str.length < length) {
        str += ' ';
    }
    return str;
}

function displayTable(X) {
    {
        console.log('\n');
        const maxLength = Object.values(X)
            .reduce((max, obj) => {
                const values = Object.values(obj);
                const maxValLength = Math.max(...values.map(val => String(val).length));
                return Math.max(max, maxValLength);
            }, 0);
        const columns = Object.keys(X[0]);
        const spacedColumns = columns.map(str => padString(str, maxLength))
        console.log('\x1b[33m', spacedColumns.join('\t|'));
        X.forEach((row) => {
            const values = Object.values(row);
            const stringValues = values.map(item => String(item));
            const spacedValues = stringValues.map(str => padString(str, maxLength));
            console.log('\x1b[37m', spacedValues.join('\t|'));
        });
        console.log('\n\n\n\n\n\n\n');
    }
}

let depList = [];

function getDepList() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM department', (err, res) => {
            if (err) {
                reject(err);
            } else {
                const list = res.map(dep => dep.name);
                resolve(list);
            }
        });
    });
};

let roleList = [];

function getRoleList() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM role', (err, res) => {
            if (err) {
                reject(err);
            } else {
                const list = res.map(rol => rol.title);
                resolve(list);
            }
        });
    });
}

let employeeList = [];

function getEmpList() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM employee', (err, res) => {
            if (err) {
                reject(err);
            } else {
                const list = res.map(emps => `${emps.first_name} ${emps.last_name}`);
                resolve(list);
            }
        });
    });
}

function addDepartment() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'newDep',
                message: 'What would you like the new department to be named?'
            }
        ]).then((data) => {
            console.log(data.newDep);
            db.query('INSERT INTO department (name) VALUES  (?);', data.newDep, (err, result) => {
                if (err) {
                    console.log('Error with inserting Dep');
                } else {
                    console.log(`${data.newDep} Department successfully added`);
                    console.log('\n');
                    startProg();
                }
            })

        })
}

function addRole() {
    let questions = [
        {
            type: 'input',
            name: 'newRole',
            message: 'What would you like the new role to be named?'
        },
        {
            type: 'input',
            name: 'salary',
            message: "What's the new role's salary?",
            validate(X) {
                let inp = Math.round(X);
                if (Number.isNaN(inp)) {
                    return 'Input is not a number';
                } else {
                    return true;
                }
            }
        },
        {
            type: 'list',
            name: 'roleDep',
            message: "What would you like the new role's department?",
            choices: []
        }
    ];
    getDepList().then(listRes => {
        questions[2].choices = listRes;
        depList = listRes;
        return inquirer.prompt(questions);
    }).then((data) => {
        let newRole = data.newRole
        let salary = Math.round(data.salary);
        let selectedDep = data.roleDep;
        let depID;
        for (var i = 0; depList.length > i; i++) {
            if (depList[i] === selectedDep) {
                depID = i + 1;
                break;
            }
        }
        db.query('INSERT INTO role (title, salary, department_id) VALUES  (?, ?, ?);', [newRole, salary, depID], (err, result) => {
            if (err) {
                console.log(`Error with inserting role: ${err}`);
                startProg();
            } else {
                console.log(`${data.newRole} role successfully added`);
                console.log('\n');
                startProg();
            }
        })
    })
}


function addEmployee() {
    // f&l name, role, manager
    let questions = [
        {
            type: 'input',
            name: 'fName',
            message: "Enter employee's first name: "
        },
        {
            type: 'input',
            name: 'lName',
            message: "Enter employee's last name"
        },
        {
            type: 'list',
            name: 'empRole',
            message: "Choose employee's role",
            choices: []
        },
        {
            type: 'list',
            name: 'empMan',
            message: "Choose employee's manager",
            choices: []
        }
    ];
    getRoleList().then(RlistRes => {
        questions[2].choices = RlistRes;
        roleList = RlistRes;
        return getEmpList();
    }).then(ElistRes => {
        questions[3].choices = ElistRes;
        questions[3].choices.push('NULL');
        employeeList = ElistRes;
        return inquirer.prompt(questions);
    }).then((data) => {
        let fName = data.fName;
        let lName = data.lName;

        let selectedRole = data.empRole;
        let roleID;
        for (var i = 0; roleList.length > i; i++) {
            if (roleList[i] == selectedRole) {
                roleID = i + 1;
                break;
            }
        }

        let selectedMang = data.empMan;
        let managerID;
        if (selectedMang == 'NULL') {
            managerID = null
        } else {
            for (var i = 0; employeeList.length > i; i++) {
                if (employeeList[i] == selectedMang) {
                    managerID = i + 1;
                    break;
                }
            }
        }
        db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES  (?, ?, ?, ?);', [fName, lName, roleID, managerID], (err, result) => {
            if (err) {
                console.log(`Error with inserting employee: ${err}`);
                startProg();
            } else {
                console.log(`${fName} successfully added as an employee`);
                console.log('\n');
                startProg();
            }
        })
    })
}

function updateEmployee() {
    let questions = [
        {
            type: 'list',
            name: 'emp',
            message: "Choose employee you want to update:",
            choices: []
        },
        {
            type: 'list',
            name: 'empRole',
            message: "Choose employee's new role",
            choices: []
        }
    ];
    getRoleList().then(RlistRes => {
        questions[1].choices = RlistRes;
        roleList = RlistRes;
        return getEmpList();
    }).then(ElistRes => {
        questions[0].choices = ElistRes;
        employeeList = ElistRes;
        return inquirer.prompt(questions);
    }).then((data) => {
        let selectedEmp = data.emp;
        let empID;
        for (var i = 0; employeeList.length > i; i++) {
            if (employeeList[i] == selectedEmp) {
                empID = i + 1;
                break;
            }
        }

        let selectedRole = data.empRole
        let roleID;
        for (var i = 0; roleList.length > i; i++) {
            if (roleList[i] == selectedRole) {
                roleID = i + 1;
                break;
            }
        }

        db.query('UPDATE employee SET role_id = ? WHERE id = ?;', [roleID, empID], (err, result) => {
            if (err) {
                console.log(`Error with updating employee: ${err}`);
                startProg();
            } else {
                console.log(`${selectedEmp}'s role successfully updated`);
                console.log('\n');
                startProg();
            }
        })
    })
}

function startProg() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: [
                    'view all departments',
                    'view all roles',
                    'view all employees',
                    'add a department',
                    'add a role',
                    'add an employee',
                    'update employee role'
                ]
            },
        ]).then((data) => {
            let choice = data.choice
            let what2Do = '';
            what2Do = '';
            switch (choice) {
                case 'view all departments':
                    db.query(`SELECT * FROM department`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            displayTable(result);

                        }
                    })
                    break;
                case 'view all roles':
                    db.query(`SELECT role.title, role.id, department.name, role.salary FROM role JOIN department ON role.department_id = department.id;`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            displayTable(result);
                        }
                    })
                    break;
                case 'view all employees':
                    db.query(`SELECT e.id, e.first_name, e.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee m ON e.manager_id = m.id;`, (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            displayTable(result);
                        }
                    })
                    break;
                case 'add a department':
                    what2Do = 'D'
                    break;
                case 'add a role':
                    what2Do = 'R'
                    break;
                case 'add an employee':
                    what2Do = 'E'
                    break;
                case 'update employee role':
                    what2Do = 'UpE'
                    break;
            };
            return what2Do;
        }).then((data2) => {
            switch (data2) {
                default:
                    startProg();
                    break;
                case 'D':
                    addDepartment();
                    break;
                case 'R':
                    addRole();
                    break;
                case 'E':
                    addEmployee();
                    break;
                case 'UpE':
                    updateEmployee();
                    break;
            };
        })
}

function getDepList() {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM department', (err, res) => {
            if (err) {
                reject(err);
            } else {
                const list = res.map(dep => dep.name);
                resolve(list);
            }
        });
    });
}

startProg();


