import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

describe("Footer", () => {
  it("renders the platform links and emergency disclaimer", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Missing Persons" })).toHaveAttribute("href", "/missing-persons");
    expect(screen.getByRole("link", { name: "About ResQ India" })).toHaveAttribute("href", "/about");
    expect(screen.getByText(/112/)).toBeInTheDocument();
  });
});
