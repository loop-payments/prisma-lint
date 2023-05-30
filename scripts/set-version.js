import fs from 'fs';
import { execSync } from 'child_process';

// Check if the new version is provided as a command-line argument
const newVersion = process.argv[2];
if (!newVersion) {
  console.error(
    'Error: Please provide the new version as a command-line argument.',
  );
  process.exit(1);
}

// Read the current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

// Check if the new version is the same as the current version
if (newVersion === currentVersion) {
  console.log('The new version is the same as the current version.');
} else {
  // Update package.json with the new version
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // Create a new section in CHANGELOG.md for the new version
  const changelogDate = new Date().toISOString().split('T')[0];
  const changelogHeader = `## ${newVersion} (${changelogDate})\n`;

  // Read the current content of CHANGELOG.md
  const changelogPath = 'CHANGELOG.md';
  let changelog = fs.readFileSync(changelogPath, 'utf8');

  // Check if the new version section already exists in CHANGELOG.md
  if (changelog.includes(`## ${newVersion}`)) {
    console.log(
      `Skipping updating ${changelogPath}. Section for version ${newVersion} already exists.`,
    );
  } else {
    // Insert the new section after the first 'Unreleased' section
    changelog = changelog.replace(
      /^## Unreleased\s$/m,
      `## Unreleased\n\n${changelogHeader}`,
    );
    fs.writeFileSync(changelogPath, changelog);
  }

  execSync('git add package.json CHANGELOG.md');
  execSync(`git commit -m "Bump version to ${newVersion}"`);
}
