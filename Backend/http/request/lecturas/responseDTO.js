class LecturasResponseDTO {
    constructor(id, codigo, fecha_hora, oficina, accion) {
      this.id = id;
      this.codigo = codigo;
      this.fecha_hora = fecha_hora;
      this.oficina = oficina;
      this.accion = accion;
    }
  }
  
  module.exports = LecturasResponseDTO;
  