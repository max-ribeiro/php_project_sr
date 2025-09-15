IF DB_ID('sigo_dados') IS NOT NULL
    DROP DATABASE sigo_dados;
CREATE DATABASE sigo_dados
COLLATE Latin1_General_100_CI_AI_SC_UTF8;

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'dev')
BEGIN
    CREATE LOGIN dev WITH PASSWORD = '@Developerd',
    CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
END;

USE sigo_dados;
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'dev')
BEGIN
    CREATE USER dev FOR LOGIN dev WITH DEFAULT_SCHEMA = dbo;
END;

ALTER ROLE db_datareader ADD MEMBER dev;
ALTER ROLE db_datawriter ADD MEMBER dev;
ALTER ROLE db_ddladmin ADD MEMBER dev;
