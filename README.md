# Contexto Tiếng Việt - Vietnamese Contexto | @minhqnd

![Contexto Vietnamese](public/img/contexto_vi_1200x630.png)

**Contexto Tiếng Việt** là trò chơi đoán từ dựa trên mức độ liên quan về mặt ngữ nghĩa (Semantic Similarity). Bạn đoán một từ tiếng Việt, AI sẽ đánh giá xem từ đó có liên quan, "same same" với từ bí mật hay không. Luật chơi cực đơn giản: đoán bừa một từ, AI bảo bạn đang "Gần" hay "Xa" từ bí mật. Nhiệm vụ của bạn là dựa vào màu sắc và số Rank để "khoanh vùng" ngữ nghĩa và tìm ra từ khóa cuối cùng.

## Tính năng chính
- **Đánh giá ngữ nghĩa thông minh**: Sử dụng các mô hình AI tiên tiến (SBERT + Ensemble Learning + LLM Re-ranking) để đánh giá độ liên quan giữa các từ
- **Gợi ý tiến bộ**: Hệ thống gợi ý thông minh, dần dần thu hẹp phạm vi từ xa đến gần
- **Danh sách từ gần nhất**: Xem top 200 từ liên quan nhất sau khi thắng
- **Lưu tiến trình**: Tự động lưu progress, có thể chơi tiếp bất cứ lúc nào
- **Giao diện đẹp**: Sử dụng Next.js 16, React 19, Tailwind CSS và Framer Motion
- **Cập nhật hàng ngày**: Pipeline tự động tạo game mới mỗi ngày qua GitHub Actions

## Cách chơi
1. Nhập một từ tiếng Việt hợp lệ vào ô input
2. Nhấn **Enter** để xác nhận đoán
3. Quan sát số Rank trả về:
   - **Rank 1**: Chính xác! Bạn thắng 🎉
   - **Rank thấp (2-10)**: Rất gần, tiếp tục thử
   - **Rank cao (1000+)**: Còn xa lắm, nghĩ lại đi
4. Sử dụng **Gợi ý** để nhận từ mẫu (tối đa 3 lần)
5. Nếu đoán đúng hoặc hết lượt, từ bí mật sẽ hiển thị

## Cơ chế hoạt động

### Pipeline tạo game hàng ngày
Dự án sử dụng hệ thống pipeline tự động chạy qua GitHub Actions để tạo game mới mỗi ngày:

#### 1. Thu thập dữ liệu
- **Từ điển gốc**: Bộ từ điển tiếng Việt đã được làm sạch và chuẩn hóa
- **Từ khóa**: Chọn ngẫu nhiên từ các chủ đề khác nhau (bác sĩ, bóng đá, cà phê, cảnh sát, giáo viên, siêu thị, máy tính, tình yêu, bưu điện, điện thoại, ngôn ngữ, xe máy, v.v.)

#### 2. Tạo embeddings
- **Ensemble Learning**: Kết hợp 3 mô hình SBERT tiếng Việt:
  - `dangvantuan/vietnamese-embedding`
  - `nampham1106/bkcare-embedding`
  - `VoVanPhuc/sup-SimCSE-VietNamese-phobert-base`
- **Reciprocal Rank Fusion (RRF)**: Kết hợp kết quả từ nhiều mô hình để giảm bias

#### 3. Re-ranking với LLM
- Sử dụng Google Gemini 2.5 Flash để re-rank top 1000 từ
- Đảm bảo thứ hạng hợp lý với tư duy liên tưởng của con người

#### 4. Tạo hints
- Tự động tạo danh sách hints cho hệ thống gợi ý tiến bộ
- Hints được phân theo các khoảng rank để người chơi dần dần tiếp cận

### API Backend
- **Next.js API Routes**: Xây dựng trên serverless Vercel
- **Caching thông minh**:
  - LRU Cache cho game data (max 20 games)
  - Cache-Control headers tối ưu cho CDN
  - Cache đến midnight VN để refresh daily
- **Normalization**: Chuẩn hóa dấu tiếng Việt để xử lý chính xác

### Frontend
- **React Hooks**: `useContextoGame` hook quản lý toàn bộ logic game
- **State Management**: localStorage cho progress, auto-select game
- **UI Components**: shadcn/ui với Radix UI primitives
- **Animations**: Framer Motion cho hiệu ứng mượt mà

## Cấu trúc dự án
```
├── app/
│   ├── api/contexto/
│   │   ├── route.ts          # API chính (guesses, hints, closest)
│   │   └── games/route.ts    # API danh sách games
│   ├── layout.tsx            # Layout với metadata SEO
│   └── page.tsx              # Trang chính
├── components/contexto/
│   ├── contexto-game.tsx     # Component chính
│   └── modules/              # Các module con
├── lib/contexto/             # Game data (JSON files)
├── scripts/
│   ├── ranking_pipeline.py   # Pipeline tạo rankings
│   └── requirements.txt      # Dependencies Python
└── .github/workflows/
    └── daily-ranking.yml     # GitHub Actions daily pipeline
```

## Demo
[https://minhqnd.com/contexto](https://minhqnd.com/contexto)

## Cài đặt & chạy
### Yêu cầu
- Node.js >= 18
- pnpm (hoặc npm/yarn/bun)
- Python 3.10 (cho pipeline)

### Cài đặt
```bash
git clone https://github.com/minhqnd/contexto-vietnamese.git
cd contexto-vietnamese
pnpm install
```

### Chạy development
```bash
pnpm dev
```
Mở [http://localhost:3000](http://localhost:3000) để chơi.

### Chạy pipeline tạo game
```bash
cd scripts
pip install -r requirements.txt
python ranking_pipeline.py
```

## GitHub Actions Workflow
Dự án sử dụng GitHub Actions để tự động hóa việc tạo game mới:

### Triggers
- **Schedule**: Chạy hàng ngày lúc 23:30 giờ Việt Nam (16:30 UTC)
- **Manual**: Có thể trigger thủ công qua GitHub UI

### Jobs
1. **Generate Rankings**:
   - Setup Python environment
   - Cache embeddings và models (~2GB)
   - Download dependencies (torch, sentence-transformers, faiss-cpu, google-genai)
   - Run ranking pipeline
   - Upload artifacts (metrics, logs)

2. **Commit & Deploy**:
   - Commit game data mới vào repository
   - Tạo badges cho shields.io
   - Push changes

3. **Summary**:
   - Generate workflow summary với metrics
   - Hiển thị thông tin game mới, số lượng từ, thời gian xử lý

### Environment Variables
- `GOOGLE_API_KEY`: API key cho Google Gemini (re-ranking)
- `GITHUB_TOKEN`: Auto-provided cho commit/push

### Caching Strategy
- **Embeddings Cache**: Cache models và pre-computed embeddings
- **Pip Cache**: Cache Python packages
- **Artifacts**: Lưu metrics và output files trong 7-30 ngày

## API Documentation

### GET /api/contexto
Xử lý guesses, hints, và closest words.

**Query Parameters:**
- `id`: Game ID (bắt buộc)
- `guess`: Từ đoán (cho guess request)
- `hint=true`: Yêu cầu hint
- `lowestRank`: Rank thấp nhất hiện tại (cho hint logic)
- `secret=true`: Lấy từ bí mật (sau khi thắng)
- `closest=true`: Lấy danh sách 200 từ gần nhất

**Response Examples:**
```json
// Guess response
{
  "rank": 42
}

// Hint response
{
  "hint": "y tá",
  "rank": 15
}

// Closest words response
{
  "closestWords": [
    {"word": "bác sĩ", "rank": 1},
    {"word": "thầy thuốc", "rank": 2},
    ...
  ]
}
```

### GET /api/contexto/games
Lấy danh sách tất cả games.

**Response:**
```json
{
  "games": {
    "1": {"createdAt": "2025-12-03"},
    "2": {"createdAt": "2025-12-03"},
    ...
  }
}
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
MIT License - see [LICENSE](LICENSE) file for details.

## Credits
- **Models**: dangvantuan, nampham1106, VoVanPhuc cho các mô hình embedding tiếng Việt
- **Libraries**: sentence-transformers, FAISS, Google Gemini, Next.js, React, Tailwind CSS
- **Inspiration**: Contexto gốc (bản tiếng Anh/Bồ Đào Nha)

---

*Made with ❤️ by [@minhqnd](https://github.com/minhqnd)*

