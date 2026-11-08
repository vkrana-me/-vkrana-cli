import type { ReactNode } from "react";

const C = { text: "#7f848e", keyFg: "#e5c07b", keyBg: "#2c313a", mark: "#56b6c2" };
const NBSP = " ";

/** A key or command styled as a small chip, e.g. <Key>/blog</Key>. Use inside <text>. */
export function Key({ children }: { children: string }) {
  return (
    <span fg={C.keyFg} bg={C.keyBg}>
      {`${NBSP}${children.replaceAll(" ", NBSP)}${NBSP}`}
    </span>
  );
}

/** One-line hint pinned under a view's content, telling people what they can do next. */
export function HintBar({ children }: { children: ReactNode }) {
  return (
    <box flexShrink={0} height={1} marginTop={1} alignSelf="center">
      <text fg={C.text} wrapMode="none">
        <span fg={C.mark}>✦ </span>
        {children}
      </text>
    </box>
  );
}
