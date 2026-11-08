import { measureText } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import type { Profile } from "../profile.js";
import { profileLinks } from "../commands/info.js";
import { BLOG_URL } from "../blogs.js";
import { AVATAR_PNG } from "./avatar-data.js";
import { HintBar, Key } from "./Hint.js";

/** Avatar sizes in terminal cells (cells are ~2x taller than wide); large on wide terminals. */
export const AVATAR_SIZES = {
  large: { cols: 36, rows: 17 },
  small: { cols: 28, rows: 13 },
} as const;
/** Minimum width of the text column next to the avatar. */
const TEXT_MIN = 42;
const TEXT_MAX = 64;
/** Name banner drawn in OpenTUI's "slick" ASCII font. */
const BANNER_FONT = "slick" as const;

const C = {
  frame: "#3e4451",
  accent: "#56b6c2",
  name: "#ffffff",
  title: "#e5c07b",
  text: "#abb2bf",
  dim: "#7f848e",
  chipBg: "#2c313a",
  chipFg: "#98c379",
  company: "#c678dd",
  link: "#61afef",
};

const NBSP = "\u00a0";
const LINK_LABELS: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  email: "Email",
  website: "Website",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <box flexDirection="column" flexShrink={0} marginTop={1}>
      <text fg={C.accent}>
        <b>{title.toUpperCase()}</b>
      </text>
      {children}
    </box>
  );
}

/** Profile view. Keys (quit, "/" menu) are handled by the Shell; `active` gives the scroll area focus. */
export function App({ profile, active = true }: { profile: Profile; active?: boolean }) {
  const links = profileLinks(profile);
  const { width, height } = useTerminalDimensions();
  // Inner area = terminal minus border (2) and side padding (2).
  const innerW = width - 4;
  // Rows inside the border, minus the hint line and its gap at the bottom.
  const innerH = height - 2 - 2;
  // Big "slick" name banner across the top only when the body below still fits unscrolled
  // (needs ~26 rows); otherwise a plain bold name in the text column.
  const banner = measureText({ text: profile.name, font: BANNER_FONT });
  const showBanner = innerW >= banner.width && innerH >= banner.height + 1 + AVATAR_SIZES.large.rows;
  const bodyH = innerH - (showBanner ? banner.height + 1 : 0);
  // Photo on the left when it fits beside a readable text column; shrink it first, then hide it.
  const fits = (a: { cols: number; rows: number }) => width >= a.cols + TEXT_MIN + 8 && bodyH >= a.rows;
  const avatar = fits(AVATAR_SIZES.large) ? AVATAR_SIZES.large : fits(AVATAR_SIZES.small) ? AVATAR_SIZES.small : null;

  return (
    <box
      flexDirection="column"
      flexGrow={1}
      border
      borderStyle="rounded"
      borderColor={C.frame}
      title=" vkrana-me "
      titleAlignment="center"
      titleColor={C.accent}
      bottomTitle=" / commands · ↑↓ scroll · q quit "
      bottomTitleAlignment="center"
      alignItems="center"
      justifyContent="center"
      paddingLeft={1}
      paddingRight={1}
    >
      {showBanner && (
        <box flexShrink={0} marginBottom={1}>
          <ascii-font text={profile.name} font={BANNER_FONT} color={[C.accent, C.frame]} selectable={false} />
        </box>
      )}
      <box flexDirection="row" flexGrow={1} width="100%" alignItems="center" justifyContent="center">
        {avatar && (
          <box flexShrink={0} marginRight={3}>
            <image source={AVATAR_PNG} fit="fit" protocol="auto" width={avatar.cols} height={avatar.rows} />
          </box>
        )}
        <scrollbox
          focused={active}
          flexGrow={1}
          maxWidth={TEXT_MAX}
          height="100%"
          contentOptions={{ minHeight: "100%", justifyContent: "center" }}
        >
          {!showBanner && (
            <text fg={C.name}>
              <b>{profile.name}</b>
            </text>
          )}
          <text>
            <span fg={C.title}>{profile.title}</span>
            {profile.location ? <span fg={C.dim}> · 📍 {profile.location}</span> : null}
          </text>
          {profile.about ? (
            <text fg={C.text} marginTop={1}>
              {profile.about}
            </text>
          ) : null}

          {profile.skills.length > 0 && (
            <Section title="Skills">
              <text>
                {profile.skills.map((s, i) => (
                  <span key={s}>
                    {i > 0 ? " " : null}
                    <span fg={C.chipFg} bg={C.chipBg}>
                      {`${NBSP}${s.replaceAll(" ", NBSP)}${NBSP}`}
                    </span>
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
                    <span fg={C.dim}> · {e.period}</span>
                  </text>
                  {e.highlights.map((h) => (
                    <text key={h} fg={C.text}>
                      <span fg={C.dim}>› </span>
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
                  <span fg={C.dim}>{(LINK_LABELS[k] ?? k).padEnd(9)}</span>
                  <a href={k === "email" ? `mailto:${v}` : v} fg={C.link}>
                    {v}
                  </a>
                </text>
              ))}
            </Section>
          )}

          <Section title="Blog">
            <text>
              <span fg={C.dim}>{"Posts".padEnd(9)}</span>
              <a href={BLOG_URL} fg={C.link}>
                {BLOG_URL}
              </a>
            </text>
            <text fg={C.dim}>
              {"Read".padEnd(9)}
              <Key>/blog</Key>
              {" right here"}
            </text>
          </Section>
        </scrollbox>
      </box>
      <HintBar>
        Type <Key>/blog</Key> to read my latest posts · <Key>/</Key> for all commands
      </HintBar>
    </box>
  );
}
