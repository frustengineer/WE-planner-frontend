import type { AvailabilitySnapshot } from "./types";

const SESSIONS = ["morning", "afternoon"] as const;

/** Generates illustrative availability in the browser; these are not live slots. */
export function getSampleAvailability(
  zoneIds: string[],
  dates: string[]
): AvailabilitySnapshot[] {
  const checkedAt = new Date().toISOString();
  return zoneIds.flatMap((zoneId) =>
    dates.flatMap((date) =>
      SESSIONS.map((session) => {
        const seed = `${zoneId}|${date}|${session}`
          .split("")
          .reduce((sum, character) => sum + character.charCodeAt(0), 0);
        const available = seed % 7 !== 0;
        return {
          zoneId,
          date,
          session,
          status: available ? "available" : "full",
          availableCount: available ? 2 + (seed % 5) : 0,
          checkedAt,
        };
      })
    )
  );
}