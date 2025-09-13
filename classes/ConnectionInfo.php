<?php
session_start();

class ConnectionInfo
{
    private static $cn = null;

    public static function get()
    {
        return [
            'default' => [
                'server' => 'polaris2022',
                'connectionParams' => [
                    'Database'              => 'sigo_dados',
                    'UID'                   => 'dev',
                    'PWD'                   => '@Developerd',
                    'ReturnDatesAsStrings'  => true,
                    'CharacterSet'         => 'UTF-8'
                ],
            ],
        ];
    }

    public static function setConnection($cn)
    {
        self::$cn = $cn;
    }

    public static function getConnection()
    {
        return self::$cn;
    }
}
