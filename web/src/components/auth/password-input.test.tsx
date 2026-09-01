import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PasswordInput } from "./password-input";
import { LanguageProvider } from "@/lib/i18n/language-context";

function renderInput() {
  return render(
    <LanguageProvider>
      <label>
        Password
        <PasswordInput value="secret123" onChange={() => {}} />
      </label>
    </LanguageProvider>,
  );
}

describe("PasswordInput", () => {
  it("masks the value by default", () => {
    renderInput();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("reveals the value when the eye toggle is clicked", async () => {
    const user = userEvent.setup();
    renderInput();
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });

  it("masks it again when clicked a second time", async () => {
    const user = userEvent.setup();
    renderInput();
    await user.click(screen.getByRole("button", { name: "Show password" }));
    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });
});
