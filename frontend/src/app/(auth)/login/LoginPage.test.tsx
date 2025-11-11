import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";

// Mock router and context
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ login: jest.fn() }),
}));

// Mock the auth service
jest.mock("@/services/authService", () => ({
  authService: {
    login: jest.fn(() => Promise.resolve({ token: "123", user: { id: 1 } })),
  },
}));

describe("LoginPage", () => {
  it("allows a user to type in email and password fields", () => {
    // Arrange
    render(<LoginPage />);

    // Act
    const emailInput = screen.getByPlaceholderText("you@example.com") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@user.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Assert
    expect(emailInput.value).toBe("test@user.com");
    expect(passwordInput.value).toBe("password123");
  });
});
