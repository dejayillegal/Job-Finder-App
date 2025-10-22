#!/usr/bin/env python3
import pandas as pd
import subprocess
from pathlib import Path

# Read the CSV with all source files
df = pd.read_csv('job_finder_app_files.csv')

# Extract all files
print("📦 Extracting files...")
for _, row in df.iterrows():
    filepath = Path(row['filepath'])
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(row['content'])
    print(f"  ✓ {filepath}")

# Create data directory
Path("data").mkdir(exist_ok=True)
Path("data/.gitkeep").write_text("# Resume texts storage\n")

print("\n🚀 Ready to push to GitHub!")
print("\nRun these commands:")
print("  git add .")
print('  git commit -m "Initial commit: Complete job-finder application"')
print("  git push origin main")

