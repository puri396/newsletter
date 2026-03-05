import { selectDueSchedules } from "./select-due-schedules";

describe("selectDueSchedules", () => {
  const now = new Date("2026-02-15T12:00:00Z");

  it("returns only pending schedules with sendAt <= now, ordered by sendAt asc", () => {
    const schedules = [
      { id: "1", status: "pending" as const, sendAt: new Date("2026-02-15T11:00:00Z") },
      { id: "2", status: "sent" as const, sendAt: new Date("2026-02-15T10:00:00Z") },
      { id: "3", status: "pending" as const, sendAt: new Date("2026-02-15T12:00:00Z") },
      { id: "4", status: "pending" as const, sendAt: new Date("2026-02-15T10:30:00Z") },
      { id: "5", status: "failed" as const, sendAt: new Date("2026-02-15T09:00:00Z") },
    ];
    const result = selectDueSchedules(schedules, now);
    expect(result.map((s) => s.id)).toEqual(["4", "1", "3"]);
    expect(result.every((s) => s.status === "pending")).toBe(true);
  });

  it("excludes schedules with sendAt in the future", () => {
    const schedules = [
      { id: "1", status: "pending" as const, sendAt: new Date("2026-02-15T13:00:00Z") },
    ];
    const result = selectDueSchedules(schedules, now);
    expect(result).toHaveLength(0);
  });

  it("excludes schedules with null sendAt", () => {
    const schedules = [
      { id: "1", status: "pending" as const, sendAt: null as Date | null },
    ];
    const result = selectDueSchedules(schedules, now);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when no schedules", () => {
    const result = selectDueSchedules([], now);
    expect(result).toEqual([]);
  });

  it("handles sendAt as ISO string", () => {
    const schedules = [
      { id: "1", status: "pending" as const, sendAt: "2026-02-15T11:00:00Z" },
    ];
    const result = selectDueSchedules(schedules, now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
