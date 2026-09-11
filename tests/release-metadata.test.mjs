import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

function releaseMetadata(arguments_) {
  const result = spawnSync(
    process.execPath,
    ["scripts/release-metadata.mjs", ...arguments_],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("dev-master releases use an independent prerelease channel", () => {
  const metadata = releaseMetadata([
    "--event-name", "push",
    "--ref", "refs/heads/dev-master",
    "--package-version", "0.10.9",
    "--run-number", "12",
  ]);

  assert.deepEqual(metadata, {
    version: "0.10.10-dev.12",
    tag: "v0.10.10-dev.12",
    prerelease: true,
    publish: true,
    makeLatest: "false",
    manifestObject: "dev/latest.json",
    updateBasePath: "/dev",
  });
});

test("version tags retain the stable release channel", () => {
  const metadata = releaseMetadata([
    "--event-name", "push",
    "--ref", "refs/tags/v1.2.3",
    "--ref-name", "v1.2.3",
    "--package-version", "1.2.3",
    "--run-number", "12",
  ]);

  assert.deepEqual(metadata, {
    version: "1.2.3",
    tag: "v1.2.3",
    prerelease: false,
    publish: true,
    makeLatest: "true",
    manifestObject: "latest.json",
    updateBasePath: "",
  });
});
