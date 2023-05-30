import fs from 'fs';
import { execSync } from 'child_process';

// Check if the --dry-run option is specified
const dryRun = process.argv.includes('--dry-run');

// Check if the new version is provided as a command-line argument
const newVersionIndex = process.argv.indexOf('--dry-run') === -1 ? 2 : 3;
const newVersion = process.argv[newVersionIndex];
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
  if (dryRun) {
    console.error(
      'Unexpected! Running in dry run mode. The new version is the same as the current version.',
    );
    process.exit(1);
  } else {
    console.log(
      'The new version is the same as the current version. Skipping the release process.',
    );
  }
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

  // Perform the changes only if it's not a dry run
  if (!dryRun) {
    // Commit and push the changes to Git
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "Bump version to ${newVersion}"`);
    execSync('git push');

    // Publish a new release on GitHub
    execSync(`gh release create ${newVersion} --notes-file CHANGELOG.md`);

    // Publish the npm package
    execSync('npm publish');
  } else {
    console.log('Dry run mode. Changes made locally:');
    console.log(`- Updated package.json version to ${newVersion}`);
    console.log(`- Added a new version section in ${changelogPath}`);
  }
}
