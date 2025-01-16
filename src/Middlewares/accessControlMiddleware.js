const jwt = require("jsonwebtoken");

const checkPermissions = (permissionName) => {
    return async (req, res, next) => {
        try {
            const decoded = jwt.decode(
                req.headers.authorization?.split(" ")[1]
            );

            const permission = decoded._doc.permissions.find(
                (perm) => perm.name === permissionName
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
