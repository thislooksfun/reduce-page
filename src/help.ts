import chalk from "chalk";

function describeKeys(keys: string[], description: string): string {
  const keyString = keys.join(",");
  return `  ${keyString}${" ".repeat(3 - keyString.length)}${chalk.grey(
    " - " + description
  )}`;
}

function describeKey(key: string, description: string): string {
  return describeKeys([key], description);
}

/** Underline the first character */
function uf(text: string): string {
  return chalk.underline(text[0]) + text.slice(1);
}

export function buildHelp(): string {
  return [
    "Commands",
    describeKeys(
      ["c", "n"],
      `Accept the last reduction and ${uf("continue")} to the ${uf(
        "next"
      )} reduction`
    ),
    describeKey(
      "d",
      `${uf(
        "Discard"
      )} the last reduction (undo it and try a different path next time)`
    ),
    describeKey("u", `${uf("Undo")} the last action`),
    describeKey("s", `${uf("Save")} the current state to disk`),
    describeKey("r", `${uf("Refresh")} all connected browsers`),
    describeKeys(["h", "?"], `Display this help`),
    describeKey("q", `Save and ${uf("quit")}`),
  ].join("\n");
}
