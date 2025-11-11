const { calculateScore } = require("../../utils/scoreCalculator");

describe("Score Calculator Unit Test", () => {
  test("should return a consistent positive integer score", () => {
    // Mock fixed dates so the test always gives the same result
    const mockUserJoinDate = "2023-01-01T00:00:00Z";
    const mockDropStartDate = "2025-01-01T00:00:00Z";

    const score = calculateScore(mockUserJoinDate, mockDropStartDate);

    // Assertions
    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThan(0);
  });
});
