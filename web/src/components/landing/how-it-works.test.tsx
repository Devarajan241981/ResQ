import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorks } from "./how-it-works";

describe("HowItWorks", () => {
  it("renders all four steps in order", () => {
    render(<HowItWorks />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Report or request help");
    expect(items[3]).toHaveTextContent("Case tracked to resolution");
  });
});
