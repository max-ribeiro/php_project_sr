<?php
session_start();
require_once(__DIR__ . '/../../../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'functions.php');
require_once(_DIR_HOME_ . 'api/v1/RestApi.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

class CidadaosRestApi extends RestApi
{
    public $inputMap = [
        'cidadaos' => [
            'table' => 'cidadaos',
            'key' => [
                'id_cidadao',
            ],
            'columns' => [
                'id_cidadao' => 'id_cidadao',
                'nome'       => 'nome',
                'cpf'        => 'cpf',
                'telefone'   => 'telefone',
                'status'     => 'status',
            ],
        ],
    ];

    public function consultar()
    {
        $params = $this->getParams();
        $where = [" WHERE 1=1 "];

        if (!empty($params['nome'])) {
            $where[] = " AND nome LIKE '%{$params['nome']}%' ";
        }

        if (!empty($params['cpf'])) {
            $where[] = " AND cpf = '{$params['cpf']}' ";
        }

        if (!empty($params['telefone'])) {
            $where[] = " AND telefone = '{$params['telefone']}' ";
        }

        $where = join("\n", $where);

        $sql = "
        SET NOCOUNT ON;
                    
        SELECT id_cidadao, nome, cpf, telefone, status
        FROM cidadaos WITH(NOLOCK)
        {$where}
        ";

        $items = $this->db->query($sql)->fetchAllArray();

        foreach ($items as &$item) {
            $item['nome_status'] = ($item['status'] == 1) ? 'Ativo' : 'Inativo';
        }

        $response = [
            'total' => count($items),
            'items' => $items,
        ];

        return $this->setResponse($response);
    }

    public function inserir()
    {
        $params = $this->getParams();

        $dadosMapeados = $this->mapRequestToDatabase($params, 'cidadaos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

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

        $dadosMapeados = $this->mapRequestToDatabase($params, 'cidadaos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

        $id_cidadao = $dadosMapeados['id_cidadao'];
        unset($dadosMapeados['id_cidadao']); // não atualiza a PK

        $camposUpdate = join(' = ?, ', array_keys($dadosMapeados)) . ' = ?';
        $valoresUpdate = array_values($dadosMapeados);
        $valoresUpdate[] = $id_cidadao;

        $sql = "
        UPDATE cidadaos SET
            {$camposUpdate}
        WHERE id_cidadao = ?
        ";

        $this->db->query($sql, $valoresUpdate);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }

    public function excluir()
    {
        $params = $this->getParams();

        $dadosMapeados = $this->mapRequestToDatabase($params, 'cidadaos');
        $dadosMapeados = $this->utf8DecodeArray($dadosMapeados);

        $id_cidadao = $dadosMapeados['id_cidadao'];

        $sql = "
        DELETE FROM cidadaos
        WHERE id_cidadao = ?
        ";

        $this->db->query($sql, [$id_cidadao]);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }
}
