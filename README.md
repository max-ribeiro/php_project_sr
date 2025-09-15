# Executando o projeto

`docker compose up -d`
`docker exec -it php74`
`composer install`

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
-H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2huRG9lIiwiaWF0IjoxNzU3OTMwNDc3LCJleHAiOjE3NTc5Mzc2Nzd9.zHpjyedV3XGLHULrDUI3rHbOMAuD2Yz95orx4cW9UfY" \
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