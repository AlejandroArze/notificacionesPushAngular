export interface User
{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    image?: string;
    status?: string;
}
/*
export interface User {
    id: string;        // usuarios_id 
    name: string;      // nombres 
    lastName: string;  // apellidos
    email: string;     // email - Correo electrónico del usuario
    role: string;      // role - Rol del usuario
    avatar?: string;   // image - URL de la imagen del usuario (opcional)
    status?: string;   // estado - Estado del usuario (opcional) Activo - Inactivo
    password?: string; // password 
}

*/