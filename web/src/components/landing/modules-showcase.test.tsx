import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModulesShowcase } from "./modules-showcase";

describe("ModulesShowcase", () => {
  it("renders all 12 modules", () => {
    render(<ModulesShowcase />);
    expect(screen.getAllByText("Live")).toHaveLength(4);
    expect(screen.getAllByText("Coming soon")).toHaveLength(8);
  });

  it("links live modules to their pages", () => {
    render(<ModulesShowcase />);
    expect(screen.getByRole("link", { name: /Missing Persons/ })).toHaveAttribute(
      "href",
      "/missing-persons",
    );
    expect(screen.getByRole("link", { name: /\bSOS\b/ })).toHaveAttribute("href", "/sos");
  });

  it("does not link coming-soon modules", () => {
    render(<ModulesShowcase />);
    expect(screen.queryByRole("link", { name: /Lost Pets/ })).not.toBeInTheDocument();
    expect(screen.getByText("Lost Pets")).toBeInTheDocument();
  });
});
