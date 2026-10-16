-- Employee Leave Management System
-- PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
username VARCHAR(100) UNIQUE NOT NULL,
email VARCHAR(200) UNIQUE NOT NULL,
password_hash VARCHAR(255) NOT NULL,
role VARCHAR(30) DEFAULT 'EMPLOYEE',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
id SERIAL PRIMARY KEY,
name VARCHAR(100) UNIQUE
);

CREATE TABLE IF NOT EXISTS employees (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
employee_code VARCHAR(50) UNIQUE,
first_name VARCHAR(100),
last_name VARCHAR(100),
department_id INTEGER REFERENCES departments(id),
manager_id INTEGER REFERENCES employees(id),
joining_date DATE,
active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS leave_types (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
default_days INTEGER
);

CREATE TABLE IF NOT EXISTS leave_requests (
id SERIAL PRIMARY KEY,
employee_id INTEGER REFERENCES employees(id),
leave_type_id INTEGER REFERENCES leave_types(id),
from_date DATE,
to_date DATE,
reason TEXT,
status VARCHAR(30) DEFAULT 'PENDING',
manager_comment TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
id SERIAL PRIMARY KEY,
employee_id INTEGER REFERENCES employees(id),
file_name VARCHAR(255),
s3_key VARCHAR(500),
uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
