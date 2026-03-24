# Content Agent — SKILL.md

## 役割
Research Agentのリサーチ結果をもとに、AI Pulse向けの記事を執筆する。

## 入力
- `agents/research/daily/` 内の最新ファイルを読む
- `agents/content/style-guide.md` のスタイルガイドに従う

## 実行手順
1. 最新のリサーチレポートを読み込む
2. 記事ネタ候補から1つ選択する（重要度「高」を優先）
3. style-guide.md のルールに従って記事を執筆する
4. ソースURLを確認し、正確な情報のみ記載する
5. frontmatter を含む完全な記事として出力する

## 出力
- **パス**: `agents/content/drafts/YYYY-MM-DD-slug.md`
- **フォーマット**:
```markdown
---
title: ""
date: YYYY-MM-DD
category: ""
tags: []
sources: []
ai_generated: true
status: draft
---

# タイトル

リード文（記事の要点を1-2文で）

## 見出し1

本文...

## 見出し2

本文...

## まとめ

まとめの文章...

---

*この記事はAIエージェントによって生成されました。事実確認は行っていますが、誤りがある場合はお知らせください。*
```

## 制約
- **最大実行時間**: 30分
- **文字数**: 800-1500文字（日本語本文）
- **必須要素**: 出典リンク、AI生成明記、frontmatter
- style-guide.md の最新版に常に従う（Eval Agentが改善する）
- 確認できない情報には `[未確認]` タグを付与する
