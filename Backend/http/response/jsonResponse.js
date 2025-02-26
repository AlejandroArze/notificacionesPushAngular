// successResponse: Esta función envía una respuesta JSON exitosa al cliente.
// Parámetros:
// - res: El objeto de respuesta de Express.
// - code: El código de estado HTTP (por defecto es 200 - OK).
// - message: Un mensaje explicativo sobre la respuesta.
// - data: Un objeto con los datos adicionales (por defecto es un objeto vacío).
const successResponse = (res, code = 200, message, data = {}) => {

    // Si el objeto 'data' no está vacío, se incluye en la respuesta JSON.
    return Object.keys(data).length != 0 ? res.status(code).json({
        "message": message,
        "data": data
    }) : 
    // Si 'data' está vacío, la respuesta solo contiene el mensaje.
    res.status(code).json({
        "message": message
    })
}

// errorResponse: Esta función envía una respuesta de error al cliente.
// Parámetros:
// - res: El objeto de respuesta de Express.
// - code: El código de estado HTTP (por defecto es 500 - Internal Server Error).
// - message: Un mensaje que describe el error.
const errorResponse = (res, code = 500, message) => {
    // Envía una respuesta JSON con el código de error y el mensaje.
    res.status(code).json({
        "message": message
    })
}

// validationResponse: Esta función envía una respuesta de error de validación al cliente.
// Parámetros:
// - res: El objeto de respuesta de Express.
// - code: El código de estado HTTP (por defecto es 409 - Conflict).
// - message: Un mensaje sobre el error de validación.
// - error: Los detalles del error de validación.
const validationResponse = (res, code = 409, message, error) => {
    // Envía una respuesta JSON con el código de validación, mensaje y detalles del error.
    res.status(code).json({
        "message": message,
        "error": error
    })
}

// Exporta las funciones para que puedan ser usadas en otros módulos.
module.exports = {
    successResponse, 
    errorResponse, 
    validationResponse
}
