export type FocusNotificationEvent = "focus-complete" | "break-complete" | "streak-milestone" | "inactivity-reminder";

export type NotificationResult = {
  delivered: boolean;
  blocked: boolean;
};

export const WINDOWS_NOTIFICATION_GUIDANCE =
  "Notifications are off. Open Windows Settings > System > Notifications to re-enable Focus App alerts.";

const STREAK_MILESTONES = new Set([3, 5, 10, 20, 30, 50]);

function isMilestone(count: number): boolean {
  return STREAK_MILESTONES.has(count);
}

async function sendWebNotification(title: string, body: string): Promise<NotificationResult> {
  if (typeof Notification === "undefined") {
    return { delivered: false, blocked: true };
  }

  let permission = Notification.permission;
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return { delivered: false, blocked: true };
  }

  new Notification(title, { body });
  return { delivered: true, blocked: false };
}

async function sendTauriNotification(title: string, body: string): Promise<NotificationResult> {
  const notifications = await import("@tauri-apps/plugin-notification");

  let permissionGranted = await notifications.isPermissionGranted();
  if (!permissionGranted) {
    const permission = await notifications.requestPermission();
    permissionGranted = permission === "granted";
  }

  if (!permissionGranted) {
    return { delivered: false, blocked: true };
  }

  notifications.sendNotification({ title, body });
  return { delivered: true, blocked: false };
}

export async function sendFocusNotification(title: string, body: string): Promise<NotificationResult> {
  try {
    return await sendTauriNotification(title, body);
  } catch {
    return sendWebNotification(title, body);
  }
}

export function shouldNotifyStreakMilestone(completedSessions: number): boolean {
  return isMilestone(completedSessions);
}

export function buildStreakMilestoneMessage(completedSessions: number): string {
  return `You have completed ${completedSessions} focus sessions. Keep the calm rhythm going.`;
}

export function messageForEvent(event: FocusNotificationEvent): { title: string; body: string } {
  if (event === "focus-complete") {
    return {
      title: "Focus session complete",
      body: "Nice work. Take a mindful pause or start a short break when you are ready."
    };
  }

  if (event === "break-complete") {
    return {
      title: "Break complete",
      body: "Your break has ended. Return to focus when it feels right."
    };
  }

  if (event === "inactivity-reminder") {
    return {
      title: "Session paused",
      body: "Your timer is still paused. Resume when you are ready to continue."
    };
  }

  return {
    title: "Streak milestone",
    body: "You are building steady focus momentum."
  };
}
