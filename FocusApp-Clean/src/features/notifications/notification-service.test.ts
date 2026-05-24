import {
  buildStreakMilestoneMessage,
  messageForEvent,
  shouldNotifyStreakMilestone,
  WINDOWS_NOTIFICATION_GUIDANCE
} from "./notification-service";

describe("notification service helpers", () => {
  it("matches configured streak milestones", () => {
    expect(shouldNotifyStreakMilestone(2)).toBe(false);
    expect(shouldNotifyStreakMilestone(3)).toBe(true);
    expect(shouldNotifyStreakMilestone(5)).toBe(true);
  });

  it("builds calm event messages", () => {
    expect(messageForEvent("focus-complete").title).toMatch(/focus session complete/i);
    expect(messageForEvent("break-complete").title).toMatch(/break complete/i);
    expect(messageForEvent("inactivity-reminder").title).toMatch(/session paused/i);
    expect(messageForEvent("streak-milestone").title).toMatch(/streak milestone/i);
  });

  it("includes completed session count in streak milestone copy", () => {
    expect(buildStreakMilestoneMessage(10)).toContain("10");
  });

  it("exposes windows guidance route for blocked notifications", () => {
    expect(WINDOWS_NOTIFICATION_GUIDANCE).toMatch(/windows settings > system > notifications/i);
  });
});
