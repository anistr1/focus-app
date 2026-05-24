import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { App } from "./App";

const stateKey = "focus-app:onboarding-state";

describe("App onboarding flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("routes first-run users into the five-step onboarding flow", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /your focus ritual starts here/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /choose your default focus duration/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", {
        name: /help improve focus app with local telemetry/i
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/no thanks/i));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /try a short breathing preview/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /your timer is ready/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/tip: press ctrl\+shift\+f anytime to start focus/i)
    ).toBeInTheDocument();
  });

  it("enforces telemetry as an explicit choice and persists completion", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/yes, allow local telemetry/i));
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /enter your focus dashboard/i })
    );

    expect(
      screen.getByRole("heading", {
        name: /calm desktop focus, scaffolded for offline-first rituals/i
      })
    ).toBeInTheDocument();

    const persisted = JSON.parse(window.localStorage.getItem(stateKey) ?? "{}");
    expect(persisted.completed).toBe(true);
    expect(persisted.telemetryOptIn).toBe(true);
    expect(persisted.defaultDuration).toBe(25);
  });

  it("supports allowed skip and back navigation behavior", () => {
    render(<App />);

    expect(
      screen.queryByRole("button", { name: /skip/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /skip/i }));

    expect(
      screen.getByRole("heading", {
        name: /help improve focus app with local telemetry/i
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /skip/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(
      screen.getByRole("heading", { name: /choose your default focus duration/i })
    ).toBeInTheDocument();
  });

  it("bypasses onboarding for returning users", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 45, telemetryOptIn: false })
    );

    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: /calm desktop focus, scaffolded for offline-first rituals/i
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /your focus ritual starts here/i })
    ).not.toBeInTheDocument();
  });

  it("shows timer controls for returning users", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: /breathing ritual before focus/i }));
    const startButton = screen.getByRole("button", { name: /start focus/i });
    fireEvent.click(startButton);

    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it("runs breathing ritual before focus when enabled and supports skip", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /start focus/i }));
    expect(screen.getByRole("heading", { name: /breathe in/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /skip ritual/i }));
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("offers calm recovery banner on reopen and supports resume or dismiss", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );
    window.localStorage.setItem(
      "focus-app:timer-checkpoint",
      JSON.stringify({
        mode: "focus",
        remainingMs: 300000,
        checkpointedAtMs: Date.now(),
        targetTimeMs: Date.now() + 300000
      })
    );

    render(<App />);

    expect(
      screen.getByText(/your last session was interrupted\. resume from latest checkpoint\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume session/i }));
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();
  });

  it("allows dismissing interrupted-session recovery", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );
    window.localStorage.setItem(
      "focus-app:timer-checkpoint",
      JSON.stringify({
        mode: "focus",
        remainingMs: 120000,
        checkpointedAtMs: Date.now(),
        targetTimeMs: Date.now() + 120000
      })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(
      screen.queryByText(/your last session was interrupted\. resume from latest checkpoint\?/i)
    ).not.toBeInTheDocument();
  });

  it("supports global shortcut baseline for start and pause", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: /breathing ritual before focus/i }));

    fireEvent.keyDown(window, { key: "F", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("button", { name: /pause/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "F", ctrlKey: true, shiftKey: true });
    expect(screen.getByRole("button", { name: /resume/i })).toBeInTheDocument();
  });

  it("surfaces shortcut discoverability and timer semantics", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);

    expect(
      screen.getByText(/shortcut: ctrl\+shift\+f toggles start\/pause focus/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/focus timer status/i)).toBeInTheDocument();
  });

  it("shows calm empty state when no session history exists", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );
    window.localStorage.removeItem("focus-app:completed-sessions");

    render(<App />);

    expect(
      screen.getByText(/your completed sessions will appear here as you build your rhythm/i)
    ).toBeInTheDocument();
  });

  it("persists settings changes locally from settings surface", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText(/focus duration/i), { target: { value: "60" } });
    fireEvent.click(screen.getByLabelText(/launch on startup/i));

    const stored = JSON.parse(window.localStorage.getItem("focus-app:settings") ?? "{}");
    expect(stored.focusDurationMinutes).toBe(60);
    expect(stored.launchOnStartup).toBe(true);
  });

  it("applies updated duration settings to timer behavior", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText(/focus duration/i), { target: { value: "45" } });
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByRole("heading", { name: "45:00" })).toBeInTheDocument();
  });

  it("exports local telemetry summary with calm confirmation", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: true })
    );
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:test"),
      configurable: true
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true
    });
    const createObjectUrl = vi.spyOn(URL, "createObjectURL");
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /export telemetry summary/i }));

    expect(
      screen.getByText(/telemetry summary exported locally as json/i)
    ).toBeInTheDocument();

    createObjectUrl.mockRestore();
    revokeObjectUrl.mockRestore();
  });
});
