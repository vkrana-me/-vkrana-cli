import wrapAnsi from "wrap-ansi";
import type { Profile } from "../profile.js";

/** Render the profile as raw, pretty-printed JSON (for scripting). */
export function renderJson(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Decide whether to launch the interactive OpenTUI view.
 * Plain text when piped/redirected (non-TTY), NO_COLOR, or TERM=dumb.
 */
export function useRichOutput(): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.TERM === "dumb") return false;
  return Boolean(process.stdout.isTTY && process.stdin.isTTY);
}

/** Links that have a value, as [label, url] pairs. */
export function profileLinks(profile: Profile): [string, string][] {
  return Object.entries(profile.links).filter((e): e is [string, string] => Boolean(e[1]));
}

/** Plain, uncolored text — used for pipes and NO_COLOR. */
export function renderPlain(profile: Profile, width = 80): string {
  const wrap = (s: string) => wrapAnsi(s, width, { hard: true });
  const lines: string[] = [];

  lines.push(`${profile.name} — ${profile.title}`);
  if (profile.location) lines.push(profile.location);
  if (profile.about) {
    lines.push("");
    lines.push(wrap(profile.about));
  }

  if (profile.skills.length) {
    lines.push("");
    lines.push("Skills:");
    lines.push(wrap(`  ${profile.skills.join(", ")}`));
  }

  if (profile.experience.length) {
    lines.push("");
    lines.push("Experience:");
    for (const e of profile.experience) {
      lines.push(`  ${e.role} @ ${e.company} (${e.period})`);
      for (const h of e.highlights) lines.push(wrap(`    - ${h}`));
    }
  }

  const links = profileLinks(profile);
  if (links.length) {
    lines.push("");
    lines.push("Links:");
    for (const [k, v] of links) lines.push(`  ${k}: ${v}`);
  }

  return lines.join("\n");
}
