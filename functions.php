<?php
if (!function_exists('tagStyle')) {
    function tagStyle($href, $tag = true)
    {
        $href .= '?t=' . filemtime(str_replace(_URL_HOME_, _DIR_HOME_, $href));
        return $tag ? "<link type=\"text/css\" href=\"{$href}\" rel=\"stylesheet\">" . PHP_EOL : $href;
    }
}

if (!function_exists('tagScript')) {
    function tagScript($src, $tag = true)
    {
        $src .= '?t=' . filemtime(str_replace(_URL_HOME_, _DIR_HOME_, $src));
        return $tag ? "<script type=\"text/javascript\" src=\"{$src}\"></script>" . PHP_EOL : $src;
    }
}

if (!function_exists("phpLog")) {
    function phpLog()
    {
        $backtrace = current(debug_backtrace());
        preg_match('/^\/developer\/([\w]+)/', $_SERVER['SCRIPT_NAME'], $matches);
        $header = "{$backtrace['file']}:{$backtrace['line']} - {$matches[1]}";

        foreach ($backtrace['args'] as $arg) {
            if (is_string($arg)) {
                $content = $arg;
            } else {
                $content = var_export($arg, true);
            }

            $content = highlight_string("<?php\n" . $content, true);
            $content = preg_replace('/(&lt;\?php<br \/>)/', '', $content, 1);
            $content = preg_replace('/<br \/>/', "\n", $content);

            error_log($header . $content);
        }
    }
}

if (!function_exists("sqlBindParams")) {
    function sqlBindParams($sqlQuery, array $sqlParams = [])
    {
        $sqlParams = array_map(function ($value) {
            if (is_null($value)) {
                return 'NULL';
            } elseif (is_numeric($value)) {
                return $value;
            }

            return "'{$value}'";
        }, (array)$sqlParams);

        if (count($sqlParams) > 0) {
            $sqlParams = array_pad($sqlParams, substr_count($sqlQuery, '?'), '');
            $sqlQuery = str_replace(array('?'), array('%s'), $sqlQuery);
            $sqlQuery = vsprintf($sqlQuery, $sqlParams);
            $sqlQuery = rtrim($sqlQuery);
            $sqlQuery = rtrim($sqlQuery, ';') . ';';
        }

        return $sqlQuery;
    }
}

if (!function_exists("sqlLog")) {
    function sqlLog($sqlQuery, array $sqlParams = [])
    {
        phpLog(sqlBindParams($sqlQuery, (array)$sqlParams));
    }
}

if (!function_exists("phpLogModal")) {
    function phpLogModal()
    {
        $backtrace = current(debug_backtrace());
        preg_match('/^\/developer\/([\w]+)/', $_SERVER['SCRIPT_NAME'], $matches);
        $contents = [];

        foreach ($backtrace['args'] as $arg) {
            if (is_string($arg)) {
                $content = $arg;
            } else {
                $content = var_export($arg, true);
            }

            $content = highlight_string("<?php\n" . $content, true);
            $content = preg_replace('/(&lt;\?php<br \/>)/', '', $content, 1);
            $content = preg_replace('/<br \/>/', "\n", $content);

            $contents[] = $content;
        }

        return implode('', $contents);
    }
}

if (!function_exists("sqlLogModal")) {
    function sqlLogModal($sqlQuery, $sqlParams = [])
    {
        return phpLogModal(sqlBindParams($sqlQuery, $sqlParams));
    }
}

if (!function_exists("utf8_decode_array")) {
    function utf8_decode_array($data)
    {
        if (!is_array($data) && !is_object($data)) {
            return utf8_decode($data);
        }
        if (is_array($data)) {
            $request = [];
            foreach ($data as $key => $value) {
                $request[$key] = utf8_decode_array($value);
            }
        } else if (is_object($data)) {
            $request = new stdClass();
            foreach ($data as $key => $value) {
                $request->$key = utf8_decode_array($value);
            }
        }
        return $request;
    }
}

if (!function_exists("utf8_encode_array")) {
    function utf8_encode_array($data)
    {
        if (!is_array($data) && !is_object($data)) {
            return utf8_encode($data);
        }
        if (is_array($data)) {
            $request = [];
            foreach ($data as $key => $value) {
                $request[$key] = utf8_encode_array($value);
            }
        } else if (is_object($data)) {
            $request = new stdClass();
            foreach ($data as $key => $value) {
                $request->$key = utf8_encode_array($value);
            }
        }
        return $request;
    }
}

if (!function_exists('generateFileLink')) {
    function generateFileLink($string) {
        $string = preg_replace('~&([a-z]{1,2})(?:acute|cedil|circ|grave|lig|orn|ring|slash|th|tilde|uml|caron);~i', '$1', htmlentities($string, ENT_QUOTES));
        $string = str_replace(['&ordm;','&ordf;'], ['o','a'], $string);
        $string = str_replace(' ', '-', $string);
        $string = preg_replace('/[^A-Za-z0-9.\-]/', '', $string);
        $string = preg_replace('/-+/', '-', $string);
        return $string;
    }
}