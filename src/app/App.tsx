import { AppShell } from "../components/layout/AppShell";
import { OnboardingFlow } from "../features/onboarding/OnboardingFlow";
import { readOnboardingState } from "../features/onboarding/onboarding-state";
import { useState } from "react";

export function App() {
  const [onboardingCompleted, setOnboardingCompleted] = useState(
    () => readOnboardingState().completed
  );

  if (!onboardingCompleted) {
    return <OnboardingFlow onComplete={() => setOnboardingCompleted(true)} />;
  }

  return <AppShell />;
}
