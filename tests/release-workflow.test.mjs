import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("desktop workflow publishes dev-master through its own channel", async () => {
  const workflow = await readFile(".github/workflows/build-desktop.yml", "utf8");

  assert.match(workflow, /branches:\s*\r?\n\s+- dev-master/);
  assert.match(workflow, /concurrency:\s*\r?\n\s+group: build-desktop-\$\{\{ github\.ref \}\}/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
  assert.match(workflow, /scripts\/release-metadata\.mjs/);
  assert.match(workflow, /needs\.prepare\.outputs\.prerelease/);
  assert.match(workflow, /needs\.prepare\.outputs\.manifestObject/);
  assert.match(workflow, /needs\.prepare\.outputs\.updateBasePath/);
  assert.doesNotMatch(workflow, /upload_object "latest\.json"/);
});
