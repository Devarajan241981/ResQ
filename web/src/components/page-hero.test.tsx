import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHero } from "./page-hero";
import { LanguageProvider } from "@/lib/i18n/language-context";

describe("PageHero", () => {
  it("renders the title and subtitle over the banner image", () => {
    render(
      <LanguageProvider>
        <PageHero photo="/images/test.jpg" titleKey="nav.sos" subtitleKey="modules.sos.description" />
      </LanguageProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SOS");
    expect(screen.getByText(/one-tap emergency alert/i)).toBeInTheDocument();
  });
});
