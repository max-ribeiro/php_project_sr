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
    private $pageSize = 15;

    public function consultar()
    {
        $params = $this->getParams();
        $where = [" WHERE 1 = 1"];
        $pagination = "";
        $orderBy = "ORDER BY id_cidadao ASC";

        if(!empty($params['pageNumber'])) {
            $offset = ($params['pageNumber'] - 1) * $this->pageSize;
            $pagination = "OFFSET {$offset} ROWS FETCH NEXT {$this->pageSize} ROWS ONLY";
        }

        // define o parametro de consulta com base no tipo
        if(!empty($params['tpBusca']) && !empty($params['cidadao'])) {
            $params[$params['tpBusca']] = $params['cidadao'];
        }

        if (!empty($params['nome'])) {
            $where[] = " AND nome LIKE '%{$params['nome']}%' COLLATE Latin1_General_CI_AI";
        }
        
        if (!empty($params['cpf'])) {
            $where[] = " AND cpf LIKE '%{$params['cpf']}%' ";
        }
        
        if (!empty($params['telefone'])) {
            $where[] = " AND telefone LIKE '%{$params['telefone']}%' ";
        }

        $where = join("\n", $where);

        $sql = "
            SET NOCOUNT ON;                
            SELECT *, COUNT(*) OVER() AS total_registros
            FROM cidadaos WITH(NOLOCK)
            {$where}
            {$orderBy}
            {$pagination}
        ";

        $items = $this->db->query($sql)->fetchAllArray();
        
        $items = array_map(function($item) {
            $item['nome_status'] = ($item['status'] == 1) ? 'Ativo' : 'Inativo';
            return $item;
        }, $items);

        $totalRegistros = !empty($items) ? $items[0]['total_registros'] : 0;

        $response = [
            'total' => $totalRegistros,
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

        unset($dadosMapeados['id_cidadao']);

        $camposInsert = join(',', array_keys($dadosMapeados));
        $identificacaoParametros = join(',', array_fill(0, count($dadosMapeados), '?'));
        $sqlParams = array_values($dadosMapeados);
        
        $sql = "
            INSERT INTO cidadaos({$camposInsert})
            VALUES({$identificacaoParametros})
        ";

        $result = $this->db->query($sql, $sqlParams);

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
        unset($dadosMapeados['id_cidadao']);

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
        DELETE FROM cidadaos
        WHERE id_cidadao = ?
        ";

        $this->db->query($sql,[0 => $id_cidadao]);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }
}