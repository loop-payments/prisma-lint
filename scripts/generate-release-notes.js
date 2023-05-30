import fs from 'fs';

function trimBlankNewLines(str) {
  return str.replace(/^\n+/, '').replace(/\n+$/, '');
}

function extractChangelogLines(changelog, startVersion) {
  const lines = changelog.split('\n');
  let isRecording = false;
  const extractedLines = [];

  const versionHeader = `## ${startVersion}`;
  for (const line of lines) {
    if (isRecording) {
      if (line.startsWith('##')) {
        break;
      }
      extractedLines.push(line);
    }
    if (line.startsWith(versionHeader)) {
      isRecording = true;
    }
  }

  return extractedLines.join('\n');
}

const changelogFile = 'CHANGELOG.md';
const startVersion = process.argv[2];

if (!startVersion) {
  console.error('Please provide the start version as a command-line argument.');
  process.exit(1);
}

const changelogContent = fs.readFileSync(changelogFile, 'utf8');
const extractedLines = extractChangelogLines(changelogContent, startVersion);
const trimmedLines = trimBlankNewLines(extractedLines);
console.log(trimmedLines);
