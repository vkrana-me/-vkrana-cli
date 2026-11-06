import { useKeyboard } from "@opentui/react";
import type { Profile } from "../profile.js";
import { profileLinks } from "../commands/info.js";

const C = {
  accent: "#56b6c2",
  title: "#e5c07b",
  skill: "#98c379",
  company: "#c678dd",
  link: "#61afef",
  dim: "#7f848e",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <box flexDirection="column" flexShrink={0} marginTop={1}>
      <text fg={C.accent}>
        <b>{title}</b>
      </text>
      {children}
    </box>
  );
}

export function App({ profile, onExit }: { profile: Profile; onExit: () => void }) {
  useKeyboard((key) => {
    if (key.name === "q" || key.name === "escape") onExit();
  });

  const links = profileLinks(profile);

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border
      borderStyle="rounded"
      borderColor={C.accent}
      title=" vkrana-me "
      titleAlignment="center"
      bottomTitle=" ↑↓ scroll · q quit "
      bottomTitleAlignment="center"
    >
      <scrollbox focused flexGrow={1} paddingLeft={1} paddingRight={1}>
        <text>
          <b>{profile.name}</b>
          <span fg={C.dim}> · </span>
          <span fg={C.title}>{profile.title}</span>
        </text>
        {profile.location ? <text fg={C.dim}>📍 {profile.location}</text> : null}
        {profile.about ? <text marginTop={1}>{profile.about}</text> : null}

        {profile.skills.length > 0 && (
          <Section title="Skills">
            <text>
              {profile.skills.map((s, i) => (
                <span key={s}>
                  {i > 0 && <span fg={C.dim}> • </span>}
                  <span fg={C.skill}>{s}</span>
                </span>
              ))}
            </text>
          </Section>
        )}

        {profile.experience.length > 0 && (
          <Section title="Experience">
            {profile.experience.map((e) => (
              <box key={`${e.company}-${e.period}`} flexDirection="column" flexShrink={0}>
                <text>
                  <b>{e.role}</b>
                  <span fg={C.dim}> @ </span>
                  <span fg={C.company}>{e.company}</span>
                  <span fg={C.dim}> ({e.period})</span>
                </text>
                {e.highlights.map((h) => (
                  <text key={h}>
                    <span fg={C.dim}>  › </span>
                    {h}
                  </text>
                ))}
              </box>
            ))}
          </Section>
        )}

        {links.length > 0 && (
          <Section title="Links">
            {links.map(([k, v]) => (
              <text key={k}>
                <span fg={C.dim}>{k.padEnd(9)} </span>
                <a href={k === "email" ? `mailto:${v}` : v} fg={C.link}>
                  {v}
                </a>
              </text>
            ))}
          </Section>
        )}
      </scrollbox>
    </box>
  );
}
