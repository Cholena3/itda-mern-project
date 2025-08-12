@echo off
REM Script to clean git history by removing Claude references
REM WARNING: This will rewrite git history. Make sure to backup your repo first!

echo Git History Cleaner
echo ===================
echo This will remove Claude references from your git history.
echo WARNING: This will rewrite history. Make sure you have a backup!
echo.
set /p continue="Do you want to continue? (y/n): "

if /i not "%continue%"=="y" (
    echo Aborted.
    exit /b 1
)

echo.
echo Cleaning commit messages...

REM This creates a temporary Python script to clean the messages
echo import sys > clean_msg.py
echo import re >> clean_msg.py
echo msg = sys.stdin.read() >> clean_msg.py
echo msg = re.sub(r'🤖 Generated with \[Claude Code\]\(https://claude\.ai/code\)\n*', '', msg) >> clean_msg.py
echo msg = re.sub(r'Co-Authored-By: Claude ^<noreply@anthropic\.com^>\n*', '', msg) >> clean_msg.py
echo msg = '\n'.join([line for line in msg.split('\n') if line.strip()]) >> clean_msg.py
echo print(msg) >> clean_msg.py

REM Run git filter-branch with Python script
git filter-branch -f --msg-filter "python clean_msg.py" --tag-name-filter cat -- --all

REM Clean up
del clean_msg.py

echo.
echo History cleaned! Now you need to force push to update remote:
echo git push --force --all
echo.
echo Note: Other contributors will need to re-clone the repository.
pause