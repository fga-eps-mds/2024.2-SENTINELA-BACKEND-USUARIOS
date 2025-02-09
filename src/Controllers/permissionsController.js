const Permission = require("../Models/permissionsSchema");

// Create a new permission
const createPermission = async (req, res) => {
    try {
        const permission = new Permission(req.body);
        await permission.save();
        res.status(201).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all permissions
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.status(200).json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a permission by ID
const getPermissionById = async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        res.status(200).json(permission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a permission by ID
const updatePermissionById = async (req, res) => {
    try {
        const permission = await Permission.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        if (!permission) {
            return res.status(404).json({ message: "Permission not found" });
        }
        res.status(200).json(permission);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a permission by ID
const deletePermissionById = async (req, res) => {
    try {
        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({ message: "Permission not found" });
        }

        await Permission.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Controlador para buscar permissões pelo nome
const searchPermissionByName = async (req, res) => {
    const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const { name } = req.body;

    if (!name) {
        return res
            .status(400)
            .json({ message: "O parâmetro 'name' é obrigatório." });
    }

    try {
        let safeName = escapeRegex(name);
        // Busca permissões que contenham o nome fornecido (case-insensitive)
        const permissions = await Permission.find({
            name: { $regex: safeName, $options: "i" },
        });

        if (permissions.length === 0) {
            return res
                .status(404)
                .json({ message: "Nenhuma permissão encontrada." });
        }

        return res.status(200).json(permissions);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Erro ao buscar permissões.",
            error: error.message,
        });
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    getPermissionById,
    updatePermissionById,
    deletePermissionById,
    searchPermissionByName,
};
