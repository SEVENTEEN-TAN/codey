#!/usr/bin/env node

function fail(message) {
  console.error(`release-metadata: ${message}`);
  process.exit(1);
}

function parseArguments(argv) {
  let eventName = "";
  let gitRef = "";
  let refName = "";
  let packageVersion = "";
  let runNumber = "";

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = () => {
      index += 1;
      const next = argv[index];
      if (!next || next.startsWith("--")) fail(`Missing value for ${argument}`);
      return next;
    };

    if (argument === "--event-name") eventName = value();
    else if (argument === "--ref") gitRef = value();
    else if (argument === "--ref-name") refName = value();
    else if (argument === "--package-version") packageVersion = value();
    else if (argument === "--run-number") runNumber = value();
    else fail(`Unknown option: ${argument}`);
  }

  if (!eventName) fail("Missing --event-name");
  if (!gitRef) fail("Missing --ref");
  if (!packageVersion) fail("Missing --package-version");
  if (!/^\d+$/.test(runNumber)) fail("--run-number must be a positive integer");

  return { eventName, gitRef, refName, packageVersion, runNumber };
}

function nextDevelopmentVersion(packageVersion, runNumber) {
  const match = packageVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) fail(`Invalid package version: ${packageVersion}`);
  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}-dev.${runNumber}`;
}

const options = parseArguments(process.argv.slice(2));

if (options.eventName === "push" && options.gitRef === "refs/heads/dev-master") {
  const version = nextDevelopmentVersion(options.packageVersion, options.runNumber);
  console.log(JSON.stringify({
    version,
    tag: `v${version}`,
    prerelease: true,
    publish: true,
    makeLatest: "false",
    manifestObject: "dev/latest.json",
    updateBasePath: "/dev",
  }));
} else if (options.eventName === "push" && options.gitRef.startsWith("refs/tags/v")) {
  if (!options.refName) fail("Missing --ref-name for tag release");
  const version = options.refName.replace(/^v/i, "");
  const prerelease = /-\d*[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*$/.test(version);
  console.log(JSON.stringify({
    version,
    tag: options.refName,
    prerelease,
    publish: true,
    makeLatest: prerelease ? "false" : "true",
    manifestObject: prerelease ? "dev/latest.json" : "latest.json",
    updateBasePath: prerelease ? "/dev" : "",
  }));
} else {
  console.log(JSON.stringify({
    version: `${options.packageVersion}-${options.runNumber}`,
    tag: "",
    prerelease: false,
    publish: false,
    makeLatest: "false",
    manifestObject: "latest.json",
    updateBasePath: "",
  }));
}
