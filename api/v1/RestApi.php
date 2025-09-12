<?php
session_start();

require_once(__DIR__ . '/../../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'classes/ConnectionInfo.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

class RestApi
{
    public    $id                  = null;
    public    $requiredParams      = [];
    private   $connection          = null;
    protected $db                  = null;
    protected $params              = [];
    private   $response            = null;
    private   $normaliseOnlyValues = true;
    public    $inputMap            = [];
    private   $isRelatorio         = false;

    public function sanitizeValue($value)
    {
        return str_replace("'", "'''", $value);
    }

    public function setIsRelatorio($isRelatorio)
    {
        $this->isRelatorio = $isRelatorio;
    }

    public function getIsRelatorio()
    {
        return $this->isRelatorio;
    }

    public function __construct($connection = null)
    {
        if (isset($connection)) {
            $this->connection = $connection;
        } else {
            $this->connection = ConnectionInfo::getConnection();
        }

        $this->db = DatabaseConnector::getInstance();
    }

    public static function createFromRequest()
    {
        $restApi = new static();
        $restApi->setParams($_REQUEST);

        return $restApi;
    }

    public static function createFromRequestChild($child)
    {
        $restApi = new static();
        $restApi->setParams($_REQUEST[$child]);

        return $restApi;
    }

    public function getConnection()
    {
        return $this->connection;
    }

    public function getDatabaseConnector()
    {
        return $this->db;
    }

    public function isNormaliseOnlyValues()
    {
        return $this->normaliseOnlyValues;
    }

    public function setNormaliseOnlyValues($normaliseOnlyValues)
    {
        $this->normaliseOnlyValues = $normaliseOnlyValues;
    }

    public function removeAccents($string)
    {
        $unwanted_array = [
            'Š' => 'S',
            'š' => 's',
            'Ž' => 'Z',
            'ž' => 'z',
            'À' => 'A',
            'Á' => 'A',
            'Â' => 'A',
            'Ã' => 'A',
            'Ä' => 'A',
            'Å' => 'A',
            'Æ' => 'A',
            'Ç' => 'C',
            'È' => 'E',
            'É' => 'E',
            'Ê' => 'E',
            'Ë' => 'E',
            'Ì' => 'I',
            'Í' => 'I',
            'Î' => 'I',
            'Ï' => 'I',
            'Ñ' => 'N',
            'Ò' => 'O',
            'Ó' => 'O',
            'Ô' => 'O',
            'Õ' => 'O',
            'Ö' => 'O',
            'Ø' => 'O',
            'Ù' => 'U',
            'Ú' => 'U',
            'Û' => 'U',
            'Ü' => 'U',
            'Ý' => 'Y',
            'Þ' => 'B',
            'ß' => 'Ss',
            'à' => 'a',
            'á' => 'a',
            'â' => 'a',
            'ã' => 'a',
            'ä' => 'a',
            'å' => 'a',
            'æ' => 'a',
            'ç' => 'c',
            'è' => 'e',
            'é' => 'e',
            'ê' => 'e',
            'ë' => 'e',
            'ì' => 'i',
            'í' => 'i',
            'î' => 'i',
            'ï' => 'i',
            'ð' => 'o',
            'ñ' => 'n',
            'ò' => 'o',
            'ó' => 'o',
            'ô' => 'o',
            'õ' => 'o',
            'ö' => 'o',
            'ø' => 'o',
            'ù' => 'u',
            'ú' => 'u',
            'û' => 'u',
            'ý' => 'y',
            'þ' => 'b',
            'ÿ' => 'y',
        ];

        return strtr($string, $unwanted_array);
    }

    public function toCamelCase($string, $capitalizeFirstCharacter = false)
    {
        $string = $this->removeAccents($string);
        $string = preg_replace('/[^A-Za-z0-9]+/', '-', $string);
        $string = str_replace('-', '', ucwords($string, '-'));

        if (!$capitalizeFirstCharacter) {
            $string = lcfirst($string);
        }

        return $string;
    }

    protected function normalizeResponse($map, $rows, $onlyValues = null, $lowerCamelCase = true, $sampleData = [])
    {
        if (!($rows instanceof DatabaseConnector)) {
            throw new BadMethodCallException('Método ainda não implementado');
        }

        if ($map === null) {
            return $rows->fetchAllArray();
        }

        if ($onlyValues === null) {
            $onlyValues = $this->normaliseOnlyValues;
        }

        $normalizedMap = [];
        $this->normalizeMapRecursive($map, $lowerCamelCase, $normalizedMap);
        $map = $normalizedMap;

        $response = [];

        if (!empty($sampleData)) {
            foreach ($sampleData as $row) {
                $this->normalizeResponseRecursive($map, $row, $response);
            }
        } else {
            while ($row = $rows->fetchArray()) {
                $this->normalizeResponseRecursive($map, $row, $response);
            }
        }

        if ($onlyValues === true) {
            $this->onlyValuesRecursive($map, $response);
        }

        return $response;
    }

    private function normalizeMapRecursive($map, $lowerCamelCase, &$normalizedMap)
    {
        foreach ($map as $key => $value) {
            if (!is_array($value)) {
                $callable = false;

                if (is_callable($value)) {
                    $callable = $value;
                    $value    = $key;
                }

                $attributeName = $value;

                if ($lowerCamelCase === true) {
                    $attributeName = $this->toCamelCase($attributeName);
                }

                if ($callable) {
                    $normalizedMap[$attributeName] = $callable;
                } else {
                    $normalizedMap[$attributeName] = $value;
                }

                continue;
            }

            $attributeName = $key;

            if ($lowerCamelCase === true) {
                $attributeName = $this->toCamelCase($key);
            }

            $onlyValues = (isset($value['onlyValues']) && !empty($value['onlyValues']))
                ? $value['onlyValues']
                : null;

            if ($lowerCamelCase === true) {
                $onlyValues = ($onlyValues === null) ? null : $this->toCamelCase($onlyValues);
            }

            $removePrefix = isset($value['removePrefix']) && !empty($value['removePrefix'])
                ? $value['removePrefix']
                : null;

            if ($lowerCamelCase === true) {
                $removePrefix = ($removePrefix === null) ? null : $this->toCamelCase($removePrefix);
            }

            $hasOne = (isset($value['hasOne']) && !empty($value['hasOne'])) ? $value['hasOne'] : null;

            $normalizedMap[$attributeName] = [
                'groupBy'      => $value['groupBy'],
                'callback'     => $value['callback'],
                'removePrefix' => $removePrefix,
                'onlyValues'   => $onlyValues,
                'hasOne'       => $hasOne,
                'values'       => [],
            ];

            $this->normalizeMapRecursive(
                $value['values'],
                $lowerCamelCase,
                $normalizedMap[$attributeName]['values']
            );
        }
    }

    private function normalizeResponseRecursive($map, $row, &$response, $removePrefix = false)
    {
        foreach ($map as $key => $value) {
            if (!is_array($value)) {
                if (is_callable($value)) {
                    $row[$key] = $value($row);
                    $value     = $key;
                }

                if (is_string($row[$value])) {
                    $row[$value] = trim($row[$value]);
                }

                if ($removePrefix) {
                    $key = lcfirst(preg_replace("/^{$removePrefix}/", '', $key));
                }

                $response[$key] = $row[$value];

                continue;
            }

            $groupBy      = $value['groupBy'];
            $callback     = $value['callback'] ? $value['callback'] : false;
            $removePrefix = $value['removePrefix'] ? $value['removePrefix'] : false;
            $values       = $value['values'];

            if (!isset($response[$key])) {
                $response[$key] = [];
            }

            // O agrupador é nulo, portanto não há filhos para serem agrupados
            if (
                !isset($row[$groupBy])
                || $row[$groupBy] === null
                || $row[$groupBy] === ''
                || ($callback !== false && $callback($row) === false)
            ) {
                continue;
            }

            if (!isset($response[$key][$row[$groupBy]])) {
                $response[$key][$row[$groupBy]] = [];
            }

            $this->normalizeResponseRecursive(
                $values,
                $row,
                $response[$key][$row[$groupBy]],
                $removePrefix,
                $callback
            );
        }
    }

    private function onlyValuesRecursive($map, &$response)
    {
        if (empty($response)) {
            return;
        }

        foreach ($map as $key => $value) {
            if (!is_array($value)) {
                continue;
            }

            if ($value['onlyValues'] !== null) {
                $response[$key] = array_column($response[$key], $value['onlyValues']);
                continue;
            }

            $response[$key] = array_values($response[$key]);

            foreach ($response[$key] as &$responseItem) {
                $this->onlyValuesRecursive($value['values'], $responseItem);
            }

            if ($value['hasOne']) {
                $response[$key] = array_pop($response[$key]);
            }
        }
    }

    public function mapRequestToDatabase($params, $context, $convertTo = null)
    {
        $data = [];

        foreach (array_intersect_key($params, $this->inputMap[$context]['columns']) as $key => $value) {
            $value = empty($convertTo) || empty($value) ? $value : mb_convert_encoding($value, $convertTo);

            $data[$this->inputMap[$context]['columns'][$key]] = is_numeric($value) || !empty($value) ? $value : null;
        }

        return $data;
    }

    public function mapRequestToGets($params, $context)
    {
        $data = $this->inputMap[$context]['columns'];

        if ($params['get']) {
            foreach ($data as $key => $value) {
                if (!in_array($key, $params['get'])) {
                    unset($data[$key]);
                }
            }
        }

        return $data;
    }

    protected function setResponse($response = null)
    {
        $this->response = $response;

        return $this;
    }

    protected function getResponse()
    {
        return $this->response;
    }

    protected function validateParams($params)
    {
        return true;
    }

    protected function normalizeParams(&$params)
    {
        return;
    }

    public function setParams($params)
    {
        try {
            $this->validateParams($params);
            $this->normalizeParams($params);

            $this->params = $params;
        } catch (Exception $e) {
            throw $e;
        }

        return $this;
    }

    public function addParam($key, $value)
    {
        $this->params[$key] = $value;

        return $this;
    }

    public function getParams()
    {
        return $this->params;
    }

    public function getParam($key, $default = null)
    {
        if (empty($this->params[$key])) {
            return $default;
        }

        return $this->params[$key];
    }

    public function getParamOneOf(array $keys, $default = null, $notEmpty = false)
    {
        foreach ($keys as $key) {
            if (isset($this->params[$key])) {
                if ($notEmpty && !empty($this->params[$key])) {
                    return $this->params[$key];
                }

                if (!$notEmpty) {
                    return $this->params[$key];
                }
            }
        }

        return $default;
    }

    public static function getParamOneOfStatic(array $keys, $default = null, $notEmpty = false)
    {
        return (new static)->getParamOneOf($keys, $default, $notEmpty);
    }

    public function httpResponse($json = true, $devMode = false)
    {
        if (!isset($this->response)) {
            return;
        }

        if ($json === true) {
            header('Content-Type: application/json; charset=utf-8');
        }

        if ($devMode) {
            var_dump($this->response);

            return;
        }

        echo ($json) ? json_encode($this->response) : $this->response;
    }

    public function rawResponse()
    {
        return $this->response;
    }

    public function fileResponse()
    {
        $file = $this->response['file'];

        header('Content-type: ' . $this->getMineType($file));
        header('Content-Length: ' . filesize($file));

        ob_clean();
        flush();
        readfile($file);
        die();
    }

    public function downloadResponse()
    {
        $file = $this->response['file'];
        header('Content-Description: File Transfer');

        if ($this->response['filename']) {
            header('Content-Disposition: attachment; filename="' . $this->response['filename'] . '"');
        }

        header('Content-type: ' . $this->getMineType($file));
        header('Content-Transfer-Encoding: binary');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Expires: 0');

        ob_clean();
        flush();
        echo file_get_contents($file);
        die();
    }

    public function downloadResponseFromDatabase($base64)
    {
        foreach ($this->response['header'] as $header) {
            header($header);
        }

        echo file_get_contents($base64);

        die();
    }

    public function getMineType($filename)
    {
        if (function_exists('mime_content_type')) {
            return function_exists($filename);
        }

        $mime_types = [
            'txt'  => 'text/plain',
            'htm'  => 'text/html',
            'html' => 'text/html',
            'php'  => 'text/html',
            'css'  => 'text/css',
            'js'   => 'application/javascript',
            'json' => 'application/json',
            'xml'  => 'application/xml',
            'swf'  => 'application/x-shockwave-flash',

            // images
            'png'  => 'image/png',
            'jpe'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'jpg'  => 'image/jpeg',
            'gif'  => 'image/gif',
            'bmp'  => 'image/bmp',
            'ico'  => 'image/vnd.microsoft.icon',
            'tiff' => 'image/tiff',
            'tif'  => 'image/tiff',
            'svg'  => 'image/svg+xml',
            'svgz' => 'image/svg+xml',

            // archives
            'zip'  => 'application/zip',
            'rar'  => 'application/x-rar-compressed',
            'exe'  => 'application/x-msdownload',
            'msi'  => 'application/x-msdownload',
            'cab'  => 'application/vnd.ms-cab-compressed',

            // audio/video
            'mp3'  => 'audio/mpeg',
            'oga'  => 'audio/ogg',
            'ogg'  => 'audio/ogg',
            'spx'  => 'audio/ogg',
            'ogv'  => 'video/ogg',
            'qt'   => 'video/quicktime',
            'mov'  => 'video/quicktime',
            'mp4'  => 'video/mp4',
            'mp4v' => 'video/mp4',
            'mpg4' => 'video/mp4',
            'avi'  => 'video/x-msvideo',
            'webm' => 'video/webm',
            'f4v'  => 'video/x-f4v',
            'fli'  => 'video/x-fli',
            'flv'  => 'video/x-flv',
            'm4v'  => 'video/x-m4v',
            'mkv'  => 'video/x-matroska',
            'mk3d' => 'video/x-matroska',
            'mks'  => 'video/x-matroska',

            // adobe
            'pdf'  => 'application/pdf',
            'psd'  => 'image/vnd.adobe.photoshop',
            'ai'   => 'application/postscript',
            'eps'  => 'application/postscript',
            'ps'   => 'application/postscript',

            // ms office
            'doc'  => 'application/msword',
            'rtf'  => 'application/rtf',
            'xls'  => 'application/vnd.ms-excel',
            'ppt'  => 'application/vnd.ms-powerpoint',

            // open office
            'odt'  => 'application/vnd.oasis.opendocument.text',
            'ods'  => 'application/vnd.oasis.opendocument.spreadsheet',
        ];

        $ext = strtolower(array_pop(explode('.', $filename)));

        if (array_key_exists($ext, $mime_types)) {
            return $mime_types[$ext];
        } elseif (function_exists('finfo_open')) {
            $finfo    = finfo_open(FILEINFO_MIME);
            $mimetype = finfo_file($finfo, $filename);
            finfo_close($finfo);

            return $mimetype;
        } else {
            return 'application/octet-stream';
        }
    }

    public function firstOrFail()
    {
        return ($this->response) ? array_shift($this->response) : null;
    }

    public function notEmptyParam($key)
    {
        $arrayParam    = (array)$key;
        $requestParams = $this->getParams();

        foreach ($arrayParam as $param) {
            if (
                !isset($requestParams[$param]) ||
                (
                    (is_array($requestParams[$param]) && empty($requestParams[$param])) ||
                    (!is_array($requestParams[$param]) && empty(trim($requestParams[$param])))
                )
            ) {

                return false;
            }
        }

        return true;
    }

    public function hasRequiredParams()
    {
        return $this->notEmptyParam($this->requiredParams);
    }

    public function pagination($sqlFormat, $sqlAttributes, $sqlCount, $sqlFormatPagination, $sqlParams, $normalize = null)
    {
        $sql   = sprintf($sqlFormat, $sqlCount);
        $total = $this->db->query($sql, $sqlParams)->fetchArray()['total'] - 0;

        if (!$total || $total === 0) {
            $this->setResponse([
                'total' => 0,
                'items' => [],
                'count' => 0,

                'hasPrevious' => false,
                'hasNext'     => false,

                'pageNumber' => 0,
                'page'       => 0,

                'rowsPerPage' => 0,
                'amount'      => 0,
            ]);

            return;
        }

        if (!$this->isRelatorio) {
            $page   = $this->getParamOneOf(['pageNumber', 'page'], 1) + 0;
            $amount = $this->getParamOneOf(['rowsPage', 'rowsPerPage', 'amount'], 15) + 0;

            if ($amount > 50) {
                throw new RestApiInvalidArgumentException('A quantidade de itens por página deve ser menor que 50');
            }
        } else {
            $page   = 1;
            $amount = $total;
        }

        $start = (($page - 1) * $amount) + 1;
        $end   = $start + ($amount - 1);

        $sqlParams[] = $start;
        $sqlParams[] = $end;

        $sql = sprintf($sqlFormat, $sqlAttributes);
        $sql = sprintf($sqlFormatPagination, $sql);

        $items = $this->db->query($sql, $sqlParams);

        $response = $this->normalizeResponse($normalize, $items);

        $this->setResponse([
            'total' => $total,
            'items' => $response['items'] ?: $response,
            'count' => count($response),

            'hasPrevious' => ($page > 1),
            'hasNext'     => ($page < ceil($total / $amount)),

            'pageNumber' => $page,
            'page'       => $page,

            'rowsPerPage' => $amount,
            'amount'      => $amount,
        ]);
    }

    public function getSqlPagination()
    {
        $paginacao = '';

        if (!empty($this->getParamOneOf(['rowsPage', 'rowsPerPage', 'amount'], null))) {
            $page         = $this->getParamOneOf(['pageNumber', 'page'], 1) + 0;
            $numberOfRows = $this->getParamOneOf(['rowsPage', 'rowsPerPage', 'amount'], 15) + 0;
            $offset       = (($page - 1) * $numberOfRows);
            $paginacao    = "OFFSET {$offset} ROWS FETCH NEXT {$numberOfRows} ROWS ONLY";
        }

        return $paginacao;
    }

    public function addMarkupDeletedInRows(&$rows)
    {
        if (!empty($rows)) {
            if (isset($rows[0])) {
                foreach ($rows as &$row) {
                    $row['_deleted'] = true;
                }
            } else {
                $rows['_deleted'] = true;
            }
        }

        return $rows;
    }

    public function getDataInTable($inputMapContext, $params = [])
    {
        $params          = array_replace_recursive(['request' => null,], $params);
        $request         = $params['request'] ? $params['request'] : $this->getParams();
        $page            = $request['pageNumber'] ?: $request['page'] ?: 1;
        $amount          = $request['rowsPage'] ?: $request['rowsPerPage'] ?: $request['amount'] ?: 15;
        $rowInit         = (($page - 1) * $amount);
        $rowFinal        = $page * $amount;
        $requestMapeados = $this->mapRequestToDatabase($request, $inputMapContext);
        $gets            = $this->mapRequestToGets($request, $inputMapContext);
        $inputMap        = $this->inputMap[$inputMapContext];
        $getsString      = '';
        $where           = join(' = ? AND ', array_keys($requestMapeados));

        foreach ($gets as $key => $value) {
            $getsString .= "{$value} as {$key}";

            if (end(array_keys($gets)) != $key) {
                $getsString .= ", ";
            }
        }

        $sql = "
            SELECT COUNT(*) OVER() as overallCount, {$getsString}
            FROM {$inputMap['table']} WITH (NOLOCK)
            WHERE {$where} = ?
            ORDER BY 1 ASC 
            OFFSET {$rowInit} ROWS
            FETCH NEXT {$rowFinal} ROWS ONLY
        ";

        $sql = sqlBindParams($sql, array_values($requestMapeados));

        if ($inputMap['table'] == 'foto_exame' && $params['id_quesito'] == null) {
            $sql = str_replace(' id_quesito = NULL ', ' id_quesito IS NULL ', $sql);
        }

        $this->db->query($sql);

        $response = $this->db->fetchAllArray();

        $this->setResponse([
            'count' => count($response),
            'items' => $response,
            'page'  => $page,
            'total' => count($response) ? intval($response[0]['overallCount']) : 0,
        ]);

        return $this;
    }

    public function saveDataInTable($inputMapContext, $params = [])
    {
        $params = array_replace_recursive([
            'config'      => [
                'encode'     => 'ISO-8859-1',
                'encodeFrom' => 'UTF-8',
            ],
            'request'     => null,
            'dependency'  => null,
            'transaction' => true,
        ], $params);

        $db              = DatabaseConnector::getInstance();
        $request         = $params['request'] ? $params['request'] : $this->getParams();
        $requestMapeados = $this->mapRequestToDatabase($request, $inputMapContext);
        $inputMap        = (object)$this->inputMap[$inputMapContext];

        try {
            if ($params['transaction']) {
                $db->beginTransaction();
            }

            if (is_string($inputMap->key)) {
                $value = trim($requestMapeados[$inputMap->key]);
                $value = filter_var($value, FILTER_SANITIZE_STRING);

                $whereKey = "{$inputMap->key} = '{$value}'";
            } else {
                $whereKey = array_map(function ($key) use ($requestMapeados) {
                    $value = trim($requestMapeados[$key]);
                    $value = filter_var($value, FILTER_SANITIZE_STRING);

                    return "{$key} = '{$value}'";
                }, $inputMap->key);
                $whereKey = join(' AND ', $whereKey);
            }

            if (isset($request['_deleted'])) {
                $sql = "
                    DELETE {$inputMap->table} 
                    OUTPUT DELETED.* 
                    WHERE {$whereKey}
                ";

                $result = $db->query($sql)->fetchArray();

                $db->auditDelete((array)$inputMap, $result);
            } else {
                if (is_string($inputMap->key)) {
                    $isUpdate = isset($requestMapeados[$inputMap->key]) && !empty($requestMapeados[$inputMap->key]);

                    if ($isUpdate && isset($requestMapeados[$inputMap->key])) {
                        unset($requestMapeados[$inputMap->key]);
                    }
                } else {
                    $isUpdate = false;

                    foreach ($inputMap->key as $key) {
                        $isUpdate &= isset($requestMapeados[$key]) && !empty($requestMapeados[$key]);

                        if ($isUpdate && isset($requestMapeados[$key])) {
                            unset($requestMapeados[$key]);
                        }
                    }
                }

                if (!$isUpdate) {
                    $columns = array_values($inputMap->columns);

                    if (in_array('matr_cria', $columns)) {
                        if (!isset($requestMapeados['matr_cria']) || empty($requestMapeados['matr_cria'])) {
                            $requestMapeados['matr_cria'] = UserSession::getMatricula();
                        }
                    } elseif (in_array('matr_insere', $columns)) {
                        if (!isset($requestMapeados['matr_insere']) || empty($requestMapeados['matr_insere'])) {
                            $requestMapeados['matr_insere'] = UserSession::getMatricula();
                        }
                    } elseif (in_array('matr_func', $columns)) {
                        if (!isset($requestMapeados['matr_func']) || empty($requestMapeados['matr_func'])) {
                            $requestMapeados['matr_func'] = UserSession::getMatricula();
                        }
                    } elseif (in_array('matr_func_insere', $columns)) {
                        if (!isset($requestMapeados['matr_func_insere']) || empty($requestMapeados['matr_func_insere'])) {
                            $requestMapeados['matr_func_insere'] = UserSession::getMatricula();
                        }
                    }

                    if (in_array('dt_insere', $columns)) {
                        if (!isset($requestMapeados['dt_insere']) || empty($requestMapeados['dt_insere'])) {
                            $requestMapeados['dt_insere'] = date('Y-m-d H:i:s.', time()) . substr(microtime(), 2, 3);
                        }
                    }

                    if (in_array('dt_inclusao', $columns)) {
                        if (!isset($requestMapeados['dt_inclusao']) || empty($requestMapeados['dt_inclusao'])) {
                            $requestMapeados['dt_inclusao'] = date('Y-m-d H:i:s.', time()) . substr(microtime(), 2, 3);
                        }
                    }

                    $camposInsercao          = join(', ', array_keys($requestMapeados));
                    $identificacaoParametros = join(', ', array_fill(0, count($requestMapeados), '?'));
                    $paramsSql               = [];

                    foreach ($requestMapeados as $value) {
                        if (is_string($value)) {
                            if (!$value) {
                                array_push($paramsSql, null);
                            } else {
                                array_push($paramsSql, mb_convert_encoding(
                                    $value,
                                    $params['config']['encode'],
                                    $params['config']['encodeFrom']
                                ));
                            }
                        } else {
                            array_push($paramsSql, $value);
                        }
                    }

                    $sql = "
                        INSERT INTO {$inputMap->table}({$camposInsercao}) 
                        OUTPUT INSERTED.* 
                        VALUES ({$identificacaoParametros});
                    ";
                } else {
                    $campos    = join(' = ?,', array_keys($requestMapeados)) . ' = ?';
                    $paramsSql = [];

                    foreach ($requestMapeados as $key => $value) {
                        if (is_string($value)) {
                            if (!$value) {
                                array_push($paramsSql, null);
                            } else {
                                array_push($paramsSql, mb_convert_encoding(
                                    $value,
                                    $params['config']['encode'],
                                    $params['config']['encodeFrom']
                                ));
                            }
                        } else {
                            array_push($paramsSql, $value);
                        }
                    }

                    $sql = "
                        UPDATE {$inputMap->table} SET {$campos} 
                        OUTPUT DELETED.* 
                        WHERE {$whereKey}
                    ";
                }

                $result = $db->query($sql, $paramsSql)->fetchArray();

                if ($isUpdate) {
                    $db->auditUpdate((array)$inputMap, $requestMapeados, $result);
                }
            }

            if ($params['dependency']) {
                foreach ($params['dependency'] as $value) {
                    $paramsDependency = [
                        'transaction' => false,
                    ];

                    if ($result) {
                        $dependencyKey = $value[1]['dependencyKey'] ? $value[1]['dependencyKey'] : $inputMap->key;

                        $paramsDependency['request'] = array_replace_recursive(
                            $value[1]['request'] ? $value[1]['request'] : $request,
                            [$dependencyKey => $result[$inputMap->key]]
                        );
                    }

                    $this->saveDataInTable($value[0], array_replace_recursive($value[1], $paramsDependency));
                }
            }

            if ($params['transaction']) {
                $db->commitTransaction();
            }

            if (is_string($inputMap->key)) {
                $this->setResponse(['id' => $result[$inputMap->key]]);
            } else {
                $this->setResponse($result);
            }
        } catch (Exception $error) {
            if ($params['transaction']) {
                $db->rollbackTransaction();
            }

            phpLog($error);

            $this->setResponse([
                'erro' => 'Erro ao tentar salvar.',
            ]);
        }

        return $this;
    }

    public function formatFloatValue($value, $decimals = 2)
    {
        if (empty($value)) {
            return 0;
        }

        $value = preg_replace('/[^\d,]/', '', $value);
        $value = str_replace(',', '.', $value);
        $value = number_format($value, $decimals, '.', '');

        return is_numeric($value) ? $value : 0;
    }

    public function formatDateByFormat($value, $formatInput = 'd/m/Y', $formatOutput = 'Y-m-d')
    {
        if (empty($value)) {
            return null;
        }

        $value = date_create_from_format($formatInput, $value);
        $value = date_format($value, $formatOutput);

        return $value;
    }

    public function utf8DecodeArray(array $values)
    {
        return array_map(function ($value) {
            if (is_numeric($value)) {
                return $value;
            }

            if (empty($value)) {
                return null;
            }

            if (is_string($value) && mb_detect_encoding($value) == 'UTF-8') {
                return utf8_decode($value);
            }

            return $value;
        }, $values);
    }
}

class RestApiException extends Exception
{
    public function __construct($message = '', $code = 0, Throwable $previous = null)
    {
        if ($message instanceof Exception) {
            $e = $message;
            parent::__construct($e->getMessage(), $e->getCode(), $e->getPrevious());
        } elseif (is_array($message)) {
            parent::__construct(json_encode($message), $code, $previous);
        } else {
            parent::__construct($message, $code, $previous);
        }
    }
}

class RestApiInvalidArgumentException extends InvalidArgumentException
{
    public function __construct($message = '', $code = 0, Throwable $previous = null)
    {
        if (is_array($message)) {
            parent::__construct(json_encode($message), $code, $previous);
        } else {
            parent::__construct($message, $code, $previous);
        }
    }
}
