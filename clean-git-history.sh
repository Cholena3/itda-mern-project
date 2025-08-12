#!/bin/bash

# Script to clean git history by removing Claude references
# WARNING: This will rewrite git history. Make sure to backup your repo first!

echo "Git History Cleaner"
echo "==================="
echo "This will remove Claude references from your git history."
echo "WARNING: This will rewrite history. Make sure you have a backup!"
echo ""
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

# Replace Claude references in commit messages
git filter-branch --msg-filter '
sed "s/🤖 Generated with \[Claude Code\](https:\/\/claude.ai\/code)//g" |
sed "s/Co-Authored-By: Claude <noreply@anthropic.com>//g" |
sed "/^$/d"
' --tag-name-filter cat -- --all

echo ""
echo "History cleaned! Now you need to force push to update remote:"
echo "git push --force --all"
echo ""
echo "Note: Other contributors will need to re-clone the repository."