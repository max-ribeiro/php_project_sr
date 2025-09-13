CREATE TABLE cidadaos (
	id_cidadao NUMERIC (9,0) IDENTITY NOT NULL,
	nome VARCHAR(200) NOT NULL,
	cpf VARCHAR(14) NOT NULL,
	telefone VARCHAR(15),
	status BIT DEFAULT 0,
	CONSTRAINT [PK_dbo.cidadaos] PRIMARY KEY (id_cidadao)
)

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
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    data_criacao DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME NULL,
    CONSTRAINT PK_enderecos PRIMARY KEY (id_endereco)
);

-- Um usuario pode ter varios endeçõs e um endereço pode pertencer a mais de um funcionario (em caso de cadastros de membro da mesma familia| moram na mesma casa)
CREATE TABLE cidadao_endereco (
    id_cidadao NUMERIC(9,0) NOT NULL,
    id_endereco NUMERIC(9,0) NOT NULL,
    data_criacao DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_cidadao_endereco PRIMARY KEY (id_cidadao, id_endereco),
    CONSTRAINT FK_cidadao_endereco_cidadao FOREIGN KEY (id_cidadao)
        REFERENCES cidadaos(id_cidadao)
        ON DELETE CASCADE,
    CONSTRAINT FK_cidadao_endereco_endereco FOREIGN KEY (id_endereco)
        REFERENCES enderecos(id_endereco)
        ON DELETE CASCADE
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
