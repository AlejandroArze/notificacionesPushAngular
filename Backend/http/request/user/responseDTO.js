class UserDTO {

    // Definimos las propiedades de la clase UserDTO que representan los datos del usuario para la vista.
    usuarios_id; // Clave primaria, el identificador único del usuario.
    nombres; // Nombres del usuario.
    apellidos; // Apellidos del usuario.
    usuario; // Nombre de usuario o username.
    email; // Correo electrónico del usuario.
    estado; // Estado del usuario, que puede ser 1 o 0 (activo o inactivo).
    role; // Rol del usuario en el sistema.
    image; // Imagen del perfil del usuario.

    // Constructor para inicializar la instancia de la clase UserDTO con los valores proporcionados.
    constructor(
        usuarios_id, 
        nombres, 
        apellidos, 
        usuario, 
        email, 
        estado, 
        role, 
        image
    ) {
        this.usuarios_id = Number(usuarios_id);
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.usuario = usuario;
        this.email = email;
        this.estado = Number(estado);
        this.role = role;
        this.image = image;
    }
}

// Exporta la clase UserDTO para que pueda ser utilizada en otras partes del proyecto.
module.exports = UserDTO;
