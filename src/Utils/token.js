const jwt = require("jsonwebtoken");
require("dotenv").config();

const { SECRET } = process.env;

const generateToken = (user_id) => {
    const token = jwt.sign({ id: user_id }, SECRET, { expiresIn: "30d" }); // Token expira em 30 dias
    return token;
};

const generateRecoveryPasswordToken = (user_id) => {
    const token = jwt.sign({ id: user_id }, SECRET, { expiresIn: "1d" }); // Token expira em 1 dia
    return token;
};

const checkToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET);
        return decoded.id;
    } catch {
        return res.status(401).json({
            mensagem: "Token inválido ou expirado.",
        });
    }
};

const getLoggedUserId = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token não fornecido" });
    }
    try {
        const decoded = jwt.verify(token, SECRET ?? "S3T1N3L3L4");

        userId = decoded.id;
    } catch (err) {
        console.log(err);
        return -1;
    }
    return userId;
};


const getLoggedUser = async (req, res) => {
    const userId = await getLoggedUserId(req,res); 
    try {
        const user = await User.findById(userId).populate("role");
        if (!user) {
            return res.status(404).send();
        }
        return user;
    } catch (error) {
        // return res.status(500).send(error);
        return res
            .status(500)
            .send({ message: error.message || "Erro interno no servidor" });
    }
};


const tokenValidation = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Separa ---> 'Bearer <token>'

    if (!token) {
        return res.status(401).json({ mensagem: "Tokem não fornecido." });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                mensagem: "Token inválido ou expirado.",
            });
        }

        req.userId = decoded.id;

        next();
    });
};

module.exports = {
    generateToken,
    checkToken,
    tokenValidation,
    getLoggedUserId,
    getLoggedUser,
    generateRecoveryPasswordToken,
};
