#!/usr/bin/env python3
"""
Script to show the location of the temporary folder where images will be saved
"""
import os
import tempfile

def show_temp_folder():
    """Show the temp folder location"""
    temp_dir = os.path.join(tempfile.gettempdir(), "quiz_images")

    print("🗂️  Image Storage Information:")
    print(f"   Temp folder location: {temp_dir}")
    print(f"   System temp directory: {tempfile.gettempdir()}")

    # Check if folder exists
    if os.path.exists(temp_dir):
        print(f"   ✅ Folder exists")

        # List existing files
        files = os.listdir(temp_dir)
        if files:
            print(f"   📁 Contains {len(files)} files:")
            for file in sorted(files):
                filepath = os.path.join(temp_dir, file)
                size = os.path.getsize(filepath)
                print(f"      - {file} ({size} bytes)")
        else:
            print(f"   📂 Folder is empty")
    else:
        print(f"   📁 Folder will be created when first image is uploaded")

    print(f"\n💡 To open this folder:")
    print(f"   macOS: open {temp_dir}")
    print(f"   Linux: xdg-open {temp_dir}")
    print(f"   Windows: explorer {temp_dir}")

if __name__ == "__main__":
    show_temp_folder()
