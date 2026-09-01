import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";
import { LanguageProvider } from "@/lib/i18n/language-context";

describe("Footer", () => {
  it("renders the platform links and emergency disclaimer", () => {
    render(
      <LanguageProvider>
        <Footer />
      </LanguageProvider>,
    );
    expect(screen.getByRole("link", { name: "Missing Persons" })).toHaveAttribute("href", "/missing-persons");
    expect(screen.getByRole("link", { name: "About ResQ Bharath" })).toHaveAttribute("href", "/about");
    expect(screen.getByText(/112/)).toBeInTheDocument();
  });
});
