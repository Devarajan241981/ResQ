import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TrustSection } from "./trust-section";

describe("TrustSection", () => {
  it("renders all three trust principles", () => {
    render(<TrustSection />);
    expect(screen.getByText("Verification first")).toBeInTheDocument();
    expect(screen.getByText("Security by design")).toBeInTheDocument();
    expect(screen.getByText("Privacy-respecting")).toBeInTheDocument();
  });
});
