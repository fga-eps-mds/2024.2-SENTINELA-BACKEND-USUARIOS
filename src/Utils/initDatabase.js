// ./utils/initRoles.js
const mongoose = require("mongoose");
const Role = require("../Models/roleSchema"); // Ajuste o caminho conforme necessário
const User = require("../Models/userSchema");
const { hashSenha } = require("./passwordController");

//dados a seguir devem ser colocados em variáveis de ambiente.
const senhaAdmin = "senha";
const emailAdmin = "admim@admin.com";
const celularAdmin = "1234567890";
const senhaUser = "senha";
const emailUser = "user@user.com";
const celularUser = "61981818181";

const initializeRoles = async () => {
    const roles = [
        {
            name: "administrador",
            permissions: [
                {
                    module: "users",
                    access: ["create", "read", "update", "delete"],
                },
                {
                    module: "finance",
                    access: ["create", "read", "update", "delete"],
                },
                {
                    module: "benefits",
                    access: ["create", "read", "update", "delete"],
                },
                {
                    module: "juridic",
                    access: ["create", "read", "update", "delete"],
                },
            ],
            isProtected: true,
        },
        {
            name: "sindicalizado",
            permissions: [
                {
                    module: "basic",
                    access: ["create", "read", "update", "delete"],
                },
            ],
            isProtected: true,
        },
        {
            name: "Usuário",
            permissions: [
                {
                    module: "users",
                    access: ["read"],
                },
            ],
            isProtected: true,
        },
    ];

    try {
        if (mongoose.connection.readyState === 1) {
            for (const roleData of roles) {
                const existingRole = await Role.findOne({
                    name: roleData.name,
                });
                if (!existingRole) {
                    const role = new Role(roleData);
                    await role.save();
                    console.log(`Role ${roleData.name} created`);
                } else {
                    console.log(`Role ${roleData.name} already exists`);
                }
            }
        } else {
            console.error("Mongoose connection is not open");
        }
    } catch (err) {
        console.error("Error initializing roles:", err);
    }

    try {
        if (mongoose.connection.readyState === 1) {
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

            const existingAdmin = await User.findOne({
                email: emailAdmin,
            });
            if (!existingAdmin) {
                const hashedPassword = hashSenha(senhaAdmin);

                const adminUser = new User({
                    name: "Admin",
                    email: emailAdmin,
                    phone: celularAdmin,
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
                email: emailUser,
            });
            if (!ExistingSindicalizado) {
                const hashedPassword = hashSenha(senhaUser);

                const sindUser = new User({
                    name: "User",
                    email: emailUser,
                    phone: celularUser,
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
