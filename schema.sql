-- Create accounts table
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    title VARCHAR(50) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    acceptTerms BOOLEAN,
    role ENUM('Admin', 'User') NOT NULL,
    verificationToken VARCHAR(255),
    verified DATETIME,
    resetToken VARCHAR(255),
    resetTokenExpires DATETIME,
    passwordReset DATETIME,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    isVerified BOOLEAN DEFAULT FALSE
);

-- Create refresh tokens table
CREATE TABLE refreshTokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255),
    expires DATETIME,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdByIp VARCHAR(255),
    revoked DATETIME,
    revokedByIp VARCHAR(255),
    replacedByToken VARCHAR(255),
    isExpired BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    accountId INT,
    FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create departments table
CREATE TABLE Departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Create employees table
CREATE TABLE Employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId VARCHAR(50) NOT NULL UNIQUE,
    userId INT NOT NULL,
    position VARCHAR(100) NOT NULL,
    departmentId INT NOT NULL,
    hireDate DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    FOREIGN KEY (userId) REFERENCES accounts(id),
    FOREIGN KEY (departmentId) REFERENCES Departments(id)
);

-- Create requests table
CREATE TABLE Requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME,
    FOREIGN KEY (employeeId) REFERENCES Employees(id)
);

-- Create request items table
CREATE TABLE RequestItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    requestId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (requestId) REFERENCES Requests(id) ON DELETE CASCADE
);

-- Create workflows table
CREATE TABLE Workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    startDate DATE NOT NULL,
    endDate DATE,
    description TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME,
    FOREIGN KEY (employeeId) REFERENCES Employees(id)
);

-- Insert default admin user
INSERT INTO accounts (email, password, title, firstName, lastName, role, verified, isActive, isVerified) 
VALUES ('admin@admin.com', 'admin123', 'Mr', 'Admin', 'User', 'Admin', NOW(), true, true); 