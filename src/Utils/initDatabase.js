const mongoose = require("mongoose");
const Role = require("../Models/roleSchema");
const User = require("../Models/userSchema");
const bcrypt = require("bcryptjs");
const Permission = require("../Models/permissionsSchema");

const salt = bcrypt.genSaltSync();

const roles = [
    { name: "administrador", isProtected: true },
    { name: "sindicalizado", isProtected: true },
    { name: "Usuário", isProtected: true },
];

const permissions = [
    { name: "create", description: "Permission to create resources" },
    { name: "read", description: "Permission to read resources" },
    { name: "update", description: "Permission to update resources" },
    { name: "delete", description: "Permission to delete resources" },
    // User permissions
    { name: "usuarios_criar", description: "Permission to create users" },
    { name: "usuarios_editar", description: "Permission to update users" },
    { name: "usuarios_deletar", description: "Permission to delete users" },
    { name: "usuarios_visualizar", description: "Permission to read users" },
    {
        name: "usuarios_visualizar_historico",
        description: "Usuário visualiza historico",
    },
    // Profile permissions
    { name: "perfis_criar", description: "Permission to create profiles" },
    { name: "perfis_editar", description: "Permission to update profiles" },
    { name: "perfis_deletar", description: "Permission to delete profiles" },
    { name: "perfis_visualizar", description: "Permission to read profiles" },
    // Organization permissions
    { name: "orgaos_criar", description: "Permission to create organizations" },
    {
        name: "orgaos_editar",
        description: "Permission to update organizations",
    },
    {
        name: "orgaos_deletar",
        description: "Permission to delete organizations",
    },
    {
        name: "orgaos_visualizar",
        description: "Permission to read organizations",
    },
    // Supplier permissions
    {
        name: "fornecedores_criar",
        description: "Permission to create suppliers",
    },
    {
        name: "fornecedores_editar",
        description: "Permission to update suppliers",
    },
    {
        name: "fornecedores_deletar",
        description: "Permission to delete suppliers",
    },
    {
        name: "fornecedores_visualizar",
        description: "Permission to read suppliers",
    },
    // Bank account permissions
    {
        name: "contas_bancarias_criar",
        description: "Permission to create bank accounts",
    },
    {
        name: "contas_bancarias_editar",
        description: "Permission to update bank accounts",
    },
    {
        name: "contas_bancarias_deletar",
        description: "Permission to delete bank accounts",
    },
    {
        name: "contas_bancarias_visualizar",
        description: "Permission to read bank accounts",
    },
    // Financial transaction permissions
    {
        name: "movimentacao_financeira_criar",
        description: "Permission to create financial transactions",
    },
    {
        name: "movimentacao_financeira_editar",
        description: "Permission to update financial transactions",
    },
    {
        name: "movimentacao_financeira_deletar",
        description: "Permission to delete financial transactions",
    },
    {
        name: "movimentacao_financeira_visualizar",
        description: "Permission to read financial transactions",
    },
    // Permission management
    {
        name: "permissoes_criar",
        description: "Permission to create permissions",
    },
    {
        name: "permissoes_editar",
        description: "Permission to update permissions",
    },
    {
        name: "permissoes_deletar",
        description: "Permission to delete permissions",
    },
    {
        name: "permissoes_visualizar",
        description: "Permission to read permissions",
    },
    // Benefits permissions
    { name: "beneficios_criar", description: "Permission to create benefits" },
    { name: "beneficios_editar", description: "Permission to update benefits" },
    {
        name: "beneficios_deletar",
        description: "Permission to delete benefits",
    },
    {
        name: "beneficios_visualizar",
        description: "Permission to read benefits",
    },
    // Membership permissions
    {
        name: "associados_criar",
        description: "Permission to create membership",
    },
    {
        name: "associados_editar",
        description: "Permission to update membership",
    },
    {
        name: "associados_deletar",
        description: "Permission to delete membership",
    },
    {
        name: "associados_visualizar",
        description: "Permission to read membership",
    },
    // Union member permissions
    { name: "filiados_cadastrar", description: "Cadastrar novo filiado" },
    {
        name: "filiado_visualizar_carteirinha",
        description: "Visualizar carteirinha do filiado",
    },
    {
        name: "patrimonio_criar",
        description: "Permission to create asset",
    },
    {
        name: "patrimonio_deletar",
        description: "Permission to delete asset",
    },
    {
        name: "patrimonio_visualizar",
        description: "Permission to read asset",
    },
    {
        name: "patrimonio_editar",
        description: "Permission to update asset",
    },
    {
        name: "sindicalizado_visualizar_status",
        description: "Verificar status sindicalizado",
    },
];

const defaultUsers = [
    {
        name: "Admin",
        email: "admin@admin.com",
        phone: "1234567890",
        status: true,
        situation: "OK",
        password: "senha",
        roleName: "administrador",
        isProtected: true,
    },
    {
        name: "User",
        email: "user@user.com",
        phone: "61981818181",
        status: true,
        password: "senha",
        roleName: "Usuário",
        isProtected: true,
    },
];

const checkMongooseConnection = () => {
    if (mongoose.connection.readyState !== 1) {
        throw new Error("Mongoose connection is not open");
    }
};

const createPermission = async (permission) => {
    const existingPermission = await Permission.findOne({
        name: permission.name,
    });
    if (!existingPermission) {
        const newPermission = new Permission(permission);
        await newPermission.save();
    }
};

const createRole = async (role, allPermissions) => {
    const existingRole = await Role.findOne({ name: role.name });
    if (!existingRole) {
        const permissionsData =
            role.name === "administrador"
                ? allPermissions.map((x) => x._id)
                : [];
        const newRole = new Role({ ...role, permissions: permissionsData });
        await newRole.save();
        return newRole;
    } else {
        return existingRole;
    }
};

const createUser = async (userData, roleObj) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        const user = new User({
            ...userData,
            password: hashedPassword,
            role: roleObj._id,
        });
        await user.save();
    }
};

const initializeRoles = async () => {
    try {
        checkMongooseConnection();

        // Initialize permissions
        await Promise.all(
            permissions.map((permission) => createPermission(permission))
        );

        // Initialize roles
        const allPermissions = await Permission.find();
        const createdRoles = {};
        for (const role of roles) {
            createdRoles[role.name] = await createRole(role, allPermissions);
        }

        // Initialize users
        await Promise.all(
            defaultUsers.map((userData) =>
                createUser(userData, createdRoles[userData.roleName])
            )
        );
    } catch (error) {
        console.error("Initialization error:", error);
    }
};

module.exports = initializeRoles;
