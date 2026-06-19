<?php
// api/compras.php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM compras ORDER BY id DESC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Registrar una nueva compra/solicitud
        if(!empty($data['action']) && $data['action'] == 'registrar') {
            $stmt = $conn->prepare("INSERT INTO compras (codigo, nombre, telefono, correo, proyecto, precio, imagen) VALUES (:codigo, :nombre, :telefono, :correo, :proyecto, :precio, :imagen)");
            $stmt->bindParam(':codigo', $data['codigo']);
            $stmt->bindParam(':nombre', $data['nombre']);
            $stmt->bindParam(':telefono', $data['telefono']);
            $stmt->bindParam(':correo', $data['correo']);
            $stmt->bindParam(':proyecto', $data['proyecto']);
            $stmt->bindParam(':precio', $data['precio']);
            $stmt->bindParam(':imagen', $data['imagen']);
            
            if($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            }
        }
        // Actualizar estado (Autorizar / Denegar)
        elseif(!empty($data['action']) && $data['action'] == 'cambiar_estado') {
            $stmt = $conn->prepare("UPDATE compras SET estado = :estado WHERE codigo = :codigo");
            $stmt->bindParam(':estado', $data['estado']);
            $stmt->bindParam(':codigo', $data['codigo']);
            
            if($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            }
        }
        // Limpiar Historial completo
        elseif(!empty($data['action']) && $data['action'] == 'limpiar') {
            $stmt = $conn->prepare("TRUNCATE TABLE compras");
            if($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            }
        }
        break;
}
?>