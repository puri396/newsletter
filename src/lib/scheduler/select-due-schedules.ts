export interface ScheduleLike {
  id: string;
  status: string;
  sendAt: Date | string | null;
}

/**
 * Returns schedules that are due to run: status is "pending" and sendAt <= now.
 * Result is sorted by sendAt ascending.
 */
export function selectDueSchedules<T extends ScheduleLike>(
  schedules: T[],
  now: Date,
): T[] {
  const nowTime = now.getTime();
  return schedules
    .filter((s) => {
      if (s.status !== "pending") return false;
      if (s.sendAt == null) return false;
      const sendAtTime = new Date(s.sendAt).getTime();
      return !Number.isNaN(sendAtTime) && sendAtTime <= nowTime;
    })
    .sort((a, b) => {
      const at = new Date(a.sendAt!).getTime();
      const bt = new Date(b.sendAt!).getTime();
      return at - bt;
    });
}
