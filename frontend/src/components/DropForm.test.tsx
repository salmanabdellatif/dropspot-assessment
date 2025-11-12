import { render, screen } from "@testing-library/react";
import DropForm from "@/components/DropForm";

// 1. Mock ALL icons from lucide-react (Loader2 AND Sparkles)
jest.mock("lucide-react", () => ({
  Loader2: () => <span>Loader</span>,
  Sparkles: () => <span>AI</span>,
}));

// 2. Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// 3. Mock the AI service
jest.mock("@/services/aiService", () => ({
  aiService: {
    generateDescription: jest.fn(),
  },
}));

describe("DropForm Component", () => {
  it("should render the form fields correctly", () => {
    // Arrange
    render(<DropForm onSubmit={async () => {}} onCancel={() => {}} />);

    // Act
    const nameInput = screen.getByText("Drop Name");
    const statusSelect = screen.getByText("Status");
    const stockInput = screen.getByText("Stock Count");
    const aiButton = screen.getByText("Generate with AI");

    // Assert
    expect(nameInput).toBeInTheDocument();
    expect(statusSelect).toBeInTheDocument();
    expect(stockInput).toBeInTheDocument();
    expect(aiButton).toBeInTheDocument();
  });
});
