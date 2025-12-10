import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// Hàm chuẩn hóa tiếng Việt: sửa các trường hợp dấu sai vị trí
const normalizeVietnamese = (text: string): string => {
    return text
        .replaceAll(/óa/g, 'oá')  // hoá -> hóa
        .replaceAll(/òa/g, 'oà')  // hoà -> hòa  
        .replaceAll(/ỏa/g, 'oả')  // hoả -> hỏa
        .replaceAll(/õa/g, 'oã')  // hoã -> hõa
        .replaceAll(/ọa/g, 'oạ')  // hoạ -> họa
        .replaceAll(/úy/g, 'uý')  // thuý -> thúy
        .replaceAll(/ùy/g, 'uỳ')  // thuỳ -> thùy
        .replaceAll(/ủy/g, 'uỷ')  // thuỷ -> thủy  
        .replaceAll(/ũy/g, 'uỹ')  // thuỹ -> thũy
        .replaceAll(/ụy/g, 'uỵ')  // thuỵ -> thụy
        .replaceAll(/úi/g, 'uí')  // tuí -> túi
        .replaceAll(/ùi/g, 'uì')  // tuì -> tùi
        .replaceAll(/ủi/g, 'uỉ')  // tuỉ -> tủi
        .replaceAll(/ũi/g, 'uĩ')  // tuĩ -> tũi  
        .replaceAll(/ụi/g, 'uị');  // tuị -> tụi
};

// ✅ In-memory cache cho game data
// Lưu ý: Cache này chỉ tồn tại trong lifecycle của serverless container (warm state)
// Vercel giữ container warm ~5-15 phút, sau đó cache sẽ bị clear
let rankLoader: Record<number, { slug: string; createdAt: string }> | null = null;

// LRU cache với limit để tránh memory overflow khi có quá nhiều games
const MAX_CACHED_GAMES = 20; // Giới hạn 20 games trong memory (~20-50MB tùy size)
const gameDataCache = new Map<string, { 
    rank_map: Record<string, number>; 
    hints?: number[];
    lastAccessed: number; // Timestamp để implement LRU
}>();

async function getRankLoader() {
    if (!rankLoader) {
        const filePath = join(process.cwd(), 'lib', 'contexto', 'rankLoader.json');
        const fileContent = await readFile(filePath, 'utf-8');
        rankLoader = JSON.parse(fileContent);
    }
    return rankLoader;
}

// Cache game data với LRU eviction để tránh out of memory
async function getGameData(slug: string) {
    // Check cache
    const cached = gameDataCache.get(slug);
    if (cached) {
        // Update last accessed time
        cached.lastAccessed = Date.now();
        return cached;
    }

    // Cache miss - load from file
    const filePath = join(process.cwd(), 'lib', 'contexto', `${slug}.json`);
    const fileContent = await readFile(filePath, 'utf-8');
    const gameData = JSON.parse(fileContent);
    
    // Evict oldest entry if cache is full (LRU)
    if (gameDataCache.size >= MAX_CACHED_GAMES) {
        let oldestSlug = '';
        let oldestTime = Infinity;
        
        for (const [key, value] of gameDataCache.entries()) {
            if (value.lastAccessed < oldestTime) {
                oldestTime = value.lastAccessed;
                oldestSlug = key;
            }
        }
        
        if (oldestSlug) {
            gameDataCache.delete(oldestSlug);
            console.log('[CACHE] Evicted:', oldestSlug, 'to make room for:', slug);
        }
    }
    
    // Add to cache with current timestamp
    gameDataCache.set(slug, {
        ...gameData,
        lastAccessed: Date.now()
    });
    
    console.log('[CACHE] Loaded:', slug, `(${gameDataCache.size}/${MAX_CACHED_GAMES} cached)`);
    
    return gameDataCache.get(slug)!;
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));
    const rawGuess = searchParams.get("guess")?.trim().toLowerCase();
    const guess = rawGuess ? normalizeVietnamese(rawGuess) : rawGuess;
    const getClosest = searchParams.get("closest") === "true";
    const getSecret = searchParams.get("secret") === "true";
    const getHint = searchParams.get("hint") === "true";
    const lowestRank = searchParams.get("lowestRank") ? Number(searchParams.get("lowestRank")) : null;

    if (!id) {
        return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
    }

    const rankLoaderData = await getRankLoader();
    const game = rankLoaderData![id];
    if (!game) {
        return NextResponse.json({ error: "Không tìm thấy game" }, { status: 404 });
    }

    try {
        // ✅ Sử dụng in-memory cache thay vì đọc file mỗi lần
        const gameData = await getGameData(game.slug);
        const { rank_map } = gameData;

        // Nếu yêu cầu lấy từ bí mật
        if (getSecret) {

            // Tìm từ có rank = 1 (từ bí mật)
            const secretWord = Object.entries(rank_map).find(([, data]) => {
                const rank = data as number;
                return rank === 1;
            });

            if (secretWord) {
                console.log('[SECRET] Returning:', secretWord[0]);
                return NextResponse.json({
                    secretWord: secretWord[0]
                    // Bỏ gameId để giảm thông tin không cần thiết
                }, {
                    headers: {
                        // Cache secret word trong 1 năm (31536000 giây)
                        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
                        'CDN-Cache-Control': 'public, max-age=31536000',
                        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
                    }
                });
            } else {
                return NextResponse.json({ error: "Không tìm thấy từ bí mật" }, { status: 404 });
            }
        }

        // Nếu yêu cầu hint
        if (getHint) {
            // Tìm từ bí mật để loại trừ khỏi hints
            const secretEntry = Object.entries(rank_map).find(([, data]) => {
                const rank = data as number;
                return rank === 1;
            });
            const secretWord = secretEntry ? secretEntry[0] : null;

            // Kiểm tra xem game có predefined hints không
            const predefinedHints = gameData.hints as number[] | undefined;

            // Nếu có predefined hints, ưu tiên sử dụng
            if (predefinedHints && Array.isArray(predefinedHints) && predefinedHints.length > 0) {
                // Kiểm tra điều kiện không cho hint khi quá gần
                if (lowestRank && lowestRank <= 2) {
                    return NextResponse.json({
                        error: "Bạn đã siêu gần rồi! Hãy tự tìm câu trả lời nhé! 🔥"
                    }, { status: 400 });
                }

                // Sắp xếp hints theo thứ tự giảm dần (từ to đến bé)
                const sortedHints = [...predefinedHints].sort((a, b) => b - a);
                
                // Tìm hint phù hợp từ danh sách predefined
                // Chọn hint lớn nhất mà nhỏ hơn lowestRank (hoặc hint lớn nhất nếu chưa đoán)
                const suitableHint = sortedHints.find(hintRank => 
                    !lowestRank || hintRank < lowestRank
                );

                if (suitableHint) {
                    // Tìm từ tương ứng với rank hint
                    const hintEntry = Object.entries(rank_map).find(([word, rank]) => {
                        const r = rank as number;
                        return r === suitableHint && word !== secretWord;
                    });

                    if (hintEntry) {
                        console.log('[HINT] Predefined:', { id, word: hintEntry[0], rank: suitableHint, lowestRank });
                        return NextResponse.json({
                            hint: hintEntry[0],
                            rank: suitableHint
                        }, {
                            headers: {
                                // Cache hint trong 1 năm (31536000 giây) vì hint predefined không thay đổi
                                'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
                                'CDN-Cache-Control': 'public, max-age=31536000',
                                'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
                            }
                        });
                    }
                }

                // Nếu không tìm thấy hint phù hợp trong danh sách predefined
                // hoặc hint không tồn tại trong rank_map
                // → Fallback sang phương pháp random cũ
            }

            // ============================================================
            // FALLBACK: Phương pháp random cũ (progressive hint logic)
            // ============================================================
            
            // Implement progressive hint logic - người dùng phải hint tuần tự
            // Hệ thống hint dần dần, không cho phép nhảy cấp quá nhanh
            let targetRankRange: [number, number];

            if (!lowestRank) {
                // Chưa đoán được từ nào có rank -> hint level 1 (xa nhất)
                targetRankRange = [1000, 2000];
            } else if (lowestRank > 1000) {
                // Đã có từ rank > 1000 -> hint level 2
                targetRankRange = [700, 1000];
            } else if (lowestRank > 700) {
                // Đã có từ rank > 700 -> hint level 3
                targetRankRange = [500, 700];
            } else if (lowestRank > 500) {
                // Đã có từ rank > 500 -> hint level 4
                targetRankRange = [350, 500];
            } else if (lowestRank > 350) {
                // Đã có từ rank > 350 -> hint level 5
                targetRankRange = [250, 350];
            } else if (lowestRank > 250) {
                // Đã có từ rank > 250 -> hint level 6
                targetRankRange = [180, 250];
            } else if (lowestRank > 180) {
                // Đã có từ rank > 180 -> hint level 7
                targetRankRange = [130, 180];
            } else if (lowestRank > 130) {
                // Đã có từ rank > 130 -> hint level 8
                targetRankRange = [90, 130];
            } else if (lowestRank > 90) {
                // Đã có từ rank > 90 -> hint level 9
                targetRankRange = [60, 90];
            } else if (lowestRank > 60) {
                // Đã có từ rank > 60 -> hint level 10
                targetRankRange = [40, 60];
            } else if (lowestRank > 40) {
                // Đã có từ rank > 40 -> hint level 11
                targetRankRange = [25, 40];
            } else if (lowestRank > 25) {
                // Đã có từ rank > 25 -> hint level 12
                targetRankRange = [15, 25];
            } else if (lowestRank > 15) {
                // Đã có từ rank > 15 -> hint level 13
                targetRankRange = [8, 15];
            } else if (lowestRank > 7) {
                // Đã có từ rank > 7 -> hint từ 3-7
                targetRankRange = [3, 7];
            } else if (lowestRank > 2) {
                // Đã có từ rank > 2 và <= 7 -> hint chính xác rank - 1
                const targetRank = lowestRank - 1;
                targetRankRange = [targetRank, targetRank];
            } else {
                // Đã rất gần (rank <= 2) -> không cho hint nữa
                return NextResponse.json({
                    error: "Bạn đã siêu gần rồi! Hãy tự tìm câu trả lời nhé! 🔥"
                }, { status: 400 });
            }

            // Tìm các từ trong target rank range
            const candidateWords = Object.entries(rank_map)
                .map(([word, data]) => {
                    const rank = data as number;
                    return {
                        word,
                        rank: rank
                    };
                })
                .filter(item => {
                    // Loại trừ từ bí mật
                    if (item.word === secretWord) {
                        return false;
                    }
                    // Chọn từ trong target range (không cần so sánh với lowestRank nữa)
                    return item.rank >= targetRankRange[0] &&
                        item.rank <= targetRankRange[1];
                });

            // Nếu không có từ nào trong target range, tìm các từ gần target range
            if (candidateWords.length === 0) {
                const fallbackWords = Object.entries(rank_map)
                    .map(([word, data]) => {
                        const rank = data as number;
                        return {
                            word,
                            rank: rank
                        };
                    })
                    .filter(item => {
                        if (item.word === secretWord) {
                            return false;
                        }
                        // Fallback: tìm từ gần với target range
                        const targetMid = (targetRankRange[0] + targetRankRange[1]) / 2;
                        return item.rank >= targetMid && item.rank <= targetRankRange[1] * 1.5;
                    });

                if (fallbackWords.length === 0) {
                    return NextResponse.json({
                        error: "Không thể tìm thấy từ hint phù hợp cho level này"
                    }, { status: 404 });
                }

                // Chọn ngẫu nhiên từ fallback words
                const randomIndex = Math.floor(Math.random() * fallbackWords.length);
                const hintWord = fallbackWords[randomIndex];
                console.log('[HINT] Fallback random:', { id, word: hintWord.word, rank: hintWord.rank, range: targetRankRange, lowestRank });

                return NextResponse.json({
                    hint: hintWord.word,
                    rank: hintWord.rank
                    // Bỏ gameId để giảm thông tin không cần thiết
                }, {
                    headers: {
                        // Cache fallback hint ngắn hơn (1 giờ) vì là random
                        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                        'CDN-Cache-Control': 'public, max-age=3600',
                        'Vercel-CDN-Cache-Control': 'public, max-age=3600',
                    }
                });
            }

            // Chọn ngẫu nhiên một từ từ candidate words
            const randomIndex = Math.floor(Math.random() * candidateWords.length);
            const hintWord = candidateWords[randomIndex];
            console.log('[HINT] Random candidate:', { id, word: hintWord.word, rank: hintWord.rank, range: targetRankRange, lowestRank });

            return NextResponse.json({
                hint: hintWord.word,
                rank: hintWord.rank
                // Bỏ gameId để giảm thông tin không cần thiết
            }, {
                headers: {
                    // Cache random hint ngắn hơn (1 giờ) vì là random
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800',
                    'CDN-Cache-Control': 'public, max-age=3600',
                    'Vercel-CDN-Cache-Control': 'public, max-age=3600',
                }
            });
        }

        // Nếu yêu cầu danh sách 200 từ gần nhất
        if (getClosest) {
            // Kiểm tra bảo mật: yêu cầu guess phải đúng từ bí mật (rank 1)
            if (!guess) {
                return NextResponse.json({ error: "Thiếu từ xác thực" }, { status: 400 });
            }

            const guessRank = rank_map[guess] as number | undefined;
            if (!guessRank || guessRank !== 1) {
                console.log('[CLOSEST] Unauthorized:', { guess, rank: guessRank });
                return NextResponse.json({ error: "Chưa đoán đúng từ bí mật" }, { status: 403 });
            }

            // Chuyển đổi rank_map thành array và sắp xếp theo rank
            const sortedWords = Object.entries(rank_map)
                .map(([word, data]) => {
                    const rank = data as number; // Type assertion cho rank_map
                    return {
                        word,
                        rank: rank
                    };
                })
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 200); // Lấy 200 từ đầu tiên (gần nhất)

            console.log('[CLOSEST] Authorized, returning:', sortedWords.length, 'words for', guess);

            return NextResponse.json({
                closestWords: sortedWords
                // Bỏ gameId để giảm thông tin không cần thiết
            }, {
                headers: {
                    // Cache 200 closest words trong 1 năm
                    'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, max-age=31536000',
                    'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
                }
            });
        }

        // Logic cũ cho việc đoán từ
        if (!guess) {
            return NextResponse.json({ error: "Thiếu guess" }, { status: 400 });
        }

        const entry = rank_map[guess];
        if (!entry) {
            console.log('[GUESS] Not found:', { id, word: guess });
            return NextResponse.json({ rank: null, score: null }, { status: 404 });
        }

        const rank = entry as number;
        console.log('[GUESS]', { id, word: guess, rank });

        return NextResponse.json({
            rank: rank
            // Chỉ trả về rank và score cần thiết cho gameplay
        }, {
            headers: {
                // Cache guess result trong 1 năm vì rank không thay đổi
                'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=86400',
                'CDN-Cache-Control': 'public, max-age=31536000',
                'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
            }
        });
    } catch (err) {
        console.error("❌ [ERROR]", { id, guess, getClosest, getSecret, getHint, lowestRank, error: err });
        return NextResponse.json({ error: "Lỗi khi đọc dữ liệu game" }, { status: 500 });
    }
}
