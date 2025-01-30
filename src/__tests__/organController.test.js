const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("../routes"); // Ajuste o caminho conforme necessário
const { MongoMemoryServer } = require("mongodb-memory-server");
const initializeRoles = require("../Utils/initDatabase");

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

describe("Organ Controller Tests", () => {
    let organId;
    let authToken;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        try {
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("MongoDB Connected");
        } catch (err) {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1);
        }

        await initializeRoles();

        const res = await request(app).post("/login").send({
            email: "admin@admin.com",
            password: "senha",
        });

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe("admin@admin.com");

        authToken = res.body.token;
        userId = res.body.user._id;
    });

    it("should create a new organ", async () => {
        const res = await request(app)
            .post("/organ/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                orgao: "Orgao Test",
                lotacao: [
                    { nomeLotacao: "Lotacao Test 1", sigla: "LT1" },
                    { nomeLotacao: "Lotacao Test 2", sigla: "LT2" },
                ],
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.orgao).toBe("Orgao Test");
        organId = res.body._id; // Guardar o ID do órgão criado
    });

    it("should return 409 if the organ already exists", async () => {
        const res = await request(app)
            .post("/organ/create")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                orgao: "Orgao Test",
                lotacao: [
                    { nomeLotacao: "Lotacao Test 1", sigla: "LT1" },
                    { nomeLotacao: "Lotacao Test 2", sigla: "LT2" },
                ],
            });

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("error", "Nome já cadastrado");
    });

    it("should get all organs", async () => {
        const res = await request(app)
            .get("/organ/list")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it("should get an organ by ID", async () => {
        const res = await request(app)
            .get(`/organ/get/${organId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("orgao", "Orgao Test");
    });
    it("should return 404 if the organ does not exist", async () => {
        const invalidId = "12345";
        const res = await request(app)
            .get(`/organ/get/${invalidId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.status).toBe(500);
    });
    it("should update an organ by ID", async () => {
        const res = await request(app)
            .patch(`/organ/update/${organId}`)
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                lotacao: [
                    { nomeLotacao: "teste", sigla: "LT1" },
                    { nomeLotacao: "Lotacao Test 2", sigla: "LT2" },
                ],
            });

        expect(res.status).toBe(200);

        // Verifica se o array 'lotacao' na resposta contém os objetos esperados
        expect(res.body.lotacao).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ nomeLotacao: "teste", sigla: "LT1" }),
                expect.objectContaining({
                    nomeLotacao: "Lotacao Test 2",
                    sigla: "LT2",
                }),
            ])
        );
    });
    it("should return 400 if the organ does not exist", async () => {
        const invalidId = "12345";
        const res = await request(app)
            .patch(`/organ/update/${invalidId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.status).toBe(400);
    });

    it("should delete an organ by ID", async () => {
        console.log(organId);
        const res = await request(app)
            .delete(`/organ/delete/${organId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.status).toBe(200);

        // Verificar se o órgão foi realmente deletado
        const checkRes = await request(app)
            .get(`/organ/delete/${organId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(checkRes.status).toBe(404);

        //verifica se é um id válido
        const invalidId = "12345";
        const resInvalidId = await request(app)
            .delete(`/organ/delete/${invalidId}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(resInvalidId.status).toBe(400);
    });

    afterAll(async () => {
        await mongoose.connection.close();
        await mongoServer.stop();
    });
});
