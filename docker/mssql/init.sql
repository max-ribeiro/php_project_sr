-- Criar banco de dados
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'sigo_dados')
BEGIN
    CREATE DATABASE sigo_dados;
END
GO

-- Usar o banco de dados
USE sigo_dados;
GO

-- Criar usuário 'dev' se não existir
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'dev')
BEGIN
    CREATE LOGIN dev WITH PASSWORD = '@Developerd';
END
GO

-- Criar usuário no banco de dados
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'dev')
BEGIN
    CREATE USER dev FOR LOGIN dev;
    ALTER ROLE db_owner ADD MEMBER dev;
END
GO

-- Conceder permissões necessárias
GRANT CONNECT TO dev;
GRANT CREATE TABLE TO dev;
GRANT CREATE PROCEDURE TO dev;
GRANT CREATE VIEW TO dev;
GO
