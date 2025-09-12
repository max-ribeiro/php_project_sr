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
                'nome' => 'nome',
                'cpf' => 'cpf',
                'telefone' => 'telefone',
                'status' => 'status',
            ],
        ],
    ];

    public function consultar()
    {
        $params = $this->getParams();
        $where = [" WHERE id_cidadao = 222222881 "];

        if (!empty($params['nome'])) {
            $where[] = " AND nome = '{$params['nome']}' ";
        }

        if (!empty($params['cpf'])) {
            $where[] = " AND cpf = '{$params['cpf']}' ";
        }

        if (!empty($params['telefone'])) {
            $where[] = " AND telefone = {$params['telefone']} ";
        }

        $where = join("\n", $where);

        $sql = "
        SET NOCOUNT ON;
                    
        SELECT *
        FROM cidadao WITH(NOLOCK)
        {$where}
        ";

        $items = $this->db->query($sql)->fetchAllArray();

        foreach ($items as $item) {
            if ($item['status'] = 1) {
                $item['nome_status'] = 'Ativo';
            } else {
                $item['nome_status'] = 'Inativo';
            }
        }

        $response = [
            'total' => count($items),
            'items' => $items,
        ];

        $this->setResponse($response);

        return $this;
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
        INSERT INTO cidadaos
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

        $camposUpdate = join(' = ?,', array_keys($dadosMapeados)) . ' = ?';
        $valoresUpdate = array_values($dadosMapeados);
        $valoresUpdate[] = $id_cidadao;

        $sql = "
        UPDATE cidadaos SET
            {$camposUpdate}
        WHERE id_cidadao = ?
        ";

        $paramsSql = $valoresUpdate;

        $this->db->query($sql, $paramsSql)->fetchArray();

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
        DELETE c
        FROM cidadao cid WITH(NOLOCK)
        WHERE cid.id_cidadao = ?
        ";
        $this->db->query($sql, $id_cidadao);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }
}