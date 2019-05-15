<?php
    const DB_NAME       = 'test';
    const DB_USER       = 'root';
    const DB_PASS       = '123';
    const TABLE_NAME    = 'users';

    try
    {
        $db = new PDO('mysql:dbname='.DB_NAME.';host=127.0.0.1', DB_USER, DB_PASS);
    }
    catch(PDOException $e)
    {
        echo 'Connection failed: '.$e->getMessage();
        exit;
    }

    $action = $_POST['action'];
    switch(strtoupper($action))
    {
        case 'GET':
            $output = get_handler($db);
            $output = json_encode($output);
            break;
        case 'UPDATE':
            $output = update_handler($db);
            $output = json_encode($output);
            break;
        case 'DELETE':
            $output = delete_handler($db);
            $output = json_encode($output);
            break;
        case 'ADD':
            $output = add_handler($db);
            $output = json_encode($output);
            break;
    }

    echo $output;
    exit;


    function get_handler($db)
    {
        $get = $_POST['get'];
        if ($get === "*")
            $result = $db->query('SELECT * FROM `'.TABLE_NAME.'`;');
        else
            $result = [];

	    $output = [];
        foreach($result as $row)
        {
            $output[]['id']             = $row['id'];
            $l                          = count($output) - 1;
            $output[$l]['name']         = $row['name'];
            $output[$l]['last_name']    = $row['last_name'];
            $output[$l]['login']        = $row['login'];
            $output[$l]['password']     = $row['password'];
        }
        return $output;
    }

    function update_handler($db)
    {
        $update = $_POST['update'];

        $update = json_decode($update, true)[0];
        $id = $update['id'];
        unset($update['id']);
        foreach ($update as $key => $value)
        {
            $params[] = $key;
            $params[] = '=\'';
            $params[] = $value;
            $params[] = '\'';
            $params[] = ', ';
        }
        array_pop($params);
        $params_string = implode($params);

        $result = $db->query('UPDATE `'.TABLE_NAME.'` SET '.$params_string.'  WHERE id = '.$id.';');

        return $result !== false;
    }

    function delete_handler($db)
    {
        $delete = $_POST['delete'];
        
        $delete = json_decode($delete, true)[0];

        foreach ($delete as $key => $value)
        {
            $condition[] = $key;
            $condition[] = ' = \'';
            $condition[] = $value;
            $condition[] = '\'';
            $condition[] = ',';
        }
        array_pop($condition);
        $condition_string = implode($condition);
        $result = $db->query('DELETE FROM `'.TABLE_NAME.'` WHERE '.$condition_string.';');
        return $result !== false;
    }

    function add_handler($db)
    {
        $add = $_POST['add'];
        
        $add = json_decode($add, true)[0];
        
        $add = array_map(function($value) {
            return '\''.$value.'\'';
        }, $add);
        
        $params = implode(", ", array_keys($add));
        $values = implode(", ", $add);
        $result = $db->query('INSERT INTO `'.TABLE_NAME.'` ('.$params.') VALUES ('.$values.');');

        return $result != false ? $db->lastInsertId() : false;
    }
