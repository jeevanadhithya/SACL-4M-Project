-- ============================================================================
-- SAKTHI AUTO COMPONENT LIMITED - CONSULTANCY FORMS & MACHINE SHOP DATABASE
-- Compatible with SQL Server Management Studio (SSMS) 2019 / 2022 / 2025
-- ============================================================================

-- 1. Create MachineShop Database if it does not already exist
IF DB_ID('MachineShop') IS NULL
BEGIN
    PRINT 'Creating database MachineShop...';
    CREATE DATABASE MachineShop;
END
GO

USE MachineShop;
GO

-- 2. Drop existing tables if re-initializing (Optional, commented out for safety)
-- DROP TABLE IF EXISTS ConsultancyForms;
-- DROP TABLE IF EXISTS Users;

-- ============================================================================
-- 3. USERS TABLE FOR ROLE-BASED ACCESS CONTROL (JWT AUTH)
-- ============================================================================
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    PRINT 'Creating Users table...';
    CREATE TABLE [dbo].[Users] (
        [id] [int] IDENTITY(1,1) NOT NULL,
        [username] [varchar](50) NOT NULL,
        [password] [varchar](255) NOT NULL,
        [role] [varchar](30) NOT NULL,
        [employeeId] [varchar](50) NOT NULL,
        [department] [varchar](100) NULL DEFAULT 'General',
        [createdAt] [datetime] NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_Users_Username] UNIQUE ([username]),
        CONSTRAINT [UQ_Users_EmployeeId] UNIQUE ([employeeId])
    );
END
GO

-- Seed Default Production Users (Default Password for all: Password@123)
-- Hash generated via bcrypt (10 rounds): $2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i
IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE employeeId = 'EMP001')
BEGIN
    INSERT INTO dbo.Users (username, password, role, employeeId, department)
    VALUES ('admin', '$2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i', 'admin', 'EMP001', 'Management');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE employeeId = 'EMP002')
BEGIN
    INSERT INTO dbo.Users (username, password, role, employeeId, department)
    VALUES ('supervisor1', '$2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i', 'supervisor', 'EMP002', 'ShopFloor');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE employeeId = 'EMP003')
BEGIN
    INSERT INTO dbo.Users (username, password, role, employeeId, department)
    VALUES ('cft_leader', '$2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i', 'cft', 'EMP003', 'CrossFunctionalTeam');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE employeeId = 'EMP004')
BEGIN
    INSERT INTO dbo.Users (username, password, role, employeeId, department)
    VALUES ('planthead', '$2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i', 'planthead', 'EMP004', 'PlantHead');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE employeeId = 'EMP005')
BEGIN
    INSERT INTO dbo.Users (username, password, role, employeeId, department)
    VALUES ('operator1', '$2b$10$oPmF0JwUOAcWVXqgwW1kKeul5MdZd5aTdBSg76PzSwrMRaEFxSz9i', 'operator', 'EMP005', 'Machining');
END
GO

-- ============================================================================
-- 4. CONSULTANCY FORMS TABLE (Unified Record Store for All 10 Forms)
-- Stores full form state, dynamic checkboxes, particulars rows, and sign-offs
-- ============================================================================
IF OBJECT_ID('dbo.ConsultancyForms', 'U') IS NULL
BEGIN
    PRINT 'Creating ConsultancyForms table...';
    CREATE TABLE [dbo].[ConsultancyForms] (
        [id] [int] IDENTITY(1,1) NOT NULL,
        [formType] [varchar](100) NOT NULL,         -- e.g., 'process-change-requisition', 'feasibility-report', etc.
        [recordKey] [varchar](100) NOT NULL,        -- PCRF No, SL No, Part No, or Date Key
        [partName] [varchar](255) NULL,
        [customer] [varchar](255) NULL,
        [status] [varchar](50) NOT NULL DEFAULT 'Pending Approval', -- 'Draft', 'Pending Approval', 'Approved', 'Rejected'
        [formData] [nvarchar](max) NOT NULL,        -- Full JSON snapshot of form inputs, tables, checkboxes
        [remarks] [nvarchar](max) NULL,
        [createdBy] [varchar](50) NULL,
        [lastUpdatedBy] [varchar](50) NULL,
        [createdAt] [datetime] NOT NULL DEFAULT GETDATE(),
        [updatedAt] [datetime] NOT NULL DEFAULT GETDATE(),
        CONSTRAINT [PK_ConsultancyForms] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [UQ_Form_Type_RecordKey] UNIQUE ([formType], [recordKey])
    );

    CREATE NONCLUSTERED INDEX [IX_ConsultancyForms_FormType] ON [dbo].[ConsultancyForms] ([formType]);
    CREATE NONCLUSTERED INDEX [IX_ConsultancyForms_Status] ON [dbo].[ConsultancyForms] ([status]);
    CREATE NONCLUSTERED INDEX [IX_ConsultancyForms_PartName] ON [dbo].[ConsultancyForms] ([partName]);
END
GO

-- ============================================================================
-- 5. SPECIFIC NORMALIZED TABLES FOR AUDIT TRAIL & FAST SEARCH
-- ============================================================================

-- A. Process Change Requisition Form (QF/07/MRO-15 Rev.03)
IF OBJECT_ID('dbo.ProcessChangeRequisition', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[ProcessChangeRequisition] (
        [id] [int] IDENTITY(1,1) PRIMARY KEY,
        [pcrfNo] [varchar](100) NOT NULL UNIQUE,
        [requisitionBy] [varchar](100) NULL,
        [department] [varchar](100) NULL,
        [customer] [varchar](100) NULL,
        [partName] [varchar](255) NULL,
        [partNo] [varchar](100) NULL,
        [formDate] [date] NULL,
        [isMan] [bit] DEFAULT 0,
        [isMachine] [bit] DEFAULT 0,
        [isMaterial] [bit] DEFAULT 0,
        [isMethod] [bit] DEFAULT 0,
        [internalApprovalStatus] [varchar](50) DEFAULT 'Pending',
        [approvingAuthority] [varchar](100) DEFAULT 'PLANT HEAD',
        [createdAt] [datetime] DEFAULT GETDATE()
    );
END
GO

-- B. Feasibility Report for Change Request (QF/07/MRO-02)
IF OBJECT_ID('dbo.FeasibilityReports', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[FeasibilityReports] (
        [id] [int] IDENTITY(1,1) PRIMARY KEY,
        [slNo] [varchar](100) NOT NULL UNIQUE,
        [fromDept] [varchar](100) NULL,
        [toTeam] [varchar](100) DEFAULT 'CFT',
        [customer] [varchar](100) NULL,
        [partName] [varchar](255) NULL,
        [partNo] [varchar](100) NULL,
        [reportDate] [date] NULL,
        [isFeasible] [bit] NULL,
        [forwardedTo] [varchar](100) NULL,
        [createdAt] [datetime] DEFAULT GETDATE()
    );
END
GO

PRINT '=======================================================';
PRINT '✅ SAKTHI AUTO COMPONENT DATABASE SETUP COMPLETE!';
PRINT 'Database: MachineShop';
PRINT 'Default Users:';
PRINT '  - admin       (Password: Password@123, Role: admin)';
PRINT '  - supervisor1 (Password: Password@123, Role: supervisor)';
PRINT '  - cft_leader  (Password: Password@123, Role: cft)';
PRINT '  - planthead   (Password: Password@123, Role: planthead)';
PRINT '  - operator1   (Password: Password@123, Role: operator)';
PRINT '=======================================================';
GO

