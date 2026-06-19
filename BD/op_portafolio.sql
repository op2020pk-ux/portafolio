-- CREACION DE TABLAS --

CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    precio VARCHAR(50) NOT NULL,
    imagen TEXT NOT NULL,
    demo VARCHAR(255) DEFAULT '#'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    proyecto VARCHAR(255) NOT NULL,
    precio VARCHAR(50) NOT NULL,
    imagen TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar el proyecto inicial por defecto
INSERT INTO proyectos (titulo, descripcion, precio, imagen, demo) 
VALUES ('Sistema Modular Escolar', 'Completo gestor educativo desarrollado con interfaces de alta calidad y persistencia de datos estable.', '$120.00', 'https://picsum.photos/400/250?random=1', '#');