#!/usr/bin/env python3
"""
Script để tạo lại file rankLoader.json từ các file .json trong thư mục contexto
Cách sử dụng:
1. Chạy script này trong thư mục lib/data/contexto/
2. Script sẽ scan tất cả file .json trong thư mục hiện tại
3. Tự động tạo rankLoader.json với slug từ tên file và createdAt từ ngày hiện tại
"""

import os
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Vietnam timezone (UTC+7)
VIETNAM_TZ = timezone(timedelta(hours=7))

def create_rank_loader():
    # Đường dẫn đến thư mục contexto (thư mục hiện tại khi chạy từ đây)
    contexto_dir = Path(".")

    # Tìm tất cả file .json trong thư mục hiện tại
    json_files = list(contexto_dir.glob("*.json"))

    # Loại bỏ rankLoader.json nếu có
    json_files = [f for f in json_files if f.name != "rankLoader.json"]

    if not json_files:
        print("❌ Không tìm thấy file .json nào trong thư mục contexto!")
        return

    print(f"📁 Tìm thấy {len(json_files)} file .json")

    # Đọc rankLoader.json hiện có (nếu có)
    output_file = contexto_dir / "rankLoader.json"
    existing_rank_loader = {}
    existing_slugs = set()
    
    if output_file.exists():
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_rank_loader = json.load(f)
                existing_slugs = {entry["slug"] for entry in existing_rank_loader.values()}
                print(f"📋 Đã load {len(existing_rank_loader)} game hiện có")
        except Exception as e:
            print(f"⚠️  Lỗi khi đọc rankLoader.json: {e}")

    # Tạo list các file mới (chưa có trong rankLoader)
    new_files = []
    for json_file in json_files:
        slug = json_file.stem
        if slug not in existing_slugs:
            try:
                # Trên macOS, st_birthtime là creation time
                creation_time = os.stat(json_file).st_birthtime
            except AttributeError:
                # Fallback cho hệ thống không có st_birthtime
                creation_time = os.path.getctime(json_file)
            
            new_files.append((creation_time, json_file))
    
    if not new_files:
        print("✅ Không có file mới nào cần thêm vào rankLoader.json")
        return

    # Sort các file mới theo creation time
    new_files.sort(key=lambda x: x[0])

    # Tìm index lớn nhất hiện có
    max_index = 0
    if existing_rank_loader:
        max_index = max(int(k) for k in existing_rank_loader.keys())

    # Thêm các file mới vào
    print(f"\n🆕 Tìm thấy {len(new_files)} file mới:")
    
    for creation_time, json_file in new_files:
        max_index += 1
        slug = json_file.stem
        # Chuyển đổi timestamp sang giờ Việt Nam (UTC+7)
        # NOTE: pipeline runs at 23:30 (11:30 PM) of the previous day, so add 1 day
        # so that the displayed createdAt matches the intended game date.
        created_dt = datetime.fromtimestamp(creation_time, tz=VIETNAM_TZ) + timedelta(days=1)
        created_date = created_dt.strftime("%Y-%m-%d")

        existing_rank_loader[str(max_index)] = {
            "slug": slug,
            "createdAt": created_date
        }

        print(f"   ✅ Thêm: #{max_index} - {slug} (tạo: {created_date})")

    # Ghi ra file rankLoader.json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(existing_rank_loader, f, indent=4, ensure_ascii=False)

    print(f"\n🎉 Đã cập nhật {output_file}")
    print(f"📊 Tổng cộng {len(existing_rank_loader)} game (thêm mới {len(new_files)} game)")

if __name__ == "__main__":
    create_rank_loader()