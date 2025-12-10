# Contexto Daily Ranking Pipeline

Hệ thống tự động tạo ranking cho game Contexto tiếng Việt, chạy hàng ngày bằng GitHub Actions.

## 🎯 Tính năng

- **Tự động tạo từ khóa mới mỗi ngày** bằng Gemini AI
- **Kiểm tra từ trùng lặp**: Tự động đọc các từ đã có trong `lib/contexto` và tránh tạo trùng
- **Embedding ranking** sử dụng 3 models tiếng Việt
- **LLM re-ranking** để tối ưu trải nghiệm gameplay
- **Tự động lưu kết quả** vào `lib/contexto/`
- **Tự động cập nhật** `rankLoader.json` bằng script `create_rank_loader.py`
- **Chạy tự động** vào 12:00 UTC (19:00 giờ VN) hàng ngày

## 📋 Cấu hình

### 1. Thêm Secret vào GitHub

Vào **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Thêm secret:
- **Name**: `GOOGLE_API_KEY`
- **Value**: API key của bạn từ [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Chuẩn bị file `clean_dict.pkl`

File vocabulary cần được tải xuống từ Google Drive hoặc upload vào repo.

**Tùy chọn A**: Sử dụng Google Drive (đã cấu hình sẵn)
- File sẽ tự động tải từ Google Drive ID: `1sY8OGK7ZTS3a7IsxwhZ-mDvpiypi9vuw`

**Tùy chọn B**: Upload trực tiếp vào repo
- Upload file `clean_dict.pkl` vào thư mục gốc của repo

### 3. Cho phép GitHub Actions ghi vào repo

Vào **Settings** → **Actions** → **General** → **Workflow permissions**

Chọn: **Read and write permissions**

## 🚀 Sử dụng

### Chạy tự động
- Workflow sẽ tự động chạy vào **12:00 UTC** (19:00 giờ VN) hàng ngày

### Chạy thủ công
1. Vào tab **Actions**
2. Chọn **Daily Contexto Ranking Pipeline**
3. Click **Run workflow** → **Run workflow**

## 📁 Cấu trúc thư mục

```
.github/
  workflows/
    daily-ranking.yml          # GitHub Actions workflow
scripts/
  ranking_pipeline.py          # Script chính
  requirements.txt             # Python dependencies
  README.md                    # Hướng dẫn này
lib/
  data/
    contexto/
      *.json                   # Các file ranking đã tạo (bac_si.json, bong_da.json...)
      rankLoader.json          # Index của tất cả games
      create_rank_loader.py    # Script tự động cập nhật rankLoader.json
output/                        # Kết quả cuối cùng (sau LLM re-rank)
pre_rerank/                    # Kết quả trung gian (sau embedding)
model_cache/                   # Cache models (tự động tạo)
```

## 📊 Kết quả

Sau khi chạy, kết quả sẽ được:
1. **Lưu vào `lib/contexto/`**: File JSON mới với tên dạng `bac_si.json`
2. **Cập nhật `rankLoader.json`**: Tự động thêm game mới vào danh sách
3. **Commit tự động** vào repo
4. **Upload artifact** lưu trữ 30 ngày (thư mục `output/` và `pre_rerank/`)

## 🛠️ Phát triển local

```bash
# Clone repo
git clone <your-repo-url>
cd contexto-vietnamese

# Cài dependencies
pip install -r scripts/requirements.txt

# Set environment variable
export GOOGLE_API_KEY="your-api-key"

# Chạy script
cd scripts
python ranking_pipeline.py
```

## ⚙️ Tùy chỉnh

### Thay đổi thời gian chạy

Edit file `.github/workflows/daily-ranking.yml`:

```yaml
schedule:
  - cron: '0 12 * * *'  # Đổi giờ ở đây (UTC)
```

### Thay đổi model Gemini

Edit file `scripts/ranking_pipeline.py`:

```python
MODEL_NAME = "gemini-2.0-flash-exp"  # Đổi model ở đây
```

## 📝 License

MIT
