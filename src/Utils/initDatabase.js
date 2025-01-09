// ./utils/initRoles.js
const mongoose = require("mongoose");
const Role = require("../Models/roleSchema"); // Ajuste o caminho conforme necessário
const User = require("../Models/userSchema");
const bcrypt = require("bcryptjs");
const Permission = require("../Models/permissionsSchema");

const salt = bcrypt.genSaltSync();

const initializeRoles = async () => {
    const roles = [
        {
            name: "administrador",
            isProtected: true,
        },
        {
            name: "sindicalizado",
            isProtected: true,
        },
        {
            name: "Usuário",
            isProtected: true,
        },
    ];
    const permissions = [
        { name: "create", description: "Permission to create resources" },
        { name: "read", description: "Permission to read resources" },
        { name: "update", description: "Permission to update resources" },
        { name: "delete", description: "Permission to delete resources" },
        {
            name: "call in the grau",
            description: "Special permission for privileged actions",
        },
    ];

    try {
        for (const permission of permissions) {
            const existingPermission = await Permission.findOne({
                name: permission.name,
            });
            if (!existingPermission) {
                const newPermission = new Permission(permission); // Directly save the permission object
                await newPermission.save();
                console.log(`Permission '${permission.name}' created.`);
            } else {
                console.log(`Permission '${permission.name}' already exists.`);
            }
            console.log("kid-abelha");
        }

        // Check if the Mongoose connection is open
        if (mongoose.connection.readyState === 1) {
            for (const role of roles) {
                const existingRole = await Role.findOne({ name: role.name });
                const permissions = await Permission.find();

                if (!existingRole) {
                    let permissionsData = [];
                    if (role.name == "administrador") {
                        permissionsData = permissions.map((x) => {
                            return x._id;
                        });
                    } else {
                        permissionsData = [];
                    }
                    const newRole = new Role({
                        ...role,
                        permissions: permissionsData,
                    }); // Directly save the role object
                    await newRole.save();
                    console.log(`Role '${role.name}' created.`);
                } else {
                    console.log(`Role '${role.name}' already exists.`);
                }
            }
        } else {
            console.error("Mongoose connection is not open");
        }
    } catch (err) {
        console.error("Error initializing permissions:", err);
    }

    try {
        // Verificar se a conexão está aberta antes de executar
        if (mongoose.connection.readyState === 1) {
            // Busca o user 'administrador'
            const adminRole = await Role.findOne({ name: "administrador" });
            if (!adminRole) {
                console.error(
                    'Role "administrador" não encontrada. Crie a role antes de adicionar o usuário administrador.'
                );
                return;
            }
            const userRole = await Role.findOne({ name: "Usuário" });
            if (!userRole) {
                console.error(
                    'Role "Usuário" nao encontrada. Crie a role antes de acidionar o usuário'
                );
                return;
            }

            // Verifica se o usuário administrador já existe
            const existingAdmin = await User.findOne({
                email: "admin@admin.com",
            });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash("senha", salt); // Altere a senha padrão conforme necessário

                // Cria o usuário administrador
                const adminUser = new User({
                    name: "Admin",
                    email: "admin@admin.com",
                    phone: "1234567890",
                    status: true,
                    password: hashedPassword,
                    role: adminRole._id,
                    isProtected: true,
                });

                await adminUser.save();
                console.log("Usuário administrador criado com sucesso.");
            } else {
                console.log("Usuário administrador já existe.");
            }

            const ExistingSindicalizado = await User.findOne({
                email: "user@user.com",
            });
            if (!ExistingSindicalizado) {
                const hashedPassword = await bcrypt.hash("senha", salt); // Altere a senha padrão conforme necessário

                // Cria o usuário administrador
                const sindUser = new User({
                    name: "User",
                    email: "user@user.com",
                    phone: "61981818181",
                    status: true,
                    password: hashedPassword,
                    role: userRole,
                    isProtected: true,
                });

                await sindUser.save();
                console.log("Usuário sindicalizado criado com sucesso.");
            } else {
                console.log("Usuário sindicalizado já existe.");
            }
        } else {
            console.error("Mongoose connection is not open");
        }
    } catch (err) {
        console.error("Error initializing admin user:", err);
    }
};

module.exports = initializeRoles;
