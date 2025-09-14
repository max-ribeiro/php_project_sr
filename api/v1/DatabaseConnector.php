<?php
require_once(_DIR_CLASSES_ . 'ConnectionInfo.php');

class DatabaseConnector
{
    private static $instance = null;

    private $connection       = array();
    private $stmtStack        = array(array());
    private $transactionStack = array(array());
    private $connectionName   = null;

    protected function __construct()
    {
        $this->addConnection(ConnectionInfo::getConnection());
    }

    protected function addConnection($connection, $connectionName = 'default')
    {
        $this->connection[$connectionName]       = $connection;
        $this->stmtStack[$connectionName]        = array();
        $this->transactionStack[$connectionName] = array();
        $this->connectionName                    = $connectionName;
    }

    public function getConnection($name = 'default')
    {
        return $this->connection[$name];
    }

    public static function getInstance()
    {
        if (static::$instance === null) {
            static::$instance = new static();
        }

        return static::$instance;
    }

    public function changeConnection($connectionName)
    {
        if (isset($this->connection[$connectionName])) {
            $this->connectionName = $connectionName;
            return $this;
        }

        $connectionInfo = $this->getConnectionInfo($connectionName);

        $connection = sqlsrv_connect($connectionInfo['server'], $connectionInfo['connectionParams']);

        $this->throwSqlStateException($connection);

        $this->addConnection($connection, $connectionName);

        return $this;
    }

    protected function getConnectionInfo($connectionName)
    {
        return isset(ConnectionInfo::get()[$connectionName]) ? ConnectionInfo::get()[$connectionName] : null;
    }

    protected function throwSqlStateException($stmt, $sql = null, $params = array())
    {
        if ($stmt === false) {
            $errors = sqlsrv_errors(SQLSRV_ERR_ERRORS);
            $msg = 'Erro SQL não especificado.';

            if ($errors && is_array($errors)) {
                $msg = "Erro ao tratar informações no banco";
            }

            phpLog($errors);
            phpLog($sql);
            phpLog($params);
            throw new SqlStateException($msg);
        }
    }

    public function beginTransaction()
    {
        if (!empty($this->transactionStack[$this->connectionName])) {

            array_push($this->transactionStack[$this->connectionName], true);

            return $this;
        }

        $args = func_get_args();
        array_unshift($args, $this->connection[$this->connectionName]);

        $stmt = call_user_func_array('sqlsrv_begin_transaction', $args);
        $this->throwSqlStateException($stmt);
        array_push($this->transactionStack[$this->connectionName], true);

        return $this;
    }

    public function commitTransaction()
    {
        array_pop($this->transactionStack[$this->connectionName]);

        if (count($this->transactionStack[$this->connectionName]) > 0) {
            return $this;
        }

        $args = func_get_args();
        array_unshift($args, $this->connection[$this->connectionName]);

        call_user_func_array('sqlsrv_commit', $args);

        return $this;
    }

    public function rollbackTransaction()
    {
        array_pop($this->transactionStack[$this->connectionName]);

        if (count($this->transactionStack[$this->connectionName]) > 0) {
            return $this;
        }

        $args = func_get_args();
        array_unshift($args, $this->connection[$this->connectionName]);

        call_user_func_array('sqlsrv_rollback', $args);

        return $this;
    }

    public function query()
    {
        $args = func_get_args();
        array_unshift($args, $this->connection[$this->connectionName]);

        // Comando SQL
        $args[1] = utf8_decode($args[1]);

        // Passar parametros enviados para o encoding do banco
        $stmt = call_user_func_array('sqlsrv_query', $args);

        $this->throwSqlStateException($stmt, $args[1], $args[2]);

        array_push($this->stmtStack[$this->connectionName], $stmt);

        return $this;
    }

    public function fetchArray($nullableString = false)
    {
        $args = array();
        array_unshift($args, $stmt = array_pop($this->stmtStack[$this->connectionName]));
        if (!isset($args[1])) {
            $args[1] = SQLSRV_FETCH_ASSOC;
        }

        $row = call_user_func_array('sqlsrv_fetch_array', $args);
        if ($row) {
            if ($nullableString) {
                foreach ($row as &$value) {
                    $value = !is_null($value) ? mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1') : null;
                }
            } else {
                foreach ($row as &$value) {
                    $value = mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
                }
            }

        }

        array_push($this->stmtStack[$this->connectionName], $stmt);

        return $row;
    }

    public function fetchAllArray($nullableString = false)
    {
        $rows = array();

        while ($row = $this->fetchArray($nullableString)) {
            $rows[] = $row;
        }

        return $rows;
    }

    public function nextStatement()
    {

        $currentStmt = array_pop($this->stmtStack[$this->connectionName]);

        $result = sqlsrv_next_result($currentStmt);

        array_push($this->stmtStack[$this->connectionName], $currentStmt);

        return $result;
    }

    public function rowsAffected()
    {
        $currentStmt = array_pop($this->stmtStack[$this->connectionName]);

        $result = sqlsrv_rows_affected($currentStmt);

        array_push($this->stmtStack[$this->connectionName], $currentStmt);

        return $result;
    }

    public function queryTransaction($sql)
    {
        if (is_array($sql)) {
            $sql = implode(";\n", $sql);
        }

        $sql = ("
            SET NOCOUNT ON;
            
            DECLARE @result INT;
            
            SET @result = 0;
            
            BEGIN TRY
                BEGIN TRANSACTION
                -- BEGIN SQL
                {$sql}
                -- END SQL
                COMMIT
                SET @result = 1;
            END TRY
            BEGIN CATCH            
                ROLLBACK TRANSACTION
            END CATCH
            
            SELECT @result AS result;
        ");

        $result = $this->query($sql)->fetchArray()['result'];

        if ($result != 1) {
            phpLog('queryTransaction: ' . $sql);
            return false;
        }

        return true;
    }

    public static function staticAuditSelect($consultaId, $consultaTipo, $valorConsultado, $matriculaSolicitante = null, $sistema = 'DESKTOP', $origemId = null, $valorConsultaIntegracao = null)
    {
        $maxRows             = 1000;
        $db                  = self::getInstance();
        $sqlParams           = array();
        $sqlAditionalColumns = $sqlAditionalParams = '';

        $ip = DatabaseConnector::getRequestIp();
        // recupera a porta
        $REMOTE_PORT = $_SERVER['REMOTE_PORT'];
        if (!empty($REMOTE_PORT)) {
            $ip .= ":{$REMOTE_PORT}";
        }

        $sqlParams[] = UserSession::getMatricula();
        $sqlParams[] = $consultaId;
        $sqlParams[] = $consultaTipo;
        $sqlParams[] = $valorConsultado;
        $sqlParams[] = $ip;
        $sqlParams[] = $sistema;
        $sqlParams[] = !empty($origemId) ? $origemId : $db->getOrigemConsultaId();

        if (!empty($matriculaSolicitante)) {
            $sqlAditionalColumns .= ', matr_solicita';
            $sqlAditionalParams  .= ', ?';
            $sqlParams[]         = $matriculaSolicitante;
        }

        try {
            if (is_array($valorConsultado)) {
                $valorConsultadoPaginado = array();

                for ($i = 0; $i < ceil((count($valorConsultado) + 1) / $maxRows); $i++) {
                    $valorConsultadoPaginado[] = array_slice($valorConsultado, $i * $maxRows, $maxRows);
                }

                foreach ($valorConsultadoPaginado as $pagina) {
                    $sql = "
                        INSERT INTO auditoria_consulta (
                            data, 
                            matr_func, 
                            consulta, 
                            tp_consulta, 
                            valor, 
                            ip, 
                            sistema, 
                            id_origem 
                            {$sqlAditionalColumns}
                        )
                        OUTPUT INSERTED.* 
                        VALUES 
                    ";

                    if (!empty($matriculaSolicitante)) {
                        $sqlAditionalParams = ", '{$matriculaSolicitante}'";
                    }

                    $sqlValues = [];

                    foreach ($pagina as $value) {
                        $sqlValues[] = ("
                            (
                                GETDATE(),
                                '{$sqlParams[0]}',
                                {$sqlParams[1]},
                                '{$sqlParams[2]}',
                                '{$value}',
                                '{$sqlParams[4]}',
                                '{$sqlParams[5]}',
                                {$sqlParams[6]}
                                {$sqlAditionalParams}
                            )
                        ");
                    }

                    $sql .= implode(",\n", $sqlValues);

                    $resultsInsert = $db->query($sql)->fetchAllArray();

                    if (is_array($resultsInsert) && !empty($resultsInsert) && !empty($valorConsultaIntegracao)) {

                        $sqlInsertIntegracao = '';

                        foreach ($resultsInsert as $key => $resultInsert) {
                            if (is_array($valorConsultaIntegracao) && !empty($valorConsultaIntegracao)) {
                                $valorConsultaIntegracaoInsert = $valorConsultaIntegracao[$key];
                            } else {
                                $valorConsultaIntegracaoInsert = $valorConsultaIntegracao;
                            }

                            $sqlInsertIntegracao .= "
                                INSERT INTO auditoria_consulta_integracao (id_auditoria, valor)
                                VALUES ({$resultInsert['id_auditoria']}, '{$valorConsultaIntegracaoInsert}');
                            ";
                        }

                        if (!empty($sqlInsertIntegracao)) {
                            $db->query($sqlInsertIntegracao);
                        }
                    }
                }
            } else {
                $sql = "
                    INSERT INTO auditoria_consulta (
                        data,
                        matr_func,
                        consulta,
                        tp_consulta,
                        valor,
                        ip,
                        sistema,
                        id_origem
                        {$sqlAditionalColumns}
                    )
                    OUTPUT INSERTED.*
                    VALUES (GETDATE(), ?, ?, ?, ?, ?, ?, ? {$sqlAditionalParams})
                ";

                $resultInsert = $db->query($sql, $sqlParams)->fetchArray();

                if (is_array($resultInsert) && !empty($resultInsert) && !empty($valorConsultaIntegracao)) {

                    $sqlInsertIntegracao = "
                        INSERT INTO auditoria_consulta_integracao (id_auditoria, valor)
                        VALUES ({$resultInsert['id_auditoria']}, '{$valorConsultaIntegracao}');
                    ";

                    $db->query($sqlInsertIntegracao);
                }
            }

            return true;
        } catch (Exception $error) {
            phpLog($error);
        }

        return false;
    }

    public function auditSelect($consultaId, $consultaTipo, $valorConsultado, $matriculaSolicitante = null, $sistema = 'DESKTOP', $origemId = null, $valorConsultaIntegracao = null)
    {
        return static::staticAuditSelect($consultaId, $consultaTipo, $valorConsultado, $matriculaSolicitante, $sistema, $origemId, $valorConsultaIntegracao);
    }

    public function getOrigemConsultaId()
    {
        $httpReferer = $_SERVER['HTTP_REFERER'];
        $relativeUrl = str_replace(preg_replace('/:[0-9]{1,4}\//', '/', _URL_HOME_), '', $httpReferer);
        preg_match('/([a-zA-Z0-9\/\-_]+.php)(?=\?)?/', $relativeUrl, $result);
        $arquivoOrigem = strtolower($result[0]);
        if (!$arquivoOrigem) $arquivoOrigem = $relativeUrl;
        $arquivoAcessado = str_replace(strtolower(str_replace('/', '\\', _DIR_HOME_)), '', strtolower($_SERVER['SCRIPT_FILENAME']));

        parse_str(parse_url($httpReferer, PHP_URL_QUERY), $http_referer_query);

        $args = array(
            'HTTP_REFERER_QUERY' => $http_referer_query,
        );

        return RequestMap::getIdByReferer($arquivoAcessado, $arquivoOrigem, $args);
    }

    public function auditUpdate(array $mapping, array $newValues = null, array $oldValues = null, $ticketId = null, $justificativa = null, $origemId = null, $matricula = null)
    {
        if (empty($newValues) || empty($oldValues)) {
            return false;
        }

        $changedValuesKeys = array_keys(array_diff_assoc($newValues, $oldValues));

        if (isset($mapping['operation']) && $mapping['operation'] == 'I') {
            $changedValuesKeys = array_keys($newValues);
        }

        if (empty($changedValuesKeys)) {
            return false;
        }

        try {
            $key            = (array)$mapping['key'];
            $keyColumns     = array();
            $sqlTransaction = [];

            $sqlParamsTabela   = array();
            $sqlParamsTabela[] = UserSession::getMatricula() ? UserSession::getMatricula() : $matricula;
            $sqlParamsTabela[] = $mapping['table'];
            $sqlParamsTabela[] = isset($mapping['operation']) ? $mapping['operation'] : 'U';
            $sqlParamsTabela[] = !empty($origemId) ? $origemId : $this->getOrigemConsultaId();

            // Caso possua duas chaves, salva em campos identificados
            if (count($key) == 2) {
                $sqlParamsTabela[] = $oldValues[$key[0]];
                $sqlParamsTabela[] = $key[0];
                $sqlParamsTabela[] = $oldValues[$key[1]];
                $sqlParamsTabela[] = $key[1];

                $keyColumns = array(', valor_chave2', 'nm_campo_chave2');
            } else {
                $sqlParamsTabela[] = join(',', array_reduce($key, function ($result, $item) use ($oldValues) {
                    $result[] = $oldValues[$item];

                    return $result;
                }, array()));

                $sqlParamsTabela[] = join(',', $key);
            }

            $stringColumns = join(', ', $keyColumns);
            $stringParams  = join(', ', array_fill(0, count($sqlParamsTabela), '?'));

            $sqlTabela = "
                DECLARE @idAuditoria INT;
                
                INSERT INTO auditoria (
                    dt_modificacao, 
                    matr_func, 
                    nm_tabela, 
                    operacao, 
                    id_origem, 
                    valor_chave, 
                    nm_campo_chave 
                    {$stringColumns}
                ) 
                VALUES (GETDATE(), {$stringParams});
                
                SET @idAuditoria = SCOPE_IDENTITY();
            ";

            $sqlTransaction[] = sqlBindParams($sqlTabela, $sqlParamsTabela);

            if (!empty($ticketId) || !empty($justificativa)) {
                $ticket = (!empty($ticketId) ? "Ticket: {$ticketId} " : '') . "Justificativa: {$justificativa}";

                $sqlJustificativa = "
                    INSERT INTO auditoria_justificativa (id_auditoria, justificativa)
                    VALUES (@idAuditoria, ?);
                ";

                $sqlTransaction[] = sqlBindParams($sqlJustificativa, [$ticket]);
            }

            foreach ($changedValuesKeys as $key) {
                $sqlRegistro = "
                    INSERT INTO auditoria_registro (id_auditoria, nm_campo, valor_anterior, valor_novo)
                    VALUES (@idAuditoria, ?, ?, ?);
                ";

                $sqlParamsRegistro = array(
                    $key,
                    (isset($mapping['operation']) && $mapping['operation'] == 'I') ? null :$oldValues[$key],
                    $newValues[$key],
                );

                $sqlTransaction[] = sqlBindParams($sqlRegistro, $sqlParamsRegistro);
            }

            return $this->queryTransaction($sqlTransaction);
        } catch (Exception $error) {
            phpLog($error);
        }

        return false;
    }

    /**
     * @param array $mapping *
     *              [table] => 'Table name',
     *              [key]   => string|array('Table key name', [...])
     * @param array $oldValues
     * @return bool
     */
    public function auditDelete(array $mapping, array $oldValues = null, $ticketId = null, $justificativa = null, $origemId = null)
    {
        if (empty($oldValues)) {
            return false;
        }

        $deletedRowList = isset($oldValues[0]) ? $oldValues : array($oldValues);
        $key            = (array)$mapping['key'];

        try {
            $this->beginTransaction();

            foreach ($deletedRowList as $deletedRow) {
                $keyColumns        = array();
                $sqlParamsTabela   = array();
                $sqlParamsTabela[] = UserSession::getMatricula();
                $sqlParamsTabela[] = $mapping['table'];
                $sqlParamsTabela[] = 'D';
                $sqlParamsTabela[] = !empty($origemId) ? $origemId : $this->getOrigemConsultaId();

                // Caso possua duas chaves, salva em campos identificados
                if (count($key) == 2) {
                    $sqlParamsTabela[] = $deletedRow[$key[0]];
                    $sqlParamsTabela[] = $key[0];
                    $sqlParamsTabela[] = $deletedRow[$key[1]];
                    $sqlParamsTabela[] = $key[1];
                    $keyColumns        = array(', valor_chave2', 'nm_campo_chave2');
                } else {
                    $sqlParamsTabela[] = join(',', array_reduce($key, function ($result, $item) use ($deletedRow) {
                        $result[] = $deletedRow[$item];

                        return $result;
                    }, array()));

                    $sqlParamsTabela[] = join(',', $key);
                }

                $stringColumns = join(', ', $keyColumns);
                $stringParams  = join(', ', array_fill(0, count($sqlParamsTabela), '?'));

                $sqlTabela = "
                    INSERT INTO auditoria (
                        dt_modificacao, 
                        matr_func, 
                        nm_tabela, 
                        operacao, 
                        id_origem,
                        valor_chave, 
                        nm_campo_chave 
                        {$stringColumns}
                    ) 
                    OUTPUT INSERTED.id_auditoria
                    VALUES (GETDATE(), {$stringParams});
                ";

                $dadosAuditoria = $this->query($sqlTabela, $sqlParamsTabela)->fetchArray();

                if (!empty($ticketId) || !empty($justificativa)) {
                    $sqlJustificativa = "
                        INSERT INTO auditoria_justificativa (id_auditoria, justificativa) 
                        VALUES (?, ?);
                    ";

                    $arrayParamsJustificativa = array(
                        $dadosAuditoria['id_auditoria'],
                        (!empty($ticketId) ? "Ticket: {$ticketId} " : '') . "Justificativa: {$justificativa}",
                    );

                    $this->query($sqlJustificativa, $arrayParamsJustificativa);
                }

                foreach ($deletedRow as $chave => $value) {
                    $sqlRegsitro = "
                        INSERT INTO auditoria_registro (id_auditoria, nm_campo, valor_anterior) 
                        VALUES (?, ?, ?);
                    ";

                    $sqlParamsRegistro = array(
                        $dadosAuditoria['id_auditoria'],
                        $chave,
                        $value,
                    );

                    $this->query($sqlRegsitro, $sqlParamsRegistro);
                }
            }

            $this->commitTransaction();
        } catch (Exception $error) {
            $this->rollbackTransaction();
            return false;
        }

        return true;
    }

    public static function getRequestIp()
    {
        $proxy_headers = array(
            'CLIENT_IP',
            'FORWARDED',
            'FORWARDED_FOR',
            'FORWARDED_FOR_IP',
            'HTTP_CLIENT_IP',
            'HTTP_FORWARDED',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED_FOR_IP',
            'HTTP_PC_REMOTE_ADDR',
            'HTTP_PROXY_CONNECTION',
            'HTTP_VIA',
            'HTTP_X_FORWARDED',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED_FOR_IP',
            'HTTP_X_IMFORWARDS',
            'HTTP_XROXY_CONNECTION',
            'VIA',
            'X_FORWARDED',
            'X_FORWARDED_FOR',
        );

        foreach ($proxy_headers as $proxy_header) {
            if (isset($_SERVER[$proxy_header]) && preg_match("/^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}$/",
                    $_SERVER[$proxy_header])) /* HEADER está setado e é um IP válido */ {
                return $_SERVER[$proxy_header];
            } elseif (stristr(',',
                    $_SERVER[$proxy_header]) !== false) /* Trata vários IPs em uma request (por exemplo: X-Forwarded-For: client1, proxy1, proxy2) */ {
                $proxy_header_temp = trim(array_shift(explode(',',
                    $_SERVER[$proxy_header]))); /* Partes em IPs individuais, volta (?), e remove o último espaço */

                if (($pos_temp = stripos($proxy_header_temp, ':')) !== false) {
                    $proxy_header_temp = substr($proxy_header_temp, 0, $pos_temp);
                } /* Remove a porta */

                if (preg_match("/^([1-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\.([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])){3}$/",
                    $proxy_header_temp)) {
                    return $proxy_header_temp;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'];
    }

    public static function staticGetHistoryTable($table, $filds, $where)
    {
        $fildsKeys       = array_keys($filds);
        $fildsKeysString = join(', ', $fildsKeys);
        $keyId           = $fildsKeys[0];
        $sql             = "IF OBJECT_ID('tempdb..#{$table}_temp') IS NOT NULL
                    DROP TABLE #{$table}_temp;
                IF OBJECT_ID('tempdb..#modificacoes') IS NOT NULL
                    DROP TABLE #modificacoes;
                CREATE TABLE #{$table}_temp (
                    id_temp                 numeric(18) IDENTITY PRIMARY KEY,
                    id_auditoria            numeric(18), ";
        foreach ($filds as $key => $value) {
            $sql .= "{$key} {$value}";
            if (end($fildsKeys) != $key) {
                $sql .= ", ";
            }
        }
        $sql .= "   
                )
                INSERT INTO #{$table}_temp (id_auditoria, {$fildsKeysString})
                SELECT NULL AS id_auditoria,
                       {$fildsKeysString}
                FROM {$table} WITH (NOLOCK)
                WHERE {$where};
                
                SELECT *
                INTO #modificacoes
                FROM (SELECT *
                      FROM (SELECT auditoria.id_auditoria,
                                   registro.nm_campo,
                                   registro.valor_anterior
                            FROM auditoria WITH (NOLOCK)
                                     LEFT JOIN auditoria_registro AS registro WITH (NOLOCK)
                                               ON auditoria.id_auditoria = registro.id_auditoria
                            WHERE auditoria.nm_tabela = '{$table}'
                              AND auditoria.valor_chave in (SELECT {$keyId} FROM #{$table}_temp)) auditoriaTemp) AS P
                         PIVOT
                         (MAX(valor_anterior) FOR nm_campo IN ({$fildsKeysString}";
        $sql .= ")) AS Pvt
            
                DECLARE
                    @idAuditoria INT;
                DECLARE Employee_Cursor CURSOR FOR
                    SELECT DISTINCT (id_auditoria) FROM #modificacoes ORDER BY 1 DESC;
                OPEN Employee_Cursor;
                FETCH NEXT FROM Employee_Cursor INTO @idAuditoria;
                WHILE @@FETCH_STATUS = 0
                BEGIN
                    INSERT INTO #{$table}_temp (id_auditoria, {$fildsKeysString})
                    SELECT TOP 1 id_auditoria, 
                    {$fildsKeysString}
                    FROM #{$table}_temp
                    ORDER BY id_temp DESC;
            
                    UPDATE #{$table}_temp
                    SET ";
        foreach ($filds as $key => $value) {
            preg_match('/COLLATE.\w*/', $value, $collate);
            $sql .= "   #{$table}_temp.{$key}       =
                            CASE
                                WHEN modificacoes.{$key} = ''
                                    THEN NULL
                                WHEN modificacoes.{$key} IS NOT NULL
                                    THEN modificacoes.{$key} " . (count($collate) ? $collate[0] : '') . "
                                ELSE #{$table}_temp.{$key}
                                END, ";
        }
        $sql .= "      #{$table}_temp.id_auditoria = modificacoes.id_auditoria
                    FROM (SELECT * FROM #modificacoes WHERE id_auditoria = @idAuditoria) AS modificacoes
                    WHERE id_temp = (SELECT TOP 1 id_temp FROM #{$table}_temp ORDER BY 1 DESC);
                    
                    SELECT * FROM #{$table}_temp ORDER BY 1 DESC;
            
                    FETCH NEXT FROM Employee_Cursor INTO @idAuditoria;
                END;
                CLOSE Employee_Cursor;
                DEALLOCATE Employee_Cursor;
                DROP TABLE #modificacoes;
                ";
        return $sql;
    }

    public function getHistoryTable($table, $filds, $where)
    {
        return static::staticGetHistoryTable($table, $filds, $where);
    }
}

class SqlStateException extends Exception
{
}
