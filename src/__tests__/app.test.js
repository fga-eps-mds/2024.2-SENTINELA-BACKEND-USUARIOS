const mongoose = require("mongoose");
const request = require("supertest");
const { app, startServer } = require("../index");
const initializeRoles = require("../Utils/initDatabase");

jest.spyOn(mongoose, "connect").mockResolvedValue();
jest.mock("../Utils/initDatabase");

describe("Express App Tests", () => {
    beforeEach(() => {
        process.env.SECRET = "test_secret";
        process.env.FRONT_HOST = "localhost";
        process.env.PORT = 3000;
        jest.resetModules();
    });

    it("should return 'Hello, world!' for GET /", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("Hello, world!");
    });

    it("should allow requests with correct CORS origin", async () => {
        const response = await request(app)
            .get("/")
            .set("Origin", "http://localhost");

        expect(response.statusCode).toBe(200);
    });

    it("should block requests with incorrect CORS origin", async () => {
        process.env.FRONT_HOST = "example.com";
        const response = await request(app)
            .get("/")
            .set("Origin", "http://notallowed.com");

        expect(response.statusCode).toBe(500);
    });

    it("should start the server and connect to MongoDB", async () => {
        const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation();

        await startServer();

        expect(mongoose.connect).toHaveBeenCalled();
        expect(initializeRoles).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith("Connected to MongoDB");

        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    afterAll(() => {
        jest.restoreAllMocks();
        mongoose.disconnect();
    });
});
