// Writes the licence notice of every production package into the built site. Runs before each build,
// so the list always matches package-lock.json.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const sections = [];

for (const [path, entry] of Object.entries(lock.packages)) {
  if (path === "" || entry.dev || !existsSync(path)) {
    continue;
  }

  const name = path.slice(path.lastIndexOf("node_modules/") + "node_modules/".length);
  const file = readdirSync(path).find((candidate) => /^licen[cs]e/i.test(candidate));
  const text = file ? readFileSync(join(path, file), "utf8").trim() : `Licence: ${entry.license ?? "not stated"}`;

  sections.push(`${name} ${entry.version}\n\n${text}`);
}

sections.sort();

writeFileSync(
  "public/third-party-notices.txt",
  `Third-party software in FacetIQ\n\n${sections.join(`\n\n${"-".repeat(72)}\n\n`)}\n`,
);

console.log(`Wrote notices for ${sections.length} packages.`);
