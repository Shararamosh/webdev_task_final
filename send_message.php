<?php
header("Content-Type: application/json; charset=UTF-8");
include "db.php";
$method = $_SERVER["REQUEST_METHOD"];
$ip = $_SERVER["REMOTE_ADDR"];
$input = json_decode(file_get_contents("php://input"), true);
switch ($method)
{
    case "GET":
        handleGet($pdo);
        break;
    case "POST":
        handlePost($pdo, $input);
        break;
    case "PUT":
        echo json_encode(["message" => "Метод PUT не поддерживается."]);
        break;
    case "DELETE":
        handleDelete($pdo, $input);
        break;
    default:
        echo json_encode(["message" => "Неподдерживаемый REST-метод:" . $method . "."]);
        break;
}
function handleGet(PDO $pdo)
{
    $sql = "SELECT id, nickname, message, avatar FROM Messages LEFT JOIN Users on Messages.ip = Users.ip";
    $stmt = $pdo->query($sql);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (is_bool($messages))
    {
        echo json_encode(["error"=> "Не удалось найти сообщения."]);
        return;
    }
    echo json_encode($messages);
}
function handlePost(PDO $pdo, $input)
{
    global $ip;
    $sql = "INSERT INTO Users (ip, nickname, avatar) VALUES (:ip, :nickname, :avatar) ON DUPLICATE KEY UPDATE ip = :ip, nickname = :nickname, avatar = :avatar";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["ip" => $ip, "nickname" => $input["nickname"], "avatar" => $input["avatar"]]);
    if ($stmt == false)
    {
        echo json_encode(["error"=> "Не удалось добавить пользователя."]);
        return;
    }
    $sql = "INSERT INTO Messages (ip, message) VALUES (:ip, :message)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(["ip" => $ip, "message" => $input["message"]]);
    if ($stmt == false)
    {
        echo json_encode(["error"=> "Не удалось добавить сообщение."]);
        return;
    }
    $stmt = $pdo->lastInsertId();
    if (is_bool($stmt))
    {
        echo json_encode(["error"=> "Не удалось найти индекс добавленного сообщения."]);
        return;
    }
    $input["id"] = $stmt;
    echo json_encode($input);
}
function handleDelete(PDO $pdo, $input)
{
    $sql = "DELETE FROM Messages WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute(["id" => $input["id"]]);
    if (!$result)
    {
        echo json_encode(["error"=> "Сообщение с индексом " . $input["index"] . " не найдено."]);
        return;
    }
    echo json_encode(["id"=> $input["id"]]);
}