import fs from 'fs';
import path from 'path';
import glob from 'glob';
import { z } from 'zod';
import { zodToTs, printNode } from 'zod-to-ts';

const rulesDirectory = 'src/rules';
const outputFile = 'RULES.md';

function trimBlankNewLines(str) {
  return str.replace(/^\n+/, '').replace(/\n+$/, '');
}

const RULES_HEADER = `
# Rules

> This document is automatically generated from the source code. Do not edit it directly.

Configuration option schemas are written with [Zod](
<https://github.com/colinhacks/zod>).

`;

/**
 * @param {string[]} exampleLines
 * @returns {{title: string, code: string}[]}
 */
function listExamples(exampleLines) {
  const examples = [];
  let currentExampleTitle = '';
  let currentExampleCode = '';
  for (let i = 0; i < exampleLines.length; i++) {
    const line = exampleLines[i];
    if (line.includes('@example')) {
      if (currentExampleTitle !== '' && currentExampleCode !== '') {
        examples.push({
          title: currentExampleTitle,
          code: trimBlankNewLines(currentExampleCode),
        });
      }
      const rawTitle = line.replace('@example', '').trim();
      currentExampleTitle =
        rawTitle === '' ? 'Default' : `With \`${rawTitle}\``;
      currentExampleCode = '';
    } else {
      // Remove the first 2 spaces.
      currentExampleCode += `${line.slice(2)}\n`;
    }
  }
  if (currentExampleTitle !== '' && currentExampleCode !== '') {
    examples.push({
      title: currentExampleTitle,
      code: trimBlankNewLines(currentExampleCode),
    });
  }
  return examples;
}

function extractRulesFromTSFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const ruleNameMatch = fileContent.match(/const RULE_NAME = '(.*)';/);
  const descriptionMatch = fileContent.match(/\/\*\*\n([\s\S]*?)\n\s*\*\//);
  const configMatch = fileContent.match(/const Config =([\s\S]*?);/);

  if (ruleNameMatch && descriptionMatch) {
    const ruleName = ruleNameMatch[1];
    const descriptionLines = descriptionMatch[1]
      .trim()
      .split('\n')
      .map((line) => line.replace(/^\s*\*\s?/, ''));
    const firstExampleIndex = descriptionLines.findIndex((line) =>
      line.includes('@example'),
    );
    const description = descriptionLines.slice(0, firstExampleIndex).join('\n');
    const examples = listExamples(descriptionLines.slice(firstExampleIndex));

    const configCode = configMatch[1].trim();
    const parsedConfig = eval(`${configCode}`);
    const { node } = zodToTs(parsedConfig, 'Config');
    const configSchema = printNode(node);

    return {
      ruleName,
      description,
      examples,
      configSchema: configCode,
    };
  }

  return null;
}

function buildRulesMarkdownFile(rules) {
  let markdownContent = RULES_HEADER;

  rules.forEach((rule) => {
    markdownContent += `- [${
      rule.ruleName
    }](#${rule.ruleName.toLowerCase()})\n`;
  });

  markdownContent += '\n';

  rules.forEach((rule) => {
    markdownContent += `## ${rule.ruleName}\n\n`;
    markdownContent += `${rule.description}\n\n`;
    if (rule.configSchema !== '{}') {
      markdownContent += '### Configuration\n\n';
      markdownContent += '```ts\n';
      markdownContent += `${rule.configSchema}\n`;
      markdownContent += '```\n\n';
    }
    if (rule.examples.length > 0) {
      markdownContent += '### Examples\n\n';
    }
    rule.examples.forEach((example) => {
      markdownContent += `#### ${example.title}\n\n`;
      markdownContent += `\`\`\`prisma\n${example.code}\n\`\`\`\n\n`;
    });
  });

  fs.writeFileSync(outputFile, markdownContent, 'utf-8');
}

function extractAndBuildRulesMarkdown() {
  const ruleFiles = glob.sync(`${rulesDirectory}/**/*.ts`);

  const rules = ruleFiles
    .map((file) => extractRulesFromTSFile(file))
    .filter((rule) => rule !== null);

  buildRulesMarkdownFile(rules);
}

extractAndBuildRulesMarkdown();
