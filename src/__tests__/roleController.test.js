const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("../routes"); // Ajuste o caminho conforme necessário
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync();
// ./utils/initRoles.js
const Role = require("../Models/roleSchema"); // Ajuste o caminho conforme necessário
const User = require("../Models/userSchema");
const Permission = require("../Models/permissionsSchema");
const app = express();

let mongoServer;

// Configurações CORS
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

// Aplicar o middleware antes das rotas
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use("/", routes);

const generateRoleData = (suffix) => ({
    name: `Perfil Teste ${suffix}`,
    permissions: [
        {
            name: "teste_criar",
            description: "Permission to create",
        },
        {
            name: "teste_editar",
            description: "Permission to update",
        },
        {
            name: "teste_deletar",
            description: "Permission to delete",
        },
        {
            name: "teste_visualizar",
            description: "Permission to read",
        },
    ],
});

describe("RoleController Test Suite", () => {
    let authToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        let permissions = [
            {
                name: "perfis_criar",
                description: "Permission to create profiles",
            },
            {
                name: "perfis_editar",
                description: "Permission to update profiles",
            },
            {
                name: "perfis_deletar",
                description: "Permission to delete profiles",
            },
            {
                name: "perfis_visualizar",
                description: "Permission to read profiles",
            },
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
        ];
        let newPermission = null;
        for (const permission of permissions) {
            const existingPermission = await Permission.findOne({
                name: permission.name,
            });
            if (!existingPermission) {
                newPermission = new Permission(permission); // Directly save the permission object
                await newPermission.save();
                console.log(`Permission '${permission.name}' created.`);
            } else {
                console.log(`Permission '${permission.name}' already exists.`);
            }
        }

        const permissionsList = await Permission.find();

        let permissionsId = permissionsList.map((x) => {
            return x._id;
        });

        const newRole = new Role({
            name: "administrador",
            isProtected: true,
            permissions: permissionsId,
        }); // Directly save the role object
        await newRole.save();

        const adminRole = await Role.findOne({ name: "administrador" });

        const hashedPassword = await bcrypt.hash("senha", salt); // Altere a senha padrão conforme necessário
        const adminUser = new User({
            name: "Admin",
            email: "admin@admin.com",
            phone: "1234567890",
            status: true,
            situation: "OK",
            password: hashedPassword,
            role: adminRole._id,
            isProtected: true,
        });
        await adminUser.save();

        const res = await request(app).post("/login").send({
            email: "admin@admin.com",
            password: "senha",
        });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("admin@admin.com");

        authToken = res.body.token;
        userId = res.body.user._id;
    });

    // afterAll(async () => {
    //     await mongoose.disconnect();
    //     await mongoServer.stop();
    // });

    const createRole = async (data) => {
        const response = await request(app)
            .post("/role/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send(data);
        return response;
    };

    it("should create a role", async () => {
        const data = { name: "Admin" };

        const response = await request(app)
            .post("/role/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send(data);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe("Admin");

        roleId = response.body._id;
    });

    //   it('should get all roles', async () => {
    //     const response = await request(app)
    //       .get('/role')
    //       .set('Authorization', `Bearer ${authToken}`);

    //     expect(response.status).toBe(200);
    //     expect(Array.isArray(response.body)).toBe(true);
    //   });

    //   it('should get role by ID', async () => {
    //     const response = await request(app)
    //       .get(`/role/${roleId}`)
    //       .set('Authorization', `Bearer ${authToken}`);

    //     expect(response.status).toBe(200);
    //     expect(response.body).toHaveProperty('_id', roleId);
    //   });

    //   it('should update a role by ID', async () => {
    //     const updatedData = { name: 'SuperAdmin' };

    //     const response = await request(app)
    //       .put(`/role/${roleId}`)
    //       .set('Authorization', `Bearer ${authToken}`)
    //       .send(updatedData);

    //     expect(response.status).toBe(200);
    //     expect(response.body.name).toBe('SuperAdmin');
    //   });

    //   it('should assign permissions to a role', async () => {
    //     // Criar uma permissão de teste
    //     const permission = await Permission.create({ name: 'Test Permission' });

    //     const response = await request(app)
    //       .post(`/role/${roleId}/permissions`)
    //       .set('Authorization', `Bearer ${authToken}`)
    //       .send({ permissions: [permission._id] });

    //     expect(response.status).toBe(200);
    //     expect(response.body.role.permissions).toContain(permission._id.toString());
    //   });

    //   it('should delete a role by ID', async () => {
    //     const response = await request(app)
    //       .delete(`/role/${roleId}`)
    //       .set('Authorization', `Bearer ${authToken}`);

    //     expect(response.status).toBe(204);
    //   });

    //   it('should not delete a protected role', async () => {
    //     // Criar role protegida
    //     const protectedRole = await Role.create({ name: 'Protected', isProtected: true });

    //     const response = await request(app)
    //       .delete(`/role/${protectedRole._id}`)
    //       .set('Authorization', `Bearer ${authToken}`);

    //     expect(response.status).toBe(403);
    //     expect(response.body.message).toBe('Cannot delete protected role');
    //   });

    //   it('should handle role not found', async () => {
    //     const fakeId = new mongoose.Types.ObjectId();

    //     const response = await request(app)
    //       .get(`/role/${fakeId}`)
    //       .set('Authorization', `Bearer ${authToken}`);

    //     expect(response.status).toBe(404);
    //     expect(response.body.message).toBe('Role not found');
    //   });

    // describe("POST /role/create", () => {
    //     it("should create a new role", async () => {
    //         const newRole = generateRoleData("001");
    //         const response = await createRole(newRole);
    //         expect(response.status).toBe(201);
    //         expect(response.body).toHaveProperty("_id");
    //     });

    //     it("should not create a new role with no name", async () => {
    //         const newRole = {
    //             permissions: [
    //                 {
    //                     module: "finance",
    //                     access: ["create"],
    //                 },
    //                 {
    //                     module: "benefits",
    //                     access: ["create"],
    //                 },
    //                 {
    //                     module: "users",
    //                     access: ["create"],
    //                 },
    //             ],
    //         };
    //         const response = await createRole(newRole);
    //         expect(response.status).toBe(400);
    //     });
    // });

    // describe("GET /role", () => {
    //     it("should retrieve all roles", async () => {
    //         const response = await request(app).get("/role").set("Authorization", `Bearer ${authToken}`);
    //         expect(response.status).toBe(200);
    //         expect(response.body).toBeInstanceOf(Array);
    //     });
    // });

    // describe("GET /role/:id", () => {
    //     it("should retrieve a specific role by ID", async () => {
    //         //Create Role
    //         const newRole = generateRoleData("003");
    //         const postResponse = await createRole(newRole);
    //         expect(postResponse.status).toBe(201);
    //         expect(postResponse.body).toHaveProperty("_id");

    //         //Get ID and try access
    //         const roleId = postResponse.body._id;
    //         const getResponse = await request(app).get(`/role/${roleId}`).set("Authorization", `Bearer ${authToken}`);

    //         expect(getResponse.status).toBe(200);
    //         expect(getResponse.body).toHaveProperty("_id", roleId);
    //     });

    //     it("should not retrieve a specific role with invalid ID", async () => {
    //         //Try access with invalid ID
    //         const roleId = "A1";
    //         const getResponse = await request(app).get(`/role/${roleId}`).set("Authorization", `Bearer ${authToken}`);

    //         expect(getResponse.status).toBe(500);
    //     });
    // });

    // describe("PATCH /role/patch/:id", () => {
    //     it("should update the role data", async () => {
    //         //Create Role
    //         const roleData = generateRoleData("007");
    //         const postResponse = await createRole(roleData);
    //         expect(postResponse.status).toBe(201);

    //         const roleId = postResponse.body._id;
    //         const updatedData = {
    //             name: "Perfil Updated",
    //         };

    //         const response = await request(app)
    //             .patch(`/role/patch/${roleId}`)
    //             .send(updatedData);

    //         expect(response.status).toBe(200);
    //         expect(response.body).toHaveProperty("_id", roleId);
    //         expect(response.body.name).toBe("Perfil Updated");
    //     });

    //     it("should not update the role data with invalid ID", async () => {
    //         const roleId = "A1";
    //         const updatedData = {
    //             name: "Perfil Updated",
    //         };

    //         const response = await request(app)
    //             .patch(`/role/patch/${roleId}`)
    //             .set("Authorization", `Bearer ${authToken}`)
    //             .send(updatedData);

    //         expect(response.status).toBe(400);
    //     });
    // });

    // // Novos testes adicionados para deletar role protegida
    // describe("DELETE /role/:id", () => {
    //     it("should delete a specific role", async () => {
    //         const newRole = generateRoleData("004");
    //         const postResponse = await createRole(newRole);
    //         expect(postResponse.status).toBe(201);
    //         const roleId = postResponse.body._id;

    //         const deleteResponse = await request(app).delete(
    //             `/role/delete/${roleId}`
    //         ).set("Authorization", `Bearer ${authToken}`);
    //         expect(deleteResponse.status).toBe(204);
    //     });

    //     it("should not delete a specific role with invalid ID", async () => {
    //         const roleId = "A1";

    //         const deleteResponse = await request(app).delete(
    //             `/role/delete/${roleId}`
    //         ).set("Authorization", `Bearer ${authToken}`);
    //         expect(deleteResponse.status).toBe(500);
    //     });

    //     it("should not delete a protected role", async () => {
    //         // Cria uma nova role protegida
    //         const protectedRoleData = {
    //             name: "Role Protegida",
    //             permissions: [
    //                 { module: "finance", access: ["read"] },
    //                 { module: "benefits", access: ["read"] },
    //             ],
    //             isProtected: true,
    //         };
    //         const postResponse = await createRole(protectedRoleData);
    //         expect(postResponse.status).toBe(201);
    //         const roleId = postResponse.body._id;

    //         // Tenta deletar a role protegida
    //         const deleteResponse = await request(app).delete(
    //             `/role/delete/${roleId}`
    //         ).set("Authorization", `Bearer ${authToken}`);
    //         expect(deleteResponse.status).toBe(403);
    //         expect(deleteResponse.body.message).toBe(
    //             "Cannot delete protected role"
    //         );
    //     });

    //     it("should delete a non-protected role", async () => {
    //         // Cria uma nova role não protegida
    //         const nonProtectedRoleData = {
    //             name: "Role Não Protegida",
    //             permissions: [
    //                 { module: "users", access: ["read"] },
    //                 { module: "benefits", access: ["read"] },
    //             ],
    //             isProtected: false,
    //         };
    //         const postResponse = await createRole(nonProtectedRoleData);
    //         expect(postResponse.status).toBe(201);
    //         const roleId = postResponse.body._id;

    //         // Tenta deletar a role não protegida
    //         const deleteResponse = await request(app).delete(
    //             `/role/delete/${roleId}`
    //         ).set("Authorization", `Bearer ${authToken}`);
    //         expect(deleteResponse.status).toBe(204);
    //     });
    // });
});
