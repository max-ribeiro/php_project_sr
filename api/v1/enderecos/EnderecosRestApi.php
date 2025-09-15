<?php
session_start();
require_once(__DIR__ . '/../../../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'functions.php');
require_once(_DIR_HOME_ . 'api/v1/RestApi.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

class EnderecosRestApi extends RestApi
{
    public $inputMap = [
        'enderecos' => [
            'table' => 'enderecos',
            'key' => [
                'id_endereco',
            ],
            'columns' => [
                'id_endereco' => 'id_endereco',
                'id_cidadao' => 'id_cidadao',
                'logradouro' => 'logradouro',
                'numero' => 'numero',
                'bairro' => 'bairro',
                'cidade' => 'cidade',
                'uf' => 'uf',
                'cep' => 'cep',
                'principal' => 'principal',
                'data_criacao' => 'data_criacao',
                'data_atualizacao' => 'data_atualizacao',
            ],
        ],
    ];

    public function consultar()
    {
        $params = $this->getParams();
        $where = [" WHERE 1=1 "];

        if (!empty($params['id_cidadao'])) {
            $where[] = " AND id_cidadao = '{$params['id_cidadao']}' ";
        }

        if (!empty($params['logradouro'])) {
            $where[] = " AND logradouro LIKE '%{$params['logradouro']}%' ";
        }

        if (!empty($params['cidade'])) {
            $where[] = " AND cidade LIKE '%{$params['cidade']}%' ";
        }

        if (!empty($params['uf'])) {
            $where[] = " AND uf = '{$params['uf']}' ";
        }

        if (!empty($params['cep'])) {
            $where[] = " AND cep = '{$params['cep']}' ";
        }

        $where = join("\n", $where);

        $sql = "
        SET NOCOUNT ON;
                    
        SELECT id_endereco, id_cidadao, logradouro, numero, bairro, cidade, uf, cep, principal, 
            data_criacao, data_atualizacao
        FROM enderecos WITH(NOLOCK)
        {$where}
        ORDER BY principal DESC, data_criacao DESC
        ";

        $items = $this->db->query($sql)->fetchAllArray();

        $response = [
            'total' => count($items),
            'items' => $items,
        ];

        return $this->setResponse($response);
    }

    public function inserir()
    {
        $params = $this->getParams();

        $dadosMapeados = $this->mapRequestToDatabase($params, 'enderecos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

        // Garantir que id_cidadao seja incluído
        if (empty($dadosMapeados['id_cidadao'])) {
            throw new Exception("O campo id_cidadao é obrigatório.");
        }

        // Definir principal como 0 se não informado
        if (!isset($dadosMapeados['principal'])) {
            $dadosMapeados['principal'] = 0;
        }

        $camposInsert = join(',', array_keys($dadosMapeados));
        $identificacaoParametros = join(',', array_fill(0, count($dadosMapeados), '?'));
        $sqlParams = array_values($dadosMapeados);

        $sql = "
        INSERT INTO enderecos
            ({$camposInsert})
        VALUES
            ({$identificacaoParametros})
        ";

        $this->db->query($sql, $sqlParams);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }

    public function editar()
    {
        $params = $this->getParams();

        $dadosMapeados = $this->mapRequestToDatabase($params, 'enderecos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

        $id_endereco = $dadosMapeados['id_endereco'];
        unset($dadosMapeados['id_endereco']); // não atualiza a PK

        // Atualizar data_atualizacao se fornecida ou definir como GETDATE()
        if (!isset($dadosMapeados['data_atualizacao'])) {
            $dadosMapeados['data_atualizacao'] = date('Y-m-d H:i:s');
        }

        $camposUpdate = join(' = ?, ', array_keys($dadosMapeados)) . ' = ?';
        $valoresUpdate = array_values($dadosMapeados);
        $valoresUpdate[] = $id_endereco;

        $sql = "
        UPDATE enderecos SET
            {$camposUpdate}
        WHERE id_endereco = ?
        ";

        $this->db->query($sql, $valoresUpdate);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }

    public function excluir()
    {
        $params = $this->getParams();

        $dadosMapeados = $this->mapRequestToDatabase($params, 'enderecos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

        $id_endereco = $dadosMapeados['id_endereco'];

        $sql = "
        DELETE FROM enderecos
        WHERE id_endereco = ?
        ";

        $this->db->query($sql, [$id_endereco]);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }
}