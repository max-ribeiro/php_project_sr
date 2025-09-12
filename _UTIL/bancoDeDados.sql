CREATE TABLE cidadaos (
	id_cidadao NUMERIC (9,0) IDENTITY NOT NULL,
	nome VARCHAR(200) NOT NULL,
	cpf VARCHAR(14) NOT NULL,
	telefone VARCHAR(15),
	status BIT DEFAULT 0,
	CONSTRAINT [PK_dbo.cidadaos] PRIMARY KEY (id_cidadao)
)