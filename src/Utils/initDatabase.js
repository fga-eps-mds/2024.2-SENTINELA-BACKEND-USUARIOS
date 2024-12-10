/*Para inicializar o Database você precisa criar um arquivo .env na raiz do projeto com os seguintes dados:
######################################################################################
    Admin_email=
    Admin_celular=
    Admin_senha=
    User_email=
    User_celular=
    User_senha=
######################################################################################
Altere os dados de forma que melhor desejar para iniciar o banco de dados com um usuário comum e um usuario Administrador.
*/

require("dotenv").config;
// ./utils/initRoles.js
const mongoose = require("mongoose");
const Role = require("../Models/roleSchema"); // Ajuste o caminho conforme necessário
const User = require("../Models/userSchema");
const bcrypt = require("bcryptjs");
const saltRounds = 13;

const senhaAdmin = process.env.Admin_senha;
const emailAdmin = process.env.Admin_email;
const celularAdmin = process.env.Admin_celular;
const senhaUser = process.env.User_senha;
const emailUser = process.env.User_email;
const celularUser = process.env.User_celular;

console.log("Admin Email:", process.env.Admin_email);
console.log("Admin Celular:", process.env.Admin_celular);
console.log("Admin Senha:", process.env.Admin_senha);
console.log("User Email:", process.env.User_email);
console.log("User Celular:", process.env.User_celular);
console.log("User Senha:", process.env.User_senha);

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

            const existingAdmin = await User.findOne({
                email: emailAdmin,
            });
            if (!existingAdmin) {
                const hashedPassword = await bcrypt.hash(
                    senhaAdmin,
                    saltRounds
                );

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
                const hashedPassword = await bcrypt.hash(senhaUser, saltRounds);

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
