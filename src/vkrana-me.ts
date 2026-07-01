#!/usr/bin/env node

const VERSION = "0.0.1";

const HELP = `vkrana-me — personal CLI for Vijendra Rana

Usage:
  vkrana-me [command] [options]

Commands:
  help              Show this help message
  version           Print the CLI version

Options:
  -h, --help        Show this help message
  -v, --version     Print the CLI version
`;

function main(argv: string[]): number {
  const args = argv.slice(2);
  const first = args[0];

  if (first === "-v" || first === "--version" || first === "version") {
    console.log(VERSION);
    return 0;
  }

  if (!first || first === "-h" || first === "--help" || first === "help") {
    console.log(HELP);
    return 0;
  }

  console.error(`Unknown command: ${first}\n`);
  console.error(HELP);
  return 1;
}

process.exit(main(process.argv));
