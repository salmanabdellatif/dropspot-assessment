const request = require("supertest");
const express = require("express");
const adminRoutes = require("../../routes/adminRoutes");
const db = require("../../db");

// --- 1. MOCK DEPENDENCIES ---

// Mock the database
jest.mock("../../db", () => ({
  query: jest.fn(),
}));

// Mock the auth middleware
jest.mock("../../middleware/authMiddleware", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 1, email: "admin@test.com", is_admin: true };
    next();
  }),
  verifyAdmin: jest.fn((req, res, next) => {
    next();
  }),
}));

// --- 2. SETUP APP ---
const app = express();
app.use(express.json());
app.use("/admin", adminRoutes);

// --- 3. THE TESTS ---
describe("Admin Routes Integration Test", () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /admin/drops should create a drop for an admin user", async () => {
    // --- Arrange ---
    const mockDropData = {
      name: "Test Drop",
      description: "A test drop",
      stock_count: 100,
      starts_at: "2025-12-01T10:00:00Z",
      ends_at: "2025-12-01T11:00:00Z",
    };

    // This is what we expect the DB to return
    const mockCreatedDrop = {
      id: 123,
      ...mockDropData,
      status: "upcoming",
    };

    // Tell our fake DB to return this mock object when "INSERT" is called
    db.query.mockResolvedValueOnce({ rows: [mockCreatedDrop] });

    // --- Act ---
    const res = await request(app).post("/admin/drops").send(mockDropData);

    // --- Assert ---
    // Check for 201 Created status
    expect(res.statusCode).toBe(201);

    // Check that the response body is the new drop
    expect(res.body).toEqual(mockCreatedDrop);

    // Check that the DB was called with the correct data
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO drops"), [
      mockDropData.name,
      mockDropData.description,
      mockDropData.stock_count,
      mockDropData.starts_at,
      mockDropData.ends_at,
    ]);
  });
});
