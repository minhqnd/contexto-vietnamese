#!/usr/bin/env python3
"""
Script to convert all existing JSON files in lib/contexto/ to compact format.
This reduces file sizes by removing unnecessary whitespace and indentation.
"""

import json
from pathlib import Path
import os


def compact_json_file(file_path):
    """
    Read a JSON file and rewrite it in compact format.
    Returns: (old_size, new_size) in bytes
    """
    # Read the original file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Get original size
    old_size = os.path.getsize(file_path)
    
    # Write back in compact format
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    
    # Get new size
    new_size = os.path.getsize(file_path)
    
    return old_size, new_size


def main():
    # Path to contexto directory
    contexto_dir = Path(__file__).parent.parent / "lib" / "contexto"
    
    if not contexto_dir.exists():
        print(f"❌ Directory not found: {contexto_dir}")
        return
    
    # Find all JSON files
    json_files = list(contexto_dir.glob("*.json"))
    
    if not json_files:
        print(f"❌ No JSON files found in {contexto_dir}")
        return
    
    print(f"📁 Found {len(json_files)} JSON files in {contexto_dir}")
    print(f"🔄 Converting to compact format...\n")
    
    total_old_size = 0
    total_new_size = 0
    
    for json_file in sorted(json_files):
        try:
            old_size, new_size = compact_json_file(json_file)
            total_old_size += old_size
            total_new_size += new_size
            
            reduction = ((old_size - new_size) / old_size * 100) if old_size > 0 else 0
            
            print(f"✅ {json_file.name:30s} {old_size:>10,} → {new_size:>10,} bytes ({reduction:>5.1f}% reduction)")
        
        except Exception as e:
            print(f"❌ Error processing {json_file.name}: {e}")
    
    # Summary
    total_reduction = ((total_old_size - total_new_size) / total_old_size * 100) if total_old_size > 0 else 0
    saved_bytes = total_old_size - total_new_size
    
    print(f"\n{'='*80}")
    print(f"📊 Summary:")
    print(f"   Total files processed: {len(json_files)}")
    print(f"   Total size before:     {total_old_size:,} bytes ({total_old_size / 1024 / 1024:.2f} MB)")
    print(f"   Total size after:      {total_new_size:,} bytes ({total_new_size / 1024 / 1024:.2f} MB)")
    print(f"   Total space saved:     {saved_bytes:,} bytes ({saved_bytes / 1024 / 1024:.2f} MB)")
    print(f"   Average reduction:     {total_reduction:.1f}%")
    print(f"{'='*80}")
    print(f"\n🎉 All JSON files have been compacted successfully!")


if __name__ == "__main__":
    main()
