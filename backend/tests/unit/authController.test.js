const { signup } = require("../../controllers/authController");
const db = require("../../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 1. Mock all external dependencies
jest.mock("../../db", () => ({
  query: jest.fn(),
}));
jest.mock("bcryptjs", () => ({
  genSalt: jest.fn(() => Promise.resolve("mockedSalt")),
  hash: jest.fn(() => Promise.resolve("mockedHash")),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedToken"),
}));

// Helper function to create mock req, res
const mockRequest = body => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset process.env in case it's modified
  process.env.JWT_SECRET = "testsecret";
});

describe("authController.signup", () => {
  // Test Case 1: The "Happy Path"
  test("should create a new user successfully", async () => {
    // --- Arrange ---
    const req = mockRequest({ email: "new@user.com", password: "password123" });
    const res = mockResponse();

    // Mock DB return values
    // Mock 1: User check (user does NOT exist)
    db.query.mockResolvedValueOnce({ rows: [] });
    // Mock 2: User count (to make them admin)
    db.query.mockResolvedValueOnce({ rows: [{ count: "0" }] });
    // Mock 3: Insert user (return the new user)
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: "new@user.com", is_admin: true }] });

    // --- Act ---
    await signup(req, res);

    // --- Assert ---
    // Check if password was hashed
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", "mockedSalt");
    // Check if user was inserted
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), ["new@user.com", "mockedHash", true]);
    // Check if JWT was signed
    expect(jwt.sign).toHaveBeenCalled();
    // Check for correct response
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "mockedToken",
        user: { id: 1, email: "new@user.com", is_admin: true },
      })
    );
  });

  // Test Case 2: User Already Exists
  test("should return 409 if user already exists", async () => {
    // --- Arrange ---
    const req = mockRequest({ email: "existing@user.com", password: "password123" });
    const res = mockResponse();

    // Mock DB: User check (user DOES exist)
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, email: "existing@user.com" }] });

    // --- Act ---
    await signup(req, res);

    // --- Assert ---
    // Check that we returned a 409 error
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
    // Check that no hashing or new user insertion was attempted
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(jwt.sign).not.toHaveBeenCalled();
  });
});
