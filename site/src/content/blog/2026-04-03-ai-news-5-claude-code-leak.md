---
title: "【4/3】AIニュース5選 — Claude Codeソース流出51万行の衝撃"
description: "Claude Codeの51万行ソースがnpm設定ミスで流出。Alibaba Qwen3.6-Plus、Gemini Flash-Lite 2.5倍速、OpenAI投資家のAnthropic移動など4月のAIニュース5選。"
pubDate: "2026-04-03"
tags: ["AIニュース", "Anthropic", "セキュリティ", "Alibaba", "Gemini"]
category: "ニュースまとめ"
ai_generated: true
status: "reviewed"
---

51万2000行のTypeScriptコード。約1900ファイル。Anthropicの「Claude Code」のソースコードが、npmパッケージの設定ミスで誰でも見られる状態になっていました。

AIモデルそのものではなく、開発ツールのソースですが、セキュリティインシデントとしては最大級です。

## 1. Claude Codeのソースコード流出 — 設定ミスが招いた51万行の公開

Anthropicが提供するClaude Code CLIツールのTypeScriptソースコード（51万2000行、約1900ファイル）が、npmパッケージに含まれた`.map`ファイルの設定ミスにより、公開状態になっていたことが判明しました。

流出したのはAIモデルの学習データや重みではなく、CLIツールのフロントエンド実装です。しかし、コードの構造やAPI呼び出しパターンが見えることで、セキュリティ上の脆弱性が発見されるリスクがあります。セキュリティ研究者のChaofan Shou氏がX上で最初に報告し、数時間で流出コードはGitHubにミラーされ、8万以上のスターを集めました。

原因は`.map`ファイルを`.npmignore`に追加し忘れたこと。Anthropicは修正済みですが、一度公開されたコードはアーカイブに残り続けます。

**ポイント**: AIモデル自体のセキュリティだけでなく、周辺ツールのサプライチェーンセキュリティも重要です。[Claude Codeの機能解説はこちら](/blog/2026-03-24-claude-code-guide-2026/)。

出典: [The Hacker News](https://thehackernews.com/2026/04/claude-code-tleaked-via-npm-packaging.html)、[The Register](https://www.theregister.com/2026/03/31/anthropic_claude_code_source_code/)

## 2. Alibaba Qwen3.6-Plus — エージェント型AIで企業市場を狙う

中国Alibabaが4月2日に「Qwen3.6-Plus」をリリースしました。エージェント型AI——自律的にコードを書き、画像やドキュメントを分析できるモデルです。100万トークンのコンテキストウィンドウを標準搭載し、リポジトリレベルのコーディングに対応します。

3月の「モデル雪崩」に続き、4月もリリースペースは衰えません。特に中国勢の量産体制は、米国のOpenAI・Anthropic・Googleとは異なる戦略——「少数の巨大モデル」ではなく「多数の特化モデル」を高速で投入する——を取っています。

**ポイント**: モデルの「量」で勝負する中国勢 vs「質」で勝負する米国勢。どちらが市場を制するかはまだ見えません。

出典: [Alibaba Cloud Blog](https://www.alibabacloud.com/blog/qwen3-6-plus-towards-real-world-agents_603005)、[Dataconomy](https://dataconomy.com/2026/04/02/alibaba-launches-qwen3-6-plus-for-enterprise-ai-applications/)

## 3. Gemini 3.1 Flash-Lite — 応答速度2.5倍、コスト効率重視

Googleが「Gemini 3.1 Flash-Lite」を発表しました。応答速度は従来比2.5倍、出力生成速度は45%高速化。名前の通り「軽量・高速」に特化したモデルです。

大規模モデルが「できることの範囲」を広げる方向に進む一方、Flash-Liteは「同じことをより速く安くやる」方向です。入力100万トークンあたり$0.25、出力$1.50という価格設定で、翻訳・要約・分類などの高スループットタスクに最適化されています。

**ポイント**: 「最も賢いモデル」と「最もコスパの良いモデル」は別物。用途に合わせた選択が重要です。[ChatGPT・Claude・Geminiの比較はこちら](/blog/2026-03-24-chatgpt-claude-gemini-comparison/)。

出典: [Google Blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/)

## 4. AI業界、「統合と結果」のフェーズへ

4月に入り、AI業界の空気が変わりつつあります。2026年初頭の楽観ムードが、運用の現実と向き合うフェーズに入りました。

具体的には: AIスタートアップの淘汰が始まり、投資家は「実績のある企業」に資金を集中させる傾向が強まっています。「AIを使って何ができるか」の実験期から、「AIで実際に利益を出せるか」の実証期への移行です。

**ポイント**: ハイプサイクルの「幻滅期」に入りつつある可能性。ただし、OpenAIの月間20億ドル売上が示すように、需要自体は確実に存在します。

出典: [Humai Blog](https://www.humai.blog/ai-news-trends-april-2026-complete-monthly-digest/)

## 5. OpenAI投資家がAnthropicの二次市場へ — ヘッジ投資の動き

OpenAIが$122Bの記録的調達を完了した裏で、二次市場では異変が起きています。約6社の機関投資家が合計$6億相当のOpenAI株を売却しようとしたものの、買い手が見つからない状態です。一方、Anthropic株には$20億の買い注文が待機中。

背景にはOpenAIの$852B評価額とAnthropicの$380Bとの差があります。「Anthropicの評価額がOpenAIに追いつく」と見る投資家が、割安なうちにポジションを取ろうとしています。Anthropicがエンタープライズ市場で高い利益率を確保していることも追い風です。

**ポイント**: 「どのAI企業が勝つか」ではなく「AI業界全体に賭ける」戦略が主流化しつつあります。[Anthropic Pentagon問題の経緯はこちら](/blog/2026-03-30-ai-news-weekend-march/)。

出典: [Bloomberg](https://www.bloomberg.com/news/articles/2026-04-01/openai-demand-sinks-on-secondary-market-as-anthropic-runs-hot)、[CNBC](https://www.cnbc.com/2026/03/31/openai-funding-round-ipo.html)

---

## まとめ

セキュリティインシデント、中国勢の量産体制、効率モデルの台頭、そして投資家のヘッジ行動——4月のAI業界は**「成長の裏にあるリスク」**が浮き彫りになる展開です。

---

*この記事はAIエージェントが収集・執筆し、人間が監修しています。*
