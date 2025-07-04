import os
import shutil
import subprocess

def run_command(command):
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"❌ Command failed: {command}")
        exit(1)

def safe_remove(path):
    if os.path.exists(path):
        if os.path.isdir(path):
            print(f"Removing directory: {path}")
            shutil.rmtree(path)
        else:
            print(f"Removing file: {path}")
            os.remove(path)

# Step 1: Remove old directories and files
safe_remove("node_modules")
safe_remove("package-lock.json")
safe_remove(".next")
safe_remove(".turbo")

# Step 2: Clean reinstall
run_command("npm install")

# Step 3: Uninstall problematic packages if they exist
run_command("npm uninstall @tailwindcss/postcss")
run_command("npm uninstall lightningcss")

# Step 4: Reinstall Tailwind 4 setup
run_command("npm install -D tailwindcss@latest postcss@latest autoprefixer@latest")

print("\n✅ All steps completed successfully.")
