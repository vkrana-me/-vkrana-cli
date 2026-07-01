import type { Profile } from "../profile.js";

/** Render the profile as raw, pretty-printed JSON (for scripting). */
export function renderJson(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

/** Render the profile as a formatted, human-readable text block. */
export function renderText(profile: Profile): string {
  const lines: string[] = [];

  lines.push(`${profile.name} — ${profile.title}`);
  if (profile.location) lines.push(profile.location);
  if (profile.about) {
    lines.push("");
    lines.push(profile.about);
  }

  if (profile.skills.length) {
    lines.push("");
    lines.push("Skills:");
    lines.push(`  ${profile.skills.join(", ")}`);
  }

  if (profile.experience.length) {
    lines.push("");
    lines.push("Experience:");
    for (const e of profile.experience) {
      lines.push(`  ${e.role} @ ${e.company} (${e.period})`);
      for (const h of e.highlights) lines.push(`    - ${h}`);
    }
  }

  const links = Object.entries(profile.links).filter(([, v]) => Boolean(v));
  if (links.length) {
    lines.push("");
    lines.push("Links:");
    for (const [k, v] of links) lines.push(`  ${k}: ${v}`);
  }

  return lines.join("\n");
}
