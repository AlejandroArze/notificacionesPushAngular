-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    usuarios_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    usuario VARCHAR(255) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role INTEGER NOT NULL,
    image VARCHAR(255),
    estado INTEGER NOT NULL DEFAULT 1
);

-- Crear tabla de gestiones
CREATE TABLE IF NOT EXISTS gestions (
    gestions_id SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL,
    numero INTEGER NOT NULL,
    anio TEXT NOT NULL,
    estado INTEGER NOT NULL
);

-- Insertar una gestión por defecto
INSERT INTO gestions (descripcion, numero, anio, estado) 
VALUES ('Gestión 2025', 1, '2025', 1);

-- Insertar usuario admin por defecto
INSERT INTO usuarios (
    email, 
    usuario, 
    nombres, 
    apellidos, 
    password, 
    role, 
    estado
) VALUES (
    'admin@example.com',
    'admin',
    'Admin',
    'System',
    '$2a$10$X/HQhYH3hB.08WLHqQ0KPOYVGGJu9QyPQz1J8VxrB.jqXqQE3jVjm',
    1,
    1
) ON CONFLICT (email) DO NOTHING; 