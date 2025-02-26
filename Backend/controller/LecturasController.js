const LecturasService = require("../service/lecturasService");
const jsonResponse = require("../http/response/jsonResponse");
const storeDTO = require("../http/request/lecturas/storeDTO");
const updateDTO = require("../http/request/lecturas/updateDTO");
const idDTO = require("../http/request/lecturas/idDTO");

class LecturasController {
  static async store(req, res) {
    try {
      const data = await storeDTO.validateAsync(req.body);
      const lectura = await LecturasService.store(data);
      return jsonResponse.successResponse(res, 201, "Entry created", lectura);
    } catch (error) {
      return jsonResponse.errorResponse(res, 500, error.message);
    }
  }

  static async show(req, res) {
    try {
      const { id } = await idDTO.validateAsync(req.params);
      const lectura = await LecturasService.show(id);
      if (!lectura) return jsonResponse.errorResponse(res, 404, "Entry not found");
      return jsonResponse.successResponse(res, 200, "Entry found", lectura);
    } catch (error) {
      return jsonResponse.errorResponse(res, 500, error.message);
    }
  }

  static async paginate(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    try {
      const { count, rows } = await LecturasService.paginate({ page, limit });
      return jsonResponse.successResponse(res, 200, "Entries retrieved", {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        data: rows,
      });
    } catch (error) {
      return jsonResponse.errorResponse(res, 500, error.message);
    }
  }

  static async update(req, res) {
    try {
      const { id } = await idDTO.validateAsync(req.params);
      const data = await updateDTO.validateAsync(req.body);
      await LecturasService.update(id, data);
      return jsonResponse.successResponse(res, 200, "Entry updated", data);
    } catch (error) {
      return jsonResponse.errorResponse(res, 500, error.message);
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = await idDTO.validateAsync(req.params);
      await LecturasService.destroy(id);
      return jsonResponse.successResponse(res, 200, "Entry deleted");
    } catch (error) {
      return jsonResponse.errorResponse(res, 500, error.message);
    }
  }
}

module.exports = LecturasController;
