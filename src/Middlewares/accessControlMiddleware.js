const jwt = require("jsonwebtoken");

const checkPermissions = (permissionName) => {
    return async (req, res, next) => {
        try {
            const decoded = jwt.decode(
                req.headers.authorization?.split(" ")[1]
            );
            if(!decoded){
                return res.status(401).json({ mensagem: "Tokem não fornecido." });
            }
            const permission = decoded.permissions.find(
                (perm) => perm === permissionName
            );

            if (!permission) {
                return res
                    .status(400)
                    .send("user has no permission to access resource");
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = { checkPermissions };
