const request = require("supertest");
const express = require("express");
const dropRoutes = require("../../routes/dropRoutes");
// 1. Import the middleware we need to mock
const authMiddleware = require("../../middleware/authMiddleware");

// 2. Tell Jest to replace the real file with our fake version
jest.mock("../../middleware/authMiddleware", () => ({
  verifyToken: (req, res, next) => {
    // This fake function just adds a mock user and continues
    req.user = { id: 1, email: "test@user.com", is_admin: false };
    next();
  },
  // We also mock verifyAdmin just in case
  verifyAdmin: (req, res, next) => {
    next();
  },
}));

// 3. Setup the app
const app = express();
app.use(express.json());
app.use("/drops", dropRoutes); // Now, when dropRoutes calls verifyToken, it uses our mock

describe("POST /drops/:id/claim Integration Test", () => {
  test("should return 404 for non-existent drop", async () => {
    // We try to claim drop ID 99999
    const res = await request(app).post("/drops/99999/claim");

    // NOW, the request gets past auth and should fail in the controller logic
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Drop not found");
  });
});
