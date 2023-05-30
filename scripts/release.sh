#!/bin/bash

# Check if the --dry-run option is specified
dry_run=false
if [ "$1" == "--dry-run" ]; then
  dry_run=true
  shift
fi

# Check if the new version is provided as a command-line argument
if [ -z "$1" ]; then
  echo "Error: Please provide the new version as a command-line argument."
  exit 1
fi

# Assign the new version from the command-line argument
new_version="$1"

# Read the current version from package.json
current_version=$(jq -r '.version' package.json)

# Check if the new version is the same as the current version
if [ "$new_version" == "$current_version" ]; then
  if [ "$dry_run" = true ]; then
    echo "Running in dry run mode. The new version is the same as the current version. Unexpected."
    exit 1    
  fi
else
  # Update package.json with the new version
  jq --arg new_version "$new_version" '.version = $new_version' package.json > temp.json && mv temp.json package.json

  # Create a new section in CHANGELOG.md for the new version
  changelog_date=$(date +'%Y-%m-%d')
  changelog_content="\n## Unreleased\n\n\n## $new_version ($changelog_date)\n\n"

  # Check if the new version section already exists in CHANGELOG.md
  if grep -q "## $new_version" CHANGELOG.md; then
    echo "Skipping updating CHANGELOG.md. Section for version $new_version already exists."
  else
    # Insert the new section after the 'Unreleased' section
    awk -v changelog_content="$changelog_content" '/## Unreleased/ { print changelog_content $0; next } 1' CHANGELOG.md > temp.md && mv temp.md CHANGELOG.md
  fi

  # Perform the changes only if it's not a dry run
  if [ "$dry_run" = false ]; then
    # Commit and push the changes to Git
    git add package.json CHANGELOG.md
    git commit -m "Bump version to $new_version"
    git push

    # Publish a new release on GitHub
    gh release create $new_version --notes-file CHANGELOG.md

    # Publish the npm package
    npm publish
  else
    echo "Dry run mode. Changes made locally:"
    echo "- Updated package.json version to $new_version"
    if [ "$changelog_updated" = true ]; then
      echo "- Added a new 'Unreleased' section and updated version section in CHANGELOG.md"
    fi
  fi
fi

