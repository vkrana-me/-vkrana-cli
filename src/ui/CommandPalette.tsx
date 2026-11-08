export interface Command {
  name: string;
  description: string;
}

const C = { frame: "#56b6c2", bg: "#1e2127", sel: "#2c313a", name: "#e5c07b", dim: "#7f848e", text: "#ffffff" };

/** Commands whose name contains the typed query (leading "/" ignored), prefix matches first. */
export function filterCommands(commands: Command[], query: string): Command[] {
  const q = query.replace(/^\//, "").toLowerCase();
  return commands
    .filter((c) => c.name.includes(q))
    .sort((a, b) => Number(!a.name.startsWith(q)) - Number(!b.name.startsWith(q)));
}

/** "/" command menu drawn over the bottom of the current view. Keys are handled by the Shell. */
export function CommandPalette({ query, matches, index }: { query: string; matches: Command[]; index: number }) {
  const width = 44;
  return (
    <box
      position="absolute"
      left={2}
      bottom={1}
      zIndex={10}
      width={width}
      flexDirection="column"
      border
      borderStyle="rounded"
      borderColor={C.frame}
      backgroundColor={C.bg}
      title=" commands "
      bottomTitle=" ↑↓ · enter · esc "
      bottomTitleAlignment="right"
    >
      {matches.length === 0 ? (
        <text fg={C.dim}> No matching command</text>
      ) : (
        matches.map((c, i) => (
          <text key={c.name} bg={i === index ? C.sel : undefined}>
            <span fg={i === index ? C.text : C.dim}>{i === index ? "›" : " "} </span>
            <span fg={C.name}>/{c.name}</span>
            <span fg={C.dim}>{"  " + c.description}</span>
          </text>
        ))
      )}
      <text>
        <span fg={C.frame}>/</span>
        <span fg={C.text}>{query}</span>
        <span fg={C.frame}>▏</span>
      </text>
    </box>
  );
}
