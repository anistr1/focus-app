import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsCard } from "./AnalyticsCard";
import { createSessionRecord, recordCompletedSession } from "../../features/sessions/session-history";

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  );
}

describe("AnalyticsCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders calm analytics metrics from local session history", () => {
    mockReducedMotion(false);
    recordCompletedSession(
      createSessionRecord({ durationMs: 25 * 60 * 1000, completedAtMs: Date.now(), completionKey: "x" })
    );

    render(<AnalyticsCard />);
    expect(screen.getByRole("heading", { name: /^analytics$/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/Trend/i)).toBeInTheDocument();
  });

  it("disables chart transitions when reduced motion is preferred", () => {
    mockReducedMotion(true);
    render(<AnalyticsCard />);
    expect(screen.getByTestId("weekly-trend-bars")).toHaveClass("motion-reduce");
  });
});
