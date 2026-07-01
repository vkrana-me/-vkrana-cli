import chalk, { type ChalkInstance } from "chalk";
import boxen from "boxen";
import wrapAnsi from "wrap-ansi";
import type { Profile } from "../profile.js";

/** Render the profile as raw, pretty-printed JSON (for scripting). */
export function renderJson(profile: Profile): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Decide whether to emit rich (colored, boxed) output.
 * Plain text when piped/redirected (non-TTY) or when NO_COLOR is set.
 */
export function useRichOutput(): boolean {
  if (process.env.NO_COLOR) return false;
  if (process.env.TERM === "dumb") return false;
  return Boolean(process.stdout.isTTY);
}

/** Usable content width, clamped to a comfortable range. */
function contentWidth(): number {
  const cols = process.stdout.columns || 80;
  // leave room for the box border + padding (~8 cols); cap for readability.
  return Math.max(24, Math.min(cols - 8, 92));
}

/** Plain, uncolored, unboxed text — used for pipes and NO_COLOR. */
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

  const links = Object.entries(profile.links).filter(([, v]) => Boolean(v));
  if (links.length) {
    lines.push("");
    lines.push("Links:");
    for (const [k, v] of links) lines.push(`  ${k}: ${v}`);
  }

  return lines.join("\n");
}

/** Rich, colored, boxed output for interactive terminals. */
export function renderRich(profile: Profile): string {
  const c: ChalkInstance = chalk;
  const width = contentWidth();
  const wrap = (s: string) => wrapAnsi(s, width, { hard: true });
  const header = (s: string) => c.bold.cyan(s);
  const lines: string[] = [];

  lines.push(`${c.bold.white(profile.name)}  ${c.dim("·")}  ${c.yellow(profile.title)}`);
  if (profile.location) lines.push(c.dim(`📍 ${profile.location}`));
  if (profile.about) {
    lines.push("");
    lines.push(wrap(profile.about));
  }

  if (profile.skills.length) {
    lines.push("");
    lines.push(header("Skills"));
    lines.push(wrap(profile.skills.map((s) => c.green(s)).join(c.dim(" • "))));
  }

  if (profile.experience.length) {
    lines.push("");
    lines.push(header("Experience"));
    for (const e of profile.experience) {
      lines.push(`${c.bold(e.role)} ${c.dim("@")} ${c.magenta(e.company)} ${c.dim(`(${e.period})`)}`);
      for (const h of e.highlights) lines.push(wrap(`  ${c.dim("›")} ${h}`));
    }
  }

  const links = Object.entries(profile.links).filter(([, v]) => Boolean(v));
  if (links.length) {
    lines.push("");
    lines.push(header("Links"));
    for (const [k, v] of links) lines.push(`${c.dim(k.padEnd(9))} ${c.blue(String(v))}`);
  }

  return boxen(lines.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "cyan",
    title: "vkrana-me",
    titleAlignment: "center",
  });
}

/** Dispatch to rich or plain rendering based on the environment. */
export function renderText(profile: Profile): string {
  return useRichOutput()
    ? renderRich(profile)
    : renderPlain(profile, (process.stdout.columns || 80) - 1);
}
