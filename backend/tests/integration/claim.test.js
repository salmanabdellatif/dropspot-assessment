const request = require("supertest");
const express = require("express");
const dropRoutes = require("../../routes/dropRoutes");
const authMiddleware = require("../../middleware/authMiddleware");
const db = require("../../db"); // Import db to mock it

// 1. Mock the database
jest.mock("../../db", () => ({
  query: jest.fn(),
  // Mock the 'pool' property and its 'connect' method
  pool: {
    connect: jest.fn(() => ({
      query: jest.fn(),
      release: jest.fn(),
    })),
  },
}));

// 2. Mock auth middleware
jest.mock("../../middleware/authMiddleware", () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 1, email: "test@user.com", is_admin: false };
    next();
  },
  verifyAdmin: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/drops", dropRoutes);

describe("POST /drops/:id/claim Integration Test", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  test("should return 404 for non-existent drop", async () => {
    // --- Arrange ---
    // Mock the db.pool.connect().query() chain for the transaction
    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    db.pool.connect.mockResolvedValue(mockClient);

    // Mock the first query in the transaction (SELECT * FROM drops... FOR UPDATE)
    // to return 0 rows
    mockClient.query.mockResolvedValue({ rows: [] });

    // --- Act ---
    const res = await request(app).post("/drops/99999/claim");

    // --- Assert ---
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Drop not found");

    // Check that we rolled back the transaction
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalled();
  });
});
