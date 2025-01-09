// const Role = require("../Models/roleSchema");
const User = require("../Models/userSchema");

async function checkPermissions() {
    return async (req, res, next) => {
        const userId = req.query?.userId;
        const permissionName = req.query?.permissionName;
        const action = req.query?.action;
        try {
            const user = await User.findById(userId).populate("role");
            if (!user || !user.role) {
                return false;
            }
            const permission = user.role.permissions.find(
                (p) => p.module === permissionName
            );

            const has = permission && permission.access.includes(action);

            if (!has) {
                return res.status(403).json({
                    mensagem: "Usuário não possui permissão.",
                });
            }

            next();
        } catch (err) {
            console.erro(err);
        }
    };
}

module.exports = { checkPermissions };
