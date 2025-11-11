import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import DropForm from "@/components/DropForm";

// Use screen from testing library's queries
const screen = require("@testing-library/react").screen;

// Mock the dependencies
jest.mock("lucide-react", () => ({
  Loader2: () => <div>Loading...</div>,
}));

describe("DropForm Component", () => {
  it("should render the form fields correctly", () => {
    // Arrange
    render(<DropForm onSubmit={async () => {}} onCancel={() => {}} />);

    // Act
    const nameInput = screen.getByText("Drop Name");
    const statusSelect = screen.getByText("Status");
    const stockInput = screen.getByText("Stock Count");

    // Assert
    expect(nameInput).toBeInTheDocument();
    expect(statusSelect).toBeInTheDocument();
    expect(stockInput).toBeInTheDocument();
  });
});
