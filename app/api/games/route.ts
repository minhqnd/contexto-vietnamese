import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// CORS headers helper
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Define types for the game data
interface GameData {
    createdAt: string;
    slug?: string; // slug có thể chứa target word nên chúng ta sẽ không expose
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: corsHeaders
    });
}

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'lib', 'contexto', 'rankLoader.json');
        const fileContent = await readFile(filePath, 'utf-8');
        const games: Record<string, GameData> = JSON.parse(fileContent);

        // Tối ưu: chỉ trả về thông tin cần thiết, không lộ slug (có thể chứa target word)
        const optimizedGames: Record<number, { createdAt: string }> = {};

        Object.entries(games).forEach(([id, gameData]: [string, GameData]) => {
            optimizedGames[Number(id)] = {
                createdAt: gameData.createdAt
            };
        });

        // Tính số giây còn lại đến 00:00 giờ Việt Nam (UTC+7)
        const now = new Date();
        const GMT7_OFFSET = 7 * 60 * 60 * 1000; // 7 giờ = 25200000 ms
        
        // Tính thời điểm hiện tại theo GMT+7
        const vnTimeMs = now.getTime() + GMT7_OFFSET;
        const vnDate = new Date(vnTimeMs);
        
        // Set về 00:00:00 ngày hôm sau theo UTC (để tính midnight VN)
        vnDate.setUTCHours(0, 0, 0, 0);
        vnDate.setUTCDate(vnDate.getUTCDate() + 1);
        
        // Chuyển về UTC để so sánh
        const nextMidnightUTC = new Date(vnDate.getTime() - GMT7_OFFSET);
        const secondsUntilMidnight = Math.floor((nextMidnightUTC.getTime() - now.getTime()) / 1000);
        
        // Cache cho đến 00:00 giờ Việt Nam, sau đó revalidate
        const maxAge = Math.max(secondsUntilMidnight, 60); // Tối thiểu 60 giây
        
        return NextResponse.json({
            games: optimizedGames
        }, {
            headers: {
                ...corsHeaders,
                // Cache sẽ hết hạn vào 00:00 giờ Việt Nam
                'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=3600`,
                'CDN-Cache-Control': `public, max-age=${maxAge}`,
                'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
            }
        });
    } catch (err) {
        console.error("❌ Lỗi khi đọc danh sách games:", err);
        return NextResponse.json({ error: "Lỗi khi đọc danh sách games" }, { 
            status: 500,
            headers: corsHeaders 
        });
    }
}
