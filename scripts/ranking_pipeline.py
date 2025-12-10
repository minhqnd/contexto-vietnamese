# -*- coding: utf-8 -*-
"""
Ranking Pipeline for Contexto Game
Adapted for GitHub Actions - Runs daily at 12:00
"""

import pickle
import numpy as np
import json
import faiss
import os
import sys
import unicodedata
import time
import subprocess
from pathlib import Path
from sentence_transformers import SentenceTransformer
from google import genai
from pydantic import BaseModel, Field
from typing import List
import glob

# Force unbuffered output for GitHub Actions
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# =========================== CẤU HÌNH ===========================

EMBEDDING_MODELS = {
    "dangvantuan": {"path": "dangvantuan/vietnamese-embedding", "weight": 1.2},
    "bkcare":      {"path": "nampham1106/bkcare-embedding", "weight": 1.0},
    "vovanphuc":   {"path": "VoVanPhuc/sup-SimCSE-VietNamese-phobert-base", "weight": 1.0}
}

CACHE_DIR = "model_cache"
INPUT_FOLDER = "pre_rerank"
OUTPUT_FOLDER = "output"
TOP_K_RERANK = 1000

# Đường dẫn đến thư mục contexto trong project
CONTEXTO_DIR = Path(__file__).parent.parent / "lib" / "data" / "contexto"

# API Configuration
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
MODEL_NAME = "gemini-2.5-flash"

# Hint ranges cho progressive hint system (dựa theo logic trong contexto API)
HINT_RANGES = [
    (1001, 2000),
    (701, 1000),
    (501, 700),
    (351, 500),
    (251, 350),
    (181, 250),
    (131, 180),
    (91, 130),
    (61, 90),
    (41, 60),
    (26, 40),
    (16, 25),
    (9, 15),
    (2, 8)
]

# Tìm model_cache ở nhiều vị trí có thể
def get_cache_dir():
    possible_paths = [
        Path("model_cache"),                          # Chạy từ root
        Path(__file__).parent / "model_cache",        # Trong scripts/
        Path(__file__).parent.parent / "model_cache", # Ở thư mục cha
    ]
    
    for path in possible_paths:
        if path.exists():
            print(f"✅ Sử dụng model_cache tại: {path}")
            return str(path)
    
    # Nếu không tìm thấy, tạo mới ở thư mục cha
    cache_path = Path(__file__).parent.parent / "model_cache"
    cache_path.mkdir(exist_ok=True)
    print(f"📁 Tạo model_cache mới tại: {cache_path}")
    return str(cache_path)

CACHE_DIR = get_cache_dir()
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(INPUT_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# =========================== SCHEMA DEFINITIONS ===========================

class BrainstormResponse(BaseModel):
    words: List[str] = Field(description="List of brainstormed words")

class WordScore(BaseModel):
    w: str = Field(description="The candidate word")
    s: int = Field(description="Relevance score (0-100)")

class RankingResponse(BaseModel):
    items: List[WordScore] = Field(description="List of ranked words with scores")

class DailyTargetResponse(BaseModel):
    target: str = Field(description="Vietnamese target word for today's game (no underscores, just spaces)")

class HintSelection(BaseModel):
    word: str = Field(description="The selected hint word")
    rank: int = Field(description="The rank of the selected word")

class HintResponse(BaseModel):
    hints: List[HintSelection] = Field(description="List of selected hints for each range")

# =========================== UTILS ===========================

def remove_vietnamese_accents(text):
    text = text.replace("đ", "d").replace("Đ", "D")
    normalized = unicodedata.normalize('NFD', text)
    return "".join([c for c in normalized if unicodedata.category(c) != 'Mn'])

def load_vocab():
    # Tìm file clean_dict.pkl ở nhiều vị trí
    possible_paths = [
        "clean_dict.pkl",                    # Chạy từ scripts/
        "../clean_dict.pkl",                 # Chạy từ thư mục con
        Path(__file__).parent / "clean_dict.pkl",  # Cùng thư mục với script
    ]
    
    for path in possible_paths:
        try:
            with open(path, "rb") as f:
                vocab = pickle.load(f)
                print(f"✅ Loaded vocab from: {path}")
                return vocab
        except FileNotFoundError:
            continue
    
    print("⚠️  Không tìm thấy clean_dict.pkl ở bất kỳ vị trí nào, dùng vocab demo")
    return ["bác_sĩ", "y_tá", "bệnh_viện"] * 10000

def get_existing_keywords():
    """
    Đọc tất cả file .json trong thư mục contexto và lấy danh sách từ khóa đã có
    """
    existing_keywords = []
    
    if not CONTEXTO_DIR.exists():
        print(f"⚠️  Thư mục {CONTEXTO_DIR} không tồn tại")
        return existing_keywords
    
    # Lấy tất cả file .json (trừ rankLoader.json và create_rank_loader.py)
    json_files = list(CONTEXTO_DIR.glob("*.json"))
    json_files = [f for f in json_files if f.name not in ["rankLoader.json"]]
    
    for json_file in json_files:
        # Lấy tên file (ví dụ: bac_si.json -> bác sĩ)
        slug = json_file.stem  # bac_si
        # Chuyển từ bac_si -> bác sĩ (đọc từ file để lấy keyword chính xác)
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                keyword = data.get('keyword', '')
                if keyword:
                    existing_keywords.append(keyword)
        except:
            # Nếu không đọc được file, dùng slug
            keyword = slug.replace('_', ' ')
            existing_keywords.append(keyword)
    
    return existing_keywords

# =========================== LLM FUNCTIONS ===========================

def generate_daily_target():
    """
    Dùng Gemini để tạo một từ khóa mới cho ngày hôm nay
    Kiểm tra và tránh các từ đã tồn tại
    """
    print("🎲 Đang tạo từ khóa mới cho hôm nay...")
    
    # Lấy danh sách từ khóa đã có
    existing_keywords = get_existing_keywords()
    print(f"   📋 Đã có {len(existing_keywords)} từ khóa: {', '.join(existing_keywords[:10])}{'...' if len(existing_keywords) > 10 else ''}")
    
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Tạo danh sách từ đã có để gửi cho Gemini
    existing_list = ', '.join(existing_keywords) if existing_keywords else 'chưa có từ nào'
    
    prompt = f"""
Bạn là chuyên gia thiết kế game Contexto tiếng Việt.

Hãy đề xuất MỘT từ khóa tiếng Việt 2 âm tiết phù hợp cho game Contexto hôm nay.

Tiêu chí:

Là danh từ, động từ, tính từ hoặc trạng từ thông dụng trong tiếng Việt.
Phạm vi rộng: Có thể là đồ vật, địa điểm, nghề nghiệp, động vật, thực vật, hành động, trạng thái, tính chất, cảm xúc, khái niệm, màu sắc, bộ phận cơ thể, hoặc bất kỳ từ nào có thể gợi ra nhiều liên tưởng.
Độ khó trung bình đến khó: Tránh những từ quá hiển nhiên hoặc quá cụ thể. Mục tiêu là tạo ra "aha moment" cho người chơi.
Có nhiều từ liên quan để người chơi brainstorm, cả trực tiếp và gián tiếp.
Tránh từ quá chuyên ngành, từ cổ, từ địa phương hiếm gặp.
Tránh các từ cùng chủ đề quá rõ ràng với các từ đã tồn tại bên dưới.
QUAN TRỌNG: KHÔNG được trả về các từ đã tồn tại sau đây:
{existing_list}

Ví dụ từ tốt: "bác sĩ", "xe máy", "trường học", "cà phê", "nỗi buồn", "lái xe", "màu đỏ", "cái bẫy", "ốp la", "cái chảo", "màn hình", "chạy bộ"

CHỈ TRẢ VỀ MỘT TỪ DUY NHẤT, không giải thích.
    """
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": DailyTargetResponse.model_json_schema(),
                },
            )
            result = DailyTargetResponse.model_validate_json(response.text)
            target = result.target.lower().strip()
            
            # Kiểm tra nếu từ đã tồn tại
            if target in existing_keywords:
                print(f"   ⚠️  Từ '{target}' đã tồn tại, thử lại...")
                continue
            
            print(f"   ✅ Từ khóa hôm nay: '{target}'")
            return target
        except Exception as e:
            print(f"   ⚠️ Lỗi khi tạo target (lần {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                raise Exception(f"Không thể tạo target sau {max_retries} lần thử: {e}")
    
    raise Exception("Không thể tạo target")

def llm_brainstorm(target):
    """
    Dùng LLM để nghĩ ra các từ quan trọng (Signature Words)
    mà Embedding có thể đã bỏ sót.
    """
    print(f"[LLM] Đang Brainstorming cho '{target}'...")
    
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    prompt = f"""
Bạn là game designer cho Contexto tiếng Việt. Hãy liệt kê 50-100 từ QUAN TRỌNG NHẤT mà người chơi sẽ nghĩ đến khi chơi game với từ khóa: "{target}".

Chiến lược brainstorm theo loại target:
- Nếu là HOẠT ĐỘNG/HÀNH ĐỘNG → Ưu tiên: công cụ/đồ dùng chính, địa điểm thực hiện, sản phẩm/kết quả
- Nếu là ĐỒ VẬT/CÔNG CỤ → Ưu tiên: bộ phận, vật liệu, nơi dùng, hành động liên quan
- Nếu là NGHỀ NGHIỆP → Ưu tiên: công cụ nghề, nơi làm việc, sản phẩm/dịch vụ
- Nếu là ĐỊA ĐIỂM → Ưu tiên: đồ vật đặc trưng, người thường có mặt, hoạt động chính
- Nếu là THỰC PHẨM/ẨM THỰC → Ưu tiên: nguyên liệu, món ăn, dụng cụ chế biến

Quy tắc BẮT BUỘC:
❌ KHÔNG liệt kê từ chứa target (ví dụ: "người {target}", "nghề {target}", "thợ {target}", "đầu {target}")
❌ KHÔNG liệt kê từ quá chung chung không đặc trưng
❌ KHÔNG liệt kê từ trừu tượng, khái niệm, meta-language

✅ CHỈ liệt kê DANH TỪ cụ thể, hữu hình, đời thường
✅ Ưu tiên từ người chơi phổ thông sẽ liên tưởng NGAY LẬP TỨC

Ví dụ minh họa:
• "nấu ăn" → Tốt: gạo, thịt, cá, muối, nước mắm, phở, nồi, chảo, dao, bếp
             Tránh: quán, chợ, đầu bếp, người nấu, nội trợ
• "xe máy" → Tốt: xăng, nhớt, lốp, phanh, gương, yên, ga, còi
             Tránh: garage, thợ máy, bãi xe, người lái
• "bác sĩ" → Tốt: bệnh viện, y tá, bệnh nhân, thuốc, ống nghe, áo blouse
             Tránh: ngành y, người khám, thầy thuốc

Từ khóa: "{target}"
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_json_schema": BrainstormResponse.model_json_schema(),
            },
        )
        result = BrainstormResponse.model_validate_json(response.text)
        return [w.lower().strip() for w in result.words]
    except Exception as e:
        print(f"   ⚠️ Lỗi Brainstorm: {e}")
        raise Exception(f"Không thể brainstorm: {e}")

def get_llm_scores(target, words, max_retries=3):
    """Chấm điểm toàn bộ danh sách từ trong 1 lần để đảm bảo context toàn cục"""
    print(f"   🤖 [LLM] Đang chấm điểm Gameplay cho: '{target}'...")
    
    client = genai.Client(api_key=GOOGLE_API_KEY)

    prompt = f"""
   Bạn là Game Designer cho trò chơi Contexto tiếng Việt.

    Mục tiêu: Xếp hạng các từ theo "Độ lóe sáng trong não" của người chơi phổ thông khi nghĩ tới TỪ KHÓA: "{target}". Không dựa theo từ điển hay kiến thức chuyên ngành; ưu tiên trải nghiệm liên tưởng đời thường.

    Quy tắc chấm điểm (0-500), trung lập theo chủ đề:
    - Hạng S (480-500): Đồng nghĩa/đồng nhất; cặp gắn bó không thể tách rời; vật/dụng/địa điểm lõi gắn trực tiếp và thường xuyên với target.
    - Hạng A (400-479): Cộng sự gần; nơi chốn đặc trưng; công cụ/bộ phận chính (nếu target là đồ vật); những danh từ cụ thể thường xuất hiện cùng nhau trong đời sống.
    - Hạng B (300-399): Hành động chính; tính chất nổi bật; công cụ phụ trợ. Động từ luôn thấp điểm hơn danh từ tương ứng.
    - Hạng C (150-299): Lĩnh vực lớn; khái niệm bao trùm; hypernym chung chung; từ liên quan gián tiếp.
    - Hạng D (0-149): Phạt mạnh các trường hợp sau:
        (1) Lặp target với tiền tố/hậu tố rác ("người {target}", "ông {target}", "nữ {target}", "cả {target}", "toàn {target}").
        (2) Từ ghép chuyên ngành/chi li quá cụ thể.
        (3) Cùng loại nhưng khác lĩnh vực (cross-category).
        (4) Từ cổ/ít dùng/Hán Việt thuần túy (ví dụ: văn X, đạo X, viễn X, cổ X, ngư X...).
        (5) Từ meta-ngôn ngữ (cụm từ, thuật ngữ, từ khoá, khái niệm, tính chất, loại hình, phổ quát...).
        (6) Địa danh riêng lẻ nếu target không phải địa lý (giảm 100-150 điểm).
        (7) Từ trái nghĩa hoặc lệch ngữ cảnh.

    Nguyên tắc bắt buộc:
    - Chỉ chấm các từ có trong danh sách cung cấp; KHÔNG thêm hay đổi từ.
    - Phân hóa điểm: MỖI TỪ NÊN CÓ ĐIỂM KHÁC NHAU. Tận dụng thang điểm rộng 0-500 để tạo khoảng cách hợp lý (3-10 điểm).
    - Với {len(words)} từ, hãy phân bổ điểm đều từ cao xuống thấp, tránh dồn điểm.
    - Ưu tiên danh từ cụ thể, đời thường, hiện đại; hạn chế khái quát/ẩn dụ/văn chương.
    
    Danh sách từ cần chấm điểm:
    {json.dumps(words, ensure_ascii=False)}
    """

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": RankingResponse.model_json_schema(),
                },
            )
            result = RankingResponse.model_validate_json(response.text)
            print(f"   ✅ Chấm điểm thành công {len(result.items)}/{len(words)} từ")
            return result.items
        except Exception as e:
            print(f"   ⚠️ Lỗi API (Lần {attempt+1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise Exception(f"Không thể chấm điểm sau {max_retries} lần thử: {e}")
            time.sleep(2)
    raise Exception("Không thể chấm điểm")

def generate_hints_with_llm(target, rank_map, max_retries=3):
    """
    Tạo hints cho game bằng LLM, chọn nhiều từ đại diện cho từng khoảng rank.
    
    Args:
        target (str): Từ khóa target của game
        rank_map (dict): Dictionary mapping từ -> rank
        max_retries (int): Số lần thử lại tối đa khi gọi API
    
    Returns:
        list: Array các rank numbers cho hints (ví dụ: [7, 12, 16, 20, 38, ...])
              Có thể chứa nhiều hints cho mỗi khoảng (2-5 từ mỗi khoảng)
              Trả về list rỗng nếu không thể tạo hints
    
    Các khoảng hint được định nghĩa trong HINT_RANGES constant.
    LLM sẽ cố gắng chọn ít nhất 1 từ cho mỗi khoảng.
    """
    print(f"   💡 [LLM] Đang tạo hints cho '{target}'...")
    
    # Chỉ xử lý top 2000 từ
    sorted_words = sorted(rank_map.items(), key=lambda x: x[1])[:2000]
    
    # Tạo danh sách ứng viên cho từng khoảng
    range_candidates = []
    for min_rank, max_rank in HINT_RANGES:
        candidates = [
            {"word": word, "rank": rank}
            for word, rank in sorted_words
            if min_rank <= rank < max_rank and word != target
        ]
        if candidates:
            range_candidates.append({
                "range": f"{min_rank}-{max_rank}",
                "candidates": candidates  # Gửi tất cả ứng viên cho LLM
            })
    
    if not range_candidates:
        print("   ⚠️ Không có ứng viên cho hints")
        return []
    
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Tạo prompt cho LLM
    prompt = f"""
Bạn là chuyên gia thiết kế game Contexto tiếng Việt.

Nhiệm vụ: Chọn VÀI TỪ đại diện tốt nhất cho mỗi khoảng rank dưới đây.
Từ khóa target: "{target}"

Tiêu chí chọn từ hint:
1. Từ PHẢI có mức độ liên quan rõ ràng với target (không quá xa, không quá gần)
2. Là danh từ cụ thể, dễ hiểu, phổ biến trong đời sống
3. Giúp người chơi có manh mối hữu ích để suy luận gần hơn đến target
4. Tránh các từ: quá chuyên ngành, quá trừu tượng, hoặc chứa target trong từ ghép
5. Ưu tiên từ có tính chất gợi mở, liên tưởng tự nhiên

Danh sách ứng viên theo từng khoảng:
{json.dumps(range_candidates, ensure_ascii=False, indent=2)}

Hãy trả về JSON array với format:
[
  {{"word": "từ_1", "rank": số_rank}},
  {{"word": "từ_2", "rank": số_rank}},
  ...
]

Yêu cầu:
- Chọn 2-5 từ cho mỗi khoảng (tùy vào số lượng từ liên quan có trong khoảng)
- BẮT BUỘC đảm bảo MỌI khoảng đều có ít nhất 1 từ được trả về
- Nếu khoảng nào không có từ liên quan mạnh, hãy chọn từ liên quan yếu nhất trong khoảng đó
- Ưu tiên chất lượng hơn số lượng - chỉ chọn các từ thực sự có ích
"""
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": HintResponse.model_json_schema(),
                },
            )
            result = HintResponse.model_validate_json(response.text)
            
            # Chuyển đổi thành array các rank numbers (như đã lưu trong game files)
            hint_ranks = [item.rank for item in result.hints]
            hint_words = [item.word for item in result.hints]
            
            print(f"   ✅ Đã tạo {len(hint_ranks)} hints: {hint_ranks}")
            print(f"   💡 Hint words: {hint_words}")
            return hint_ranks
            
        except Exception as e:
            print(f"   ⚠️ Lỗi khi tạo hints (Lần {attempt+1}): {e}")
            if attempt == max_retries - 1:
                raise Exception(f"Không thể tạo hints sau {max_retries} lần thử: {e}")
            time.sleep(2)
    
    raise Exception("Không thể tạo hints")

# =========================== EMBEDDING RANKING ===========================

def run_model_ranking(model_name, model_instance, dictionary, query, k):
    """Tính ranking cho 1 model"""
    emb_cache = os.path.join(CACHE_DIR, f"{model_name}_vocab_embeddings.npy")

    if os.path.exists(emb_cache):
        corpus_embeddings = np.load(emb_cache)
    else:
        print(f"      Encoding vocab với {model_name}...")
        corpus_embeddings = model_instance.encode(
            dictionary,
            batch_size=128,
            show_progress_bar=True,
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        np.save(emb_cache, corpus_embeddings)

    # Encode query
    query_embedding = model_instance.encode(
        [query],
        convert_to_numpy=True,
        normalize_embeddings=True
    )

    # FAISS search
    d = corpus_embeddings.shape[1]
    index = faiss.IndexFlatIP(d)
    index.add(corpus_embeddings)

    D, I = index.search(query_embedding, min(k, len(dictionary)))

    # Return rank map
    return {dictionary[idx]: rank + 1 for rank, idx in enumerate(I[0])}

def is_valid_candidate(candidate_word, target_word):
    """
    Kiểm tra từ hợp lệ (Phiên bản Bóc Vỏ Hành - Peeling Loop).
    Logic: Bóc hết các lớp từ rác ở đầu/cuối đi.
    Nếu lõi còn lại == target -> LOẠI.
    """

    # 1. Loại chính nó
    if candidate_word == target_word:
        return False

    # 2. Danh sách từ rác (Token đơn)
    NOISE_TOKENS = {
        # Lượng từ
        "các", "những", "một", "mọi", "mỗi", "từng", "mấy", "vài", "bọn", "nhóm",
        # Loại từ
        "cái", "con", "chiếc", "người", "nhà", "ông", "bà", "cô", "chú", "anh", "chị", "thằng", "tên", "gã", "viên", "ngài",
        # Danh từ trừu tượng hóa (Thủ phạm của 'lực lượng', 'ngành', 'hệ thống')
        "việc", "sự", "cục", "hội", "ngành", "giới", "ban", "sở", "bộ",
        "lực", "lượng", "hệ", "thống", "trình", "độ", "công", "tác", "chuyên", "môn"
    }

    NOISE_SUFFIXES = {"này", "kia", "đó", "nọ", "ấy", "gì", "đâu", "ư", "nhỉ", "nhé", "hả", "của"}

    # 3. Tách từ để xử lý
    tokens = candidate_word.split('_')

    # Nếu từ không chứa target thì giữ lại
    if target_word not in candidate_word:
        return True

    # --- VÒNG LẶP BÓC TÁCH (PEELING LOOP) ---

    # Bóc từ đầu (Prefix)
    while len(tokens) > 0 and tokens[0] in NOISE_TOKENS:
        tokens.pop(0)

    # Bóc từ cuối (Suffix)
    while len(tokens) > 0 and tokens[-1] in NOISE_SUFFIXES:
        tokens.pop(-1)

    # 4. Kiểm tra lõi còn lại
    remaining_word = "_".join(tokens)

    # Nếu sau khi bóc hết vỏ mà lõi chính là Target -> RÁC (LOẠI)
    if remaining_word == target_word:
        return False

    # Nếu bóc hết sạch sành sanh (rỗng) -> RÁC (LOẠI)
    if not remaining_word:
        return False

    return True

def generate_rrf_ranking(target, vocab, loaded_models):
    """Tạo RRF ranking cho 1 target"""
    print(f"   ⚡ [Embedding] Tính toán RRF cho '{target}'...")

    K_SEARCH = len(vocab)
    rankings_map = {}

    # Chạy tất cả models
    for name in EMBEDDING_MODELS:
        r = run_model_ranking(name, loaded_models[name], vocab, target, k=K_SEARCH)
        rankings_map[name] = r

    # Tính RRF score
    all_candidates = set()
    for model_rankings in rankings_map.values():
        all_candidates.update(model_rankings.keys())

    print(f"      Tổng {len(all_candidates):,} từ từ các models")

    final_list = []
    filtered_count = 0
    K_RRF = 60

    for word in all_candidates:
        if not is_valid_candidate(word, target):
            filtered_count += 1
            continue

        # Tính RRF
        rrf_score = 0
        for model_name, config in EMBEDDING_MODELS.items():
            rank = rankings_map[model_name].get(word, 100000)
            rrf_score += config["weight"] * (1 / (K_RRF + rank))

        final_list.append({"word": word, "rrf_score": rrf_score})

    sorted_words = sorted(final_list, key=lambda x: x["rrf_score"], reverse=True)

    print(f"      → {len(sorted_words):,} từ hợp lệ (filtered {filtered_count:,})")
    return sorted_words

# =========================== FILE PROCESSING ===========================

def process_file(file_path):
    filename = os.path.basename(file_path)
    print(f"\n🔄 Đang xử lý: {filename}")

    # 1. Load file JSON gốc
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    target_word = data.get("keyword")
    rank_map = data.get("rank_map", {})

    if not target_word or not rank_map:
        print(f"   ❌ File lỗi định dạng. Bỏ qua.")
        return

    # 2. Chuẩn bị dữ liệu
    sorted_items = sorted(rank_map.items(), key=lambda x: x[1])
    embedding_candidates = [item[0] for item in sorted_items[:TOP_K_RERANK]]

    # 3. BRAINSTORMING (Cứu hộ từ vựng)
    rescue_words = llm_brainstorm(target_word)
    print(f"   Các từ được thêm: {rescue_words}")

    # Gộp danh sách
    combined_candidates = list(set(embedding_candidates + rescue_words))

    # 4. GỌI GEMINI RE-RANK (toàn bộ danh sách để giữ context)
    print(f"   🤖 Gửi {len(combined_candidates)} từ cho Gemini...")
    llm_results = get_llm_scores(target_word, combined_candidates)

    # 5. Hợp nhất kết quả (Merge)
    final_rank_map = {}
    current_rank = 1

    # Luôn giữ Target ở Rank 1
    final_rank_map[target_word] = current_rank
    current_rank += 1

    # A. Xử lý phần đầu (LLM)
    processed_words_set = set()
    # Chỉ chấp nhận từ do LLM trả về nếu nằm trong danh sách ứng viên
    combined_set = set(combined_candidates)

    if llm_results:
        sorted_llm = sorted(llm_results, key=lambda x: x.s, reverse=True)

        for item in sorted_llm:
            if item.w == target_word:
                continue
            # Bỏ qua từ không nằm trong danh sách ứng viên để tránh LLM bịa thêm
            if item.w not in combined_set:
                continue
            # Bỏ qua từ đã được xử lý (tránh duplicate)
            if item.w in processed_words_set or item.w in final_rank_map:
                continue
            final_rank_map[item.w] = current_rank
            processed_words_set.add(item.w)
            current_rank += 1
    else:
        print("   ⚠️ LLM Re-rank thất bại. Sẽ dùng thứ tự gốc.")

    # B. Xử lý phần đuôi (Embedding + Fallback)
    for w, old_rank in sorted_items:
        if w == target_word:
            continue
        # Bỏ qua từ đã được xử lý (tránh duplicate)
        if w in final_rank_map or w in processed_words_set:
            continue
        final_rank_map[w] = current_rank
        current_rank += 1

    # 6. Tạo hints với LLM
    hints = generate_hints_with_llm(target_word, final_rank_map)
    
    # 7. Xuất file kết quả
    output_path = os.path.join(OUTPUT_FOLDER, filename)
    output_data = {
        "keyword": target_word,
        "rank_map": final_rank_map
    }
    
    # Thêm hints vào output nếu có
    if hints:
        output_data["hints"] = hints

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=4)

    if hints:
        print(f"   ✅ Đã lưu: {output_path} (Tổng: {len(final_rank_map)} từ, {len(hints)} hints)")
    else:
        print(f"   ✅ Đã lưu: {output_path} (Tổng: {len(final_rank_map)} từ, no hints generated)")
    print(f"   🏆 Top 50 Mới: {list(final_rank_map.keys())[:50]}")
    
    return output_path

def save_to_contexto_and_update_loader(output_file, target_word):
    """
    Sao chép file output vào lib/contexto và chạy create_rank_loader.py
    """
    print("\n📦 Đang lưu vào lib/contexto...")
    
    # Tạo slug từ target_word (bác sĩ -> bac_si)
    slug = remove_vietnamese_accents(target_word.replace(" ", "_"))
    
    # Đường dẫn đích
    dest_file = CONTEXTO_DIR / f"{slug}.json"
    
    # Sao chép file
    import shutil
    try:
        shutil.copy2(output_file, dest_file)
        print(f"   ✅ Đã lưu: {dest_file}")
    except Exception as e:
        print(f"   ❌ Lỗi khi sao chép file: {e}")
        return False
    
    # Chạy create_rank_loader.py
    print("\n🔄 Đang cập nhật rankLoader.json...")
    create_rank_loader_script = CONTEXTO_DIR / "create_rank_loader.py"
    
    if not create_rank_loader_script.exists():
        print(f"   ⚠️  Không tìm thấy {create_rank_loader_script}")
        return False
    
    try:
        result = subprocess.run(
            ["python3", str(create_rank_loader_script)],
            cwd=str(CONTEXTO_DIR),
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout)
        print("   ✅ Đã cập nhật rankLoader.json")
        return True
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Lỗi khi chạy create_rank_loader.py: {e}")
        print(f"   Output: {e.stdout}")
        print(f"   Error: {e.stderr}")
        return False

# =========================== MAIN ===========================

def main():
    print("="*70)
    print("🚀 CONTEXTO DAILY RANKING PIPELINE")
    print("="*70)
    
    # Generate daily target
    target_word = generate_daily_target()
    target_word_underscore = target_word.replace(" ", "_")
    
    # Load vocab
    vocab = load_vocab()
    print(f"📥 Loaded {len(vocab):,} words from vocab\n")

    # Pre-load models
    print("📦 Pre-loading embedding models...")
    loaded_models = {}
    for name, config in EMBEDDING_MODELS.items():
        print(f"   - Loading {name}...")
        loaded_models[name] = SentenceTransformer(config["path"])
    print("✅ All models loaded\n")

    print("="*70)
    print(f"TARGET: '{target_word.upper()}'")
    print("="*70)

    start_time = time.time()

    try:
        # Tạo RRF ranking
        rrf_ranking = generate_rrf_ranking(target_word_underscore, vocab, loaded_models)

        # Tạo rank_map
        rank_map = {}
        rank_map[target_word] = 1

        for rank, item in enumerate(rrf_ranking, start=2):
            rank_map[item['word'].replace("_", " ")] = rank

        # Lưu file JSON
        output_data = {
            "keyword": target_word,
            "rank_map": rank_map
        }

        intermediate_file = f"{INPUT_FOLDER}/{remove_vietnamese_accents(target_word_underscore)}.json"
        with open(intermediate_file, "w", encoding="utf-8") as f:
            json.dump(output_data, f, ensure_ascii=False, separators=(',', ':'))

        elapsed = time.time() - start_time
        file_size = os.path.getsize(intermediate_file) / 1024

        print(f"   ✅ Saved RRF: {intermediate_file} ({file_size:.1f} KB, {len(rank_map)} words)")
        print(f"   🏆 Top 50: {list(rank_map.keys())[:51]}")
        print(f"   ⏱️  Completed in {elapsed:.1f}s\n")

        # Re-rank phase
        print("\n🎯 Starting LLM Re-rank phase...")
        final_output = process_file(intermediate_file)

        # Lưu vào lib/contexto và cập nhật rankLoader
        if final_output:
            success = save_to_contexto_and_update_loader(final_output, target_word)
            if success:
                print("\n🎉 HOÀN TẤT! File đã được lưu vào lib/contexto và rankLoader đã được cập nhật.")
            else:
                print("\n⚠️  HOÀN TẤT nhưng có lỗi khi cập nhật contexto/rankLoader.")
        else:
            print("\n🎉 HOÀN TẤT!")

    except Exception as e:
        print(f"   ❌ Error: {e}\n")
        raise

if __name__ == "__main__":
    # Force unbuffered output (alternative method)
    import functools
    print = functools.partial(print, flush=True)
    
    main()
