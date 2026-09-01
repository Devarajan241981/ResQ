import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModulesShowcase } from "./modules-showcase";
import { LanguageProvider } from "@/lib/i18n/language-context";

function renderShowcase() {
  return render(
    <LanguageProvider>
      <ModulesShowcase />
    </LanguageProvider>,
  );
}

describe("ModulesShowcase", () => {
  it("renders only the live modules — no coming-soon placeholders", () => {
    renderShowcase();
    expect(screen.getAllByText("Live")).toHaveLength(5);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
    expect(screen.queryByText("Lost Pets")).not.toBeInTheDocument();
  });

  it("links live modules to their pages", () => {
    renderShowcase();
    expect(screen.getByRole("link", { name: /Missing Persons/ })).toHaveAttribute(
      "href",
      "/missing-persons",
    );
    expect(screen.getByRole("link", { name: /\bSOS\b/ })).toHaveAttribute("href", "/sos");
  });
});
