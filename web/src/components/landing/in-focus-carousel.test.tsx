import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InFocusCarousel } from "./in-focus-carousel";

describe("InFocusCarousel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the first slide initially", () => {
    render(<InFocusCarousel />);
    expect(screen.getByText("Every minute counts when someone goes missing")).toBeInTheDocument();
  });

  it("auto-advances to the next slide after the interval elapses", () => {
    vi.useFakeTimers();
    render(<InFocusCarousel />);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText("One tap sends help your way")).toBeInTheDocument();
  });

  it("advances on manual Next click", async () => {
    const user = userEvent.setup();
    render(<InFocusCarousel />);

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("One tap sends help your way")).toBeInTheDocument();
  });

  it("goes to the previous slide, wrapping around from the first", async () => {
    const user = userEvent.setup();
    render(<InFocusCarousel />);

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Coordinated response when disaster strikes")).toBeInTheDocument();
  });

  it("jumps to a slide via the dot indicators", async () => {
    const user = userEvent.setup();
    render(<InFocusCarousel />);

    await user.click(screen.getByRole("button", { name: "Go to slide 3" }));
    expect(screen.getByText("A donor nearby could save a life today")).toBeInTheDocument();
  });
});
