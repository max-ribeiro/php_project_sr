# Executando o projeto
```bash
docker compose up -d
docker exec -it php74
composer install
```
sera necessário criar a base e o usuário do SQL Server;
Scripts na pasta _UTIL/baseDbCreation.sql

# API
## Autenticação:
``` bash
curl -X POST http://localhost:8080/api/auth/auth.php \
-H "Content-Type: application/json" \
-d '{"login":"johnDoe","senha":"12345"}'

```
## Consulta de cidadão
``` bash
curl -X POST http://localhost:8080/api/v1/action.php \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_aqui" \
-d '{
  "_class": "cidadaos", 
  "_method": "consultar",
  "status": 1,
  "pageNumber": 1,
  "cidadao": "",
  "tpBusca": "nome",
  "state": 1
}'
```

## Insert
``` bash
curl -X POST http://localhost:8080/api/v1/action.php \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_aqui" \
-d '{
  "_class": "cidadaos",
  "_method": "inserir",
  "id_cidadao": "",
  "nome": "FUlano de Tal",
  "cpf": "444.444.444-44",
  "telefone": "(33)33333-3333"
}'
```

## Insert Endereço
``` bash
curl -X POST http://localhost:8080/api/v1/action.php \
-H "Content-Type: application/json" \
-H "Authorization: Bearer seu_token_aqui" \
-d '{
  "_class": "enderecos",
  "_method": "inserir",
  "id_cidadao": 77,
  "logradouro": "Rua dos Bytes",
  "numero": 410,
  "bairro": "Centro",
  "cidade": "Ubatuba",            
  "uf": "SP",
  "cep": "12215-222"
}'

```