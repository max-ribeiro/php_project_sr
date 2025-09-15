CREATE TABLE cidadaos (
    id_cidadao NUMERIC (9,0) IDENTITY NOT NULL,
    nome VARCHAR(200) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    telefone VARCHAR(15),
    status BIT DEFAULT 0,
    CONSTRAINT PK_dbo_cidadaos PRIMARY KEY (id_cidadao),
    CONSTRAINT UQ_cidadaos_cpf UNIQUE (cpf) -- garante CPF único
);

CREATE TABLE usuarios (
    id_usuario NUMERIC(9,0) IDENTITY NOT NULL,
    nome VARCHAR(200) NOT NULL,
	username VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    status BIT DEFAULT 1, -- 1 = ativo, 0 = inativo
    data_criacao DATETIME DEFAULT GETDATE(),
	data_atualizacao DATETIME NULL,         -- será atualizada nas alterações
    CONSTRAINT PK_usuarios PRIMARY KEY (id_usuario)
);

CREATE TABLE enderecos (
    id_endereco NUMERIC(9,0) IDENTITY NOT NULL,
    id_cidadao NUMERIC(9,0) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    principal BIT NOT NULL DEFAULT 0,
    data_criacao DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME NULL,
    CONSTRAINT PK_enderecos PRIMARY KEY (id_endereco),
    CONSTRAINT FK_enderecos_cidadaos FOREIGN KEY (id_cidadao) REFERENCES cidadaos(id_cidadao)
);

-- Novo usuario
INSERT INTO usuarios (
    nome,
	username,
    email,
    senha_hash
) VALUES (
    'John Doe',
	'johnDoe',
    'johndoe@example.com',
    'e10adc3949ba59abbe56e057f20f883e'  -- hash MD5 da senha 123456
);

-- cidadaos para teste
INSERT INTO cidadaos (nome, cpf, telefone, status) VALUES
('Ana Souza',        '123.456.789-00', '(11) 91234-5678', 1),
('Bruno Lima',       '987.654.321-00', '(21) 99876-5432', 1),
('Carla Mendes',     '456.789.123-00', '(31) 93456-7890', 0),
('Diego Oliveira',   '321.654.987-00', '(41) 98765-4321', 1),
('Eduarda Castro',   '741.852.963-00', '(51) 92345-6789', 1),
('Felipe Martins',   '159.753.486-00', '(61) 93456-1234', 0),
('Gabriela Torres',  '258.369.147-00', '(71) 91234-9876', 1),
('Henrique Alves',   '369.258.741-00', '(81) 95678-4321', 1),
('Isabela Ferreira', '852.741.963-00', '(91) 97890-1234', 0),
('João Pereira',     '963.852.741-00', '(85) 91234-5678', 1);