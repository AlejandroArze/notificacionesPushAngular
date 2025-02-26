class EquipmentResponseDTO {
    // Propiedades que representan los campos en la tabla de la base de datos
    equipos_id; // Primary key with auto-increment
    ip; // IP address
    procesador; // Processor
    funcionariousuario; // User functionary
    lector; // Reader
    tarjetavideo; // Video card
    funcionarioasignado; // Assigned employee
    oficina; // Office
    fecharegistro; // Registration date
    codigo; // Code
    memoria; // Memory
    tarjetamadre; // Motherboard
    antivirus; // Antivirus software
    garantia; // Warranty
    discoduro; // Hard drive
    marca; // Brand
    tipo; // Type (integer)
    modelo; // Model
    serie; // Series
    so; // Operating system
    responsable; // Responsible person (integer)
    mac; // MAC address

    // Constructor para inicializar el DTO con valores
    constructor(equipos_id, ip, procesador, funcionariousuario, lector, tarjetavideo, funcionarioasignado, oficina, fecharegistro, codigo, memoria, tarjetamadre, antivirus, garantia, discoduro, marca, tipo, modelo, serie, so, responsable, mac) {
        this.equipos_id = equipos_id; // Asigna el ID del equipo
        this.ip = ip; // Asigna la dirección IP
        this.procesador = procesador; // Asigna el procesador
        this.funcionariousuario = funcionariousuario; // Asigna el usuario funcionario
        this.lector = lector; // Asigna el lector
        this.tarjetavideo = tarjetavideo; // Asigna la tarjeta de video
        this.funcionarioasignado = funcionarioasignado; // Asigna el funcionario asignado
        this.oficina = oficina; // Asigna la oficina
        this.fecharegistro = fecharegistro; // Asigna la fecha de registro
        this.codigo = codigo; // Asigna el código
        this.memoria = memoria; // Asigna la memoria
        this.tarjetamadre = tarjetamadre; // Asigna la tarjeta madre
        this.antivirus = antivirus; // Asigna el antivirus
        this.garantia = garantia; // Asigna la garantía
        this.discoduro = discoduro; // Asigna el disco duro
        this.marca = marca; // Asigna la marca
        this.tipo = tipo; // Asigna el tipo
        this.modelo = modelo; // Asigna el modelo
        this.serie = serie; // Asigna la serie
        this.so = so; // Asigna el sistema operativo
        this.responsable = responsable; // Asigna el responsable
        this.mac = mac; // Asigna la dirección MAC
    }

    static createFromEntity(entity) {
        return new EquipmentResponseDTO(entity);
    }
}

// Exporta la clase EquipmentResponseDTO para que pueda ser utilizada en otros archivos
module.exports = EquipmentResponseDTO;
