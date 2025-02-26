const { LecturasRFID } = require("../models");

class LecturasService {
  static async store(data) {
    return await LecturasRFID.create(data);
  }

  static async show(id) {
    return await LecturasRFID.findByPk(id);
  }

  static async paginate({ page, limit }) {
    const offset = (page - 1) * limit;
    return await LecturasRFID.findAndCountAll({
      limit,
      offset,
      order: [["id", "DESC"]],
    });
  }

  static async update(id, data) {
    return await LecturasRFID.update(data, { where: { id } });
  }

  static async destroy(id) {
    return await LecturasRFID.destroy({ where: { id } });
  }
}

module.exports = LecturasService;
