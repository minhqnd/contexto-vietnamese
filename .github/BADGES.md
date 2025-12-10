# Contexto Game Badges

Sử dụng các badge sau trong README.md:

## Status Badge (Hiện tại)
```markdown
[![Daily Ranking Pipeline](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml/badge.svg)](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml)
```

## Dynamic Badges (Mới - Hiển thị thông tin hữu ích)

### 1. Tổng số games và từ vựng
```markdown
![Contexto Stats](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/minhqnd/moiWEB/main/.github/badges/contexto-stats.json)
```

### 2. Game mới nhất
```markdown
![Latest Game](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/minhqnd/moiWEB/main/.github/badges/latest-game.json)
```

### 3. Workflow status với branch
```markdown
[![Daily Ranking](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml/badge.svg?branch=main)](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml)
```

### 4. Last successful run
```markdown
![Last Run](https://img.shields.io/github/last-commit/minhqnd/moiWEB/main?label=Last%20Update&logo=github)
```

## Ví dụ sử dụng trong README

```markdown
# Contexto Game 🎯

[![Daily Ranking](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml/badge.svg)](https://github.com/minhqnd/moiWEB/actions/workflows/daily-ranking.yml)
![Contexto Stats](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/minhqnd/moiWEB/main/.github/badges/contexto-stats.json)
![Latest Game](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/minhqnd/moiWEB/main/.github/badges/latest-game.json)
![Last Update](https://img.shields.io/github/last-commit/minhqnd/moiWEB/main?label=Last%20Update)
```

## Preview

Badges sẽ hiển thị:
- ✅ **Daily Ranking**: passing/failing
- 📊 **Contexto Stats**: "18 games • 88,630 words"
- 🎮 **Latest Game**: "gia đình"
- 🕒 **Last Update**: "2 hours ago"
