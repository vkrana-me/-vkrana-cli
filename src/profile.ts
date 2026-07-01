/**
 * Profile data model for the vkrana-me CLI.
 *
 * NOTE: This holds a minimal typed model plus starter content so the CLI
 * commands (VKR-16) are functional. VKR-15 owns fleshing out the full
 * content and any richer schema/validation.
 */

export interface ExperienceEntry {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface ProfileLinks {
  linkedin?: string;
  github?: string;
  email?: string;
  website?: string;
}

export interface Profile {
  name: string;
  title: string;
  about: string;
  location: string;
  skills: string[];
  experience: ExperienceEntry[];
  links: ProfileLinks;
}

export const profile: Profile = {
  name: "Vijendra Rana",
  title: "Software Engineer",
  about: "Engineer building CLIs, backend services, and developer tooling.",
  location: "India",
  skills: ["Node.js", "TypeScript", "DevOps", "AWS"],
  experience: [],
  links: {
    github: "https://github.com/vkrana-me",
    email: "vij.rana.tech@gmail.com",
  },
};

/**
 * Validate a profile object. Returns a list of human-readable errors;
 * an empty list means the profile is valid.
 */
export function validateProfile(p: Profile): string[] {
  const errors: string[] = [];
  if (!p.name?.trim()) errors.push("profile.name is required");
  if (!p.title?.trim()) errors.push("profile.title is required");
  if (!Array.isArray(p.skills)) errors.push("profile.skills must be an array");
  if (!Array.isArray(p.experience))
    errors.push("profile.experience must be an array");
  if (typeof p.links !== "object" || p.links === null)
    errors.push("profile.links must be an object");
  return errors;
}
