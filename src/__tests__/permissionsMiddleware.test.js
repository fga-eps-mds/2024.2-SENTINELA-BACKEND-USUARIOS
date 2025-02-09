const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("../routes");
const { MongoMemoryServer } = require("mongodb-memory-server");
const initializeRoles = require("../Utils/initDatabase");

const app = express();
let mongoServer;

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

let authToken;

beforeAll(async () => {
    console.log("Starting beforeAll hook");

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
    authToken = res.body.token;

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("admin@admin.com");

    console.log("Finished beforeAll hook");
}, 30000);

afterAll(async () => {
    console.log("Starting afterAll hook");
    await mongoose.connection.close();
    await mongoServer.stop();
    console.log("Finished afterAll hook");
}, 30000);

describe("User Controller Tests", () => {
    it("should not allow access to protected routes without a token", async () => {
        const res = await request(app).get("/users");

        expect(res.status).toBe(401);
    });

    it("should return 401 if token is not provided", async () => {
        const res = await request(app).get("/users");
        expect(res.status).toBe(401);
        expect(res.body.mensagem).toBe("Tokem não fornecido.");
    });

    test("should grant access if user has permission", async () => {
        const res = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${authToken}`);
        expect(res.status).toBe(200);
    });
});
