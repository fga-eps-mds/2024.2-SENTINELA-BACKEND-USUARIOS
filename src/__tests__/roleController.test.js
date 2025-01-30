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

    it("should get all roles", async () => {
        const response = await request(app)
            .get("/role")
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should get role by ID", async () => {
        const response = await request(app)
            .get(`/role/${roleId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("_id", roleId);
    });

    it("should update a role by ID", async () => {
        const updatedData = { name: "SuperAdmin" };

        const response = await request(app)
            .patch(`/role/patch/${roleId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("SuperAdmin");
    });

    it("should assign permissions to a role", async () => {
        // Criar uma permissão de teste
        const permission = await Permission.create({ name: "Test Permission" });

        const response = await request(app)
            .put(`/roles/${roleId}/permissions`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({ permissions: [permission._id] });

        expect(response.status).toBe(200);
        expect(response.body.role.permissions).toContain(
            permission._id.toString()
        );
    });

    it("should delete a role by ID", async () => {
        const response = await request(app)
            .delete(`/role/delete/${roleId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(204);
    });

    it("should handle role not found", async () => {
        const fakeId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .get(`/role/${fakeId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Role not found");
    });
});
