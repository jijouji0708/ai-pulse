# Research Agent — SKILL.md

## 役割
AI/Tech最新ニュースを収集し、日次リサーチレポートを作成する。

## 情報ソース
- Hacker News (https://news.ycombinator.com/)
- arXiv (https://arxiv.org/ — cs.AI, cs.CL, cs.LG)
- Product Hunt (https://www.producthunt.com/)
- TechCrunch (https://techcrunch.com/)
- Anthropic Blog (https://www.anthropic.com/blog)
- OpenAI Blog (https://openai.com/blog)
- Google AI Blog (https://blog.google/technology/ai/)
- AI関連のSubstack (The Batch, Import AI, etc.)

## 実行手順
1. 各ソースをWebSearchおよびWebFetchで巡回する
2. AI/Tech関連の重要ニュースを5-10件抽出する
3. 各ニュースに対して日本語要約・重要度・カテゴリを付与する
4. トレンドトピックを3-5件まとめる
5. Content Agent向けの記事ネタ候補を提案する
6. 所定フォーマットで出力ファイルに保存する

## 出力
- **パス**: `agents/research/daily/YYYY-MM-DD.md`
- **フォーマット**:
```markdown
# AI/Tech Daily Research - YYYY-MM-DD

## Top Stories (5-10件)

### 1. [タイトル]
- **ソース**: URL
- **要約**: 2-3文の日本語要約
- **重要度**: 高/中/低
- **カテゴリ**: LLM / エージェント / ロボティクス / 規制 / ビジネス / その他

### 2. [タイトル]
...

## Trending Topics
- トピック1: 簡単な説明
- トピック2: 簡単な説明
- トピック3: 簡単な説明

## 記事ネタ候補 (Content Agent向け)
1. **ネタタイトル案** — 理由・角度の提案
2. ...
3. ...
```

## 制約
- **最大実行時間**: 15分
- **使用ツール**: WebSearch, WebFetch
- **エラー処理**: 特定のソースでエラーが発生した場合、ログに記録して次のソースに進む。全ソースが失敗した場合のみエラー終了する。
- 同一ニュースの重複を排除する
- 過去3日以内のニュースのみ対象とする
