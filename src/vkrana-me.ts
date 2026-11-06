#!/usr/bin/env bun

import { Command } from "commander";
import { profile, validateProfile } from "./profile.js";
import { renderJson, renderPlain, useRichOutput } from "./commands/info.js";
import { BLOG_URL, fetchBlogPosts, renderBlogsPlain } from "./blogs.js";
import pkg from "../package.json" with { type: "json" };

async function runInfo(opts: { json?: boolean }): Promise<void> {
  const errors = validateProfile(profile);
  if (errors.length) {
    console.error("Invalid profile data:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    console.log(renderJson(profile));
  } else if (useRichOutput()) {
    // Lazy-load OpenTUI so --json and piped output never touch the native renderer.
    const { runTui } = await import("./ui/run.js");
    await runTui(profile);
  } else {
    console.log(renderPlain(profile, (process.stdout.columns || 80) - 1));
  }
}

const program = new Command();

program
  .name("vkrana-me")
  .description("Personal CLI for Vijendra Rana")
  .version(pkg.version, "-v, --version", "Print the CLI version");

program.showHelpAfterError();

program
  .command("info", { isDefault: true })
  .description("Show profile info (default command)")
  .option("--json", "Output raw JSON for scripting")
  .allowExcessArguments(false)
  .action((opts: { json?: boolean }) => runInfo(opts));

async function runBlogs(opts: { json?: boolean }): Promise<void> {
  if (!opts.json && useRichOutput()) {
    const { runBlogsTui } = await import("./ui/run.js");
    await runBlogsTui();
    return;
  }
  const posts = await fetchBlogPosts();
  console.log(opts.json ? JSON.stringify(posts, null, 2) : renderBlogsPlain(posts));
}

program
  .command("blogs")
  .alias("blog")
  .description(`List blog posts from ${BLOG_URL} (enter opens in browser)`)
  .option("--json", "Output raw JSON for scripting")
  .allowExcessArguments(false)
  .action((opts: { json?: boolean }) => runBlogs(opts));

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
