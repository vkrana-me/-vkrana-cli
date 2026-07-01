#!/usr/bin/env node

import { Command } from "commander";
import { profile, validateProfile } from "./profile.js";
import { renderJson, renderText } from "./commands/info.js";
import pkg from "../package.json" with { type: "json" };

function runInfo(opts: { json?: boolean }): void {
  const errors = validateProfile(profile);
  if (errors.length) {
    console.error("Invalid profile data:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  console.log(opts.json ? renderJson(profile) : renderText(profile));
}

const program = new Command();

program
  .name("vkrana-me")
  .description("Personal CLI for Vijendra Rana")
  .version(pkg.version, "-v, --version", "Print the CLI version");

program.showHelpAfterError();

program
  .command("info", { isDefault: true })
  .description("Print profile info (default command)")
  .option("--json", "Output raw JSON for scripting")
  .allowExcessArguments(false)
  .action((opts: { json?: boolean }) => runInfo(opts));

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
