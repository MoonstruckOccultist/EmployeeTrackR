INSERT INTO department (name)
VALUES  ("Administration"),
        ("HR"),
        ("Security"),
        ("Operations");

INSERT INTO role (title, salary, department_id)
VALUES  ("CEO", 999999999.99, 1),
        ("HR rep", 1000000.000, 2),
        ("Bodyguard", 1990092.80, 3),
        ("Agent", 455455.12, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("DIO", "Brando", 1, NULL),
        ("Enya", "Geil", 2, 1),
        ("Vanilla", "ICE", 3, 1),
        ("Pet", "Shop", 3, 1),
        ("Boingo", "Zenyatta", 4, 1),
        ("Hol", "Horse", 4, 5),
        ("Terence T.", "DArby", 3, 1),
        ("Daniel J.", "DArby", 4, 1),
        ("Jay", "Geil", 4, 6),
        ("Oingo", "Zenyatta", 4, 5);
