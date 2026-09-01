import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AwarenessCarousel } from "./awareness-carousel";
import { LanguageProvider } from "@/lib/i18n/language-context";

describe("AwarenessCarousel", () => {
  it("renders the heading and all five rotating quotes", () => {
    render(
      <LanguageProvider>
        <AwarenessCarousel />
      </LanguageProvider>,
    );
    expect(screen.getByText("Public awareness")).toBeInTheDocument();
    expect(screen.getByText(/one blood donation/i)).toBeInTheDocument();
    // 5 dot buttons for 5 quotes
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marks only the active quote as visible to assistive tech", () => {
    render(
      <LanguageProvider>
        <AwarenessCarousel />
      </LanguageProvider>,
    );
    const first = screen.getByText(/minutes matter/i);
    expect(first).toHaveAttribute("aria-hidden", "false");
    expect(screen.getByText(/one blood donation/i)).toHaveAttribute("aria-hidden", "true");
  });
});
