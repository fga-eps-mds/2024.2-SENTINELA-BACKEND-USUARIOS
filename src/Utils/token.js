const jwt = require("jsonwebtoken");
require("dotenv").config();

const { SECRET } = process.env;
const DEFAULT_SECRET = "S3T1N3L3L4";

class TokenError extends Error {
    constructor(message, statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
    }
}

const createToken = (payload, expiresIn) => {
    return jwt.sign(payload, SECRET ?? DEFAULT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
    if (!token) {
        throw new TokenError("Token não fornecido");
    }

    try {
        return jwt.verify(token, SECRET ?? DEFAULT_SECRET);
    } catch (error) {
        throw new TokenError(`Token inválido ou expirado error: ${error}`);
    }
};

const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) {
        throw new TokenError("Token não fornecido");
    }

    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
        throw new TokenError("Formato de token inválido");
    }

    return token;
};

const generateToken = (user_id, permissions) => {
    return createToken({ id: user_id, ...permissions }, "30d");
};

const generateRecoveryPasswordToken = (user_id) => {
    return createToken({ id: user_id }, "1d");
};

const getLoggedUserId = async (req) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        const decoded = verifyToken(token);
        return decoded.id;
    } catch (error) {
        throw new TokenError(`${error}`);

        return -1;
    }
};

const getLoggedUser = async (req, res) => {
    try {
        const userId = await getLoggedUserId(req);
        if (userId === -1) {
            throw new TokenError("Usuário não autenticado");
        }

        const user = await User.findById(userId).populate("role");
        if (!user) {
            throw new TokenError("Usuário não encontrado", 404);
        }

        return user;
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.statusCode
            ? error.message
            : "Erro interno no servidor";
        return res.status(statusCode).json({ message });
    }
};

const tokenValidation = (req, res, next) => {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);
        const decoded = verifyToken(token);
        req.userId = decoded.id;
        next();
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = error.statusCode
            ? error.message
            : "Erro interno no servidor";
        return res.status(statusCode).json({ message });
    }
};

module.exports = {
    generateToken,
    generateRecoveryPasswordToken,
    getLoggedUserId,
    getLoggedUser,
    tokenValidation,
};
