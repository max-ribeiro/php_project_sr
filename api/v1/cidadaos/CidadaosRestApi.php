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
        $where = [" WHERE 1 = 1"];//retornar todos caso não exista filtro
        $pagination = "";

        if(!empty($params['pageNumber'])) {
            $offset = $params['pageNumber'] * 15;
            $pagination = "OFFSET {$offset} ROWS
                FETCH NEXT {$this->pageSize} ROWS ONLY
            ";            
        }

        // total de registros sem paginação
        $sqlTotal = "
            SELECT COUNT(*) AS total
            FROM cidadaos WITH(NOLOCK)
        ";

        $totalResult = $this->db->query($sqlTotal)->fetchArray();
        $total = $totalResult['total'] ?? 0;

        // define o parametro de consulda com base do tipo
        if(!empty($params['tpBusca']) && !empty($params['cidadao'])) {
            $params[$params['tpBusca']] = $params['cidadao'];
        }

        if (!empty($params['nome'])) {
            $where[] = " AND nome LIKE '%{$params['nome']}%' ";
        }
        
        if (!empty($params['cpf'])) {
            $where[] = " AND cpf = '{$params['cpf']}' ";
        }
        
        if (!empty($params['telefone'])) {
            $where[] = " AND telefone = {$params['telefone']} ";
        }

        $where = join("\n", $where);

        /**
         * @todo dependendo da massa de dados, retornar o count em query separada
         */
        $sql = "
            SET NOCOUNT ON;                
            SELECT *, COUNT(*) OVER() AS total_registros
            FROM cidadaos WITH(NOLOCK)
            {$where}
            ORDER BY id_cidadao
            {$pagination}
        ";

        $items = $this->db->query($sql)->fetchAllArray();
        
        $items = array_map(function($item) {
            if ('1' == $item['status']) {
                $item['nome_status'] = 'Ativo';
            } else {
                $item['nome_status'] = 'Inativo';
            }
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
        var_dump($id_cidadao);
        die();

        $this->db->query($sql,[0 => $id_cidadao]);

        return $this->setResponse([
            'status' => 'ok',
        ]);
    }
}