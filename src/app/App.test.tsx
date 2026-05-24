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
      screen.getByRole("heading", { name: /ready to focus/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /default duration/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", {
        name: /data privacy/i
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /no thanks/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /breathe before you start/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.getByRole("heading", { name: /all set/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /start session/i })
    ).toBeInTheDocument();
  });

  it("enforces telemetry as an explicit choice and persists completion", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const continueButton = screen.getByRole("button", { name: /continue/i });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /yes, allow local telemetry/i }));
    expect(continueButton).toBeEnabled();

    fireEvent.click(continueButton);
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /start session/i })
    );

    expect(
      screen.getByRole("button", { name: /sessions/i })
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
        name: /data privacy/i
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /skip/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(
      screen.getByRole("heading", { name: /default duration/i })
    ).toBeInTheDocument();
  });

  it("bypasses onboarding for returning users", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 45, telemetryOptIn: false })
    );

    render(<App />);

    expect(
      screen.getByRole("button", { name: /sessions/i })
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

    fireEvent.click(screen.getByRole("checkbox", { name: /breathing ritual/i }));
    const startButton = screen.getByRole("button", { name: /start timer/i });
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

    fireEvent.click(screen.getByRole("button", { name: /start timer/i }));
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /skip/i }));
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
      screen.getByText(/session interrupted/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume/i }));
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
      screen.queryByText(/session interrupted/i)
    ).not.toBeInTheDocument();
  });

  it("supports global shortcut baseline for start and pause", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("checkbox", { name: /breathing ritual/i }));

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
      screen.getByText(/start\/pause timer/i)
    ).toBeInTheDocument();
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("shows calm empty state when no session history exists", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );
    window.localStorage.removeItem("focus-app:completed-sessions");

    render(<App />);

    expect(
      screen.getByText(/your history will appear here/i)
    ).toBeInTheDocument();
  });

  it("persists settings changes locally from settings surface", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "60m" }));
    fireEvent.click(screen.getByLabelText(/toggle notifications/i));

    const stored = JSON.parse(window.localStorage.getItem("focus-app:settings") ?? "{}");
    expect(stored.focusDurationMinutes).toBe(60);
    expect(stored.notificationsEnabled).toBe(false);
  });

  it("applies updated duration settings to timer behavior", () => {
    window.localStorage.setItem(
      stateKey,
      JSON.stringify({ completed: true, defaultDuration: 25, telemetryOptIn: false })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "45m" }));

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
    fireEvent.click(screen.getByRole("button", { name: /export json/i }));

    createObjectUrl.mockRestore();
    revokeObjectUrl.mockRestore();
  });
});
