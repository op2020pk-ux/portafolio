<?php
// api/proyectos.php
require_once 'conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->prepare("SELECT * FROM proyectos ORDER BY id DESC");
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['titulo']) && !empty($data['precio'])) {
            if(!empty($data['id'])) {
                // Actualizar
                $stmt = $conn->prepare("UPDATE proyectos SET titulo=:titulo, descripcion=:descripcion, precio=:precio, imagen=:imagen, demo=:demo WHERE id=:id");
                $stmt->bindParam(':id', $data['id']);
            } else {
                // Crear nuevo
                $stmt = $conn->prepare("INSERT INTO proyectos (titulo, descripcion, precio, imagen, demo) VALUES (:titulo, :descripcion, :precio, :imagen, :demo)");
            }
            
            $stmt->bindParam(':titulo', $data['titulo']);
            $stmt->bindParam(':descripcion', $data['descripcion']);
            $stmt->bindParam(':precio', $data['precio']);
            $stmt->bindParam(':imagen', $data['imagen']);
            $stmt->bindParam(':demo', $data['demo']);
            
            if($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Proyecto procesado correctamente"]);
            } else {
                echo json_encode(["status" => "error", "message" => "No se pudo guardar el proyecto"]);
            }
        }
        break;
        
    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id'])) {
            $stmt = $conn->prepare("DELETE FROM proyectos WHERE id = :id");
            $stmt->bindParam(':id', $data['id']);
            if($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Proyecto eliminado"]);
            }
        }
        break;
}
?>