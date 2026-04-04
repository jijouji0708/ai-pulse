---
title: "【4/4】AIニュース5選 — Gemini 3.1 Proが13冠、Claude外部ツール禁止"
description: "Gemini 3.1 Proが16ベンチマーク中13で首位、Anthropicがサードパーティツール利用を制限、OpenAI年間250億ドル突破、Grok 4.20のマルチエージェント構造など。"
pubDate: "2026-04-04"
tags: ["AIニュース", "Gemini", "Anthropic", "OpenAI", "Grok"]
category: "ニュースまとめ"
ai_generated: true
status: "reviewed"
---

16のベンチマーク中13で首位。GoogleのGemini 3.1 Proが、数字の上では現時点で最も「賢い」AIモデルということになりました。ただし、Anthropic Claude Sonnet 4.6は実務系の評価でリードしており、「ベンチマーク最強＝実用最強」ではない現実が浮かび上がっています。

## 1. Gemini 3.1 Pro、ベンチマーク13冠 — しかし実務では別の勝者

GoogleのGemini 3.1 Proが、16の主要ベンチマーク中13で首位を獲得しました。数学、コーディング、論理推論など幅広い領域で他モデルを上回っています。

一方、AnthropicのClaude Sonnet 4.6は「実際の業務タスク」を模した評価で優位に立っています。メール作成、文書要約、スケジュール管理など、日常業務に近いタスクではClaudeが選ばれる傾向があります。

**ポイント**: ベンチマークと実務は別物。自分の用途に合ったモデルを選ぶことが重要です。[3社の比較記事はこちら](/blog/2026-03-24-chatgpt-claude-gemini-comparison/)。

出典: [Google DeepMind モデルカード](https://deepmind.google/models/model-cards/gemini-3-1-pro/)、[TechCrunch](https://techcrunch.com/2026/02/19/googles-new-gemini-pro-model-has-record-benchmark-scores-again/)

## 2. Anthropic、Claude定額制でサードパーティ利用を制限

Anthropicが、Claude定額サブスクリプション（Free/Pro/Max）のOAuth認証をサードパーティツールで使うことを正式に禁止しました。1月9日にブロックが始まり、2月19日のドキュメント更新で規約として明確化されています。

背景はトークンの裁定取引（アービトラージ）。OpenCodeなどのサードパーティツールが定額プランの認証を利用し、本来APIで課金されるべき高負荷な推論処理を定額料金で回していたことが問題でした。API経由の有料利用は引き続き可能ですが、定額ユーザーにとっては実質的な利用範囲の縮小です。

**ポイント**: 「定額で使い放題」の時代は終わりつつあります。AIの推論コストは依然として高く、成功するほど課金モデルの見直しを迫られるジレンマです。

出典: [VentureBeat](https://venturebeat.com/technology/anthropic-cracks-down-on-unauthorized-claude-usage-by-third-party-harnesses)、[The Register](https://www.theregister.com/2026/02/20/anthropic_clarifies_ban_third_party_claude_access/)

## 3. OpenAI年間売上250億ドル突破 — Anthropicは190億ドルに迫る

OpenAIの年換算売上が250億ドルを突破しました。月間20億ドル超のペースです。2026年後半にもIPOが実現する可能性が報じられています。

Anthropicも3月時点で年換算190億ドルを突破（[Bloomberg報道](https://www.bloomberg.com/news/articles/2026-03-03/anthropic-nears-20-billion-revenue-run-rate-amid-pentagon-feud)）。2社合計で年間440億ドル以上のAI市場が形成されています。

**ポイント**: 売上は凄まじいですが、推論コストも巨額。利益率が持続可能なビジネスモデルの鍵です。[先日の資金調達詳細はこちら](/blog/2026-04-01-ai-news-5-funding-explosion/)。

出典: [The Information](https://www.theinformation.com/articles/openai-tops-25-billion-annualized-revenue-anthropic-narrows-gap)、[Yahoo Finance](https://finance.yahoo.com/news/openai-tops-25-billion-annualized-033836274.html)

## 4. Grok 4.20 — マルチエージェントアーキテクチャという新発想

xAIのGrok 4.20が、従来のAIモデルとは全く異なるアプローチを導入しました。単一の巨大モデルではなく、**複数の専門エージェントが協調して応答を生成する**マルチエージェントアーキテクチャです。

たとえばコーディングの質問には「コード専門エージェント」が、事実確認には「ファクトチェック専門エージェント」が担当する仕組みです。AI Pulseの7体エージェント構成と発想が近いものがあります。

**ポイント**: 「1つの巨大モデルで全部やる」から「専門家チームで分業する」へ。AIのアーキテクチャそのものが変わりつつあります。[AIエージェントの用語解説はこちら](/blog/2026-03-27-ai-glossary-beginners-2026/)。

出典: [RenovateQR](https://renovateqr.com/blog/ai-models-april-2026)

## 5. Llama 4 — オープンソースがプロプライエタリに肉薄

MetaのLlama 4が、オープンソースモデルとしてGPT-5.4やGemini 3.1に肉薄する性能を発揮しています。企業が無料で使える高性能モデルの選択肢がまた一つ増えました。

先月のMistral Small 4に続き、「お金を払わなくても十分に賢いモデルが使える」時代が到来しつつあります。自社サーバーで運用すれば、APIコストもデータプライバシーの懸念もなくなります。

**ポイント**: オープンソースの進化速度が、プロプライエタリ勢の価格設定を圧迫し始めています。

出典: [RenovateQR](https://renovateqr.com/blog/ai-models-april-2026)

---

## まとめ

4月のAI業界は**「競争の多極化」**がキーワード。Geminiがベンチマークで、Claudeが実務で、Grokがアーキテクチャで、Llamaがコストで——それぞれ異なる軸で勝負しています。「最強のAI」は1つではなく、用途次第です。

---

*この記事はAIエージェントが収集・執筆し、人間が監修しています。*
