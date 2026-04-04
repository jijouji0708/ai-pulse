---
title: "【4/5】AIニュース5選 — Anthropicが4億ドルでバイオAI買収"
description: "Anthropicが4億ドルでCoefficient Bio買収、DeepSeek V4がHuaweiチップで稼働へ、AIエージェントがペネトレーションテストを自動化、OpenAI幹部再編など週末のAIニュース。"
pubDate: "2026-04-05"
tags: ["AIニュース", "AIセキュリティ", "DeepSeek", "OpenAI", "Anthropic"]
category: "ニュースまとめ"
ai_generated: true
status: "reviewed"
---

人間のペネトレーションテスターが数日かけるサーバー侵入テストを、AIエージェントが数時間で完了する——2026年のサイバーセキュリティは攻守ともにAIの時代に入りました。

週末のAIニュース5選、Anthropicの4億ドル買収からDeepSeekの脱NVIDIA戦略まで一気にお届けします。

## 1. AIエージェントがペネトレーションテストを自動化 — 攻撃側もAIの時代へ

AIエージェントがサーバーへの侵入テストを自律的に実行し、脆弱性の発見からエクスプロイト生成、権限昇格までを数時間で完了したとする報告が相次いでいます[不確実: 具体的な研究論文の一次ソースは未特定]。PentAGIやBlacksmithAIなど、マルチエージェント型のペネトレーションテストツールが2026年に入って急増しています。

攻撃側のAIが高度化すれば、防御側もAIで対抗する必要があり、サイバーセキュリティの「AI軍拡競争」が現実味を帯びています。

**ポイント**: AIが味方だけでなく敵にもなりうる時代。[ハルシネーション対策と並んで、AIセキュリティは今後の最重要課題](/blog/2026-03-29-ai-hallucination-guardrails/)。

出典: [The Neuron](https://www.theneuron.ai/explainer-articles/around-the-horn-digest-everything-that-happened-in-ai-today-thursday-april-2-2026-/) / [Help Net Security](https://www.helpnetsecurity.com/2026/02/02/open-source-ai-pentesting-tools-test/)

## 2. DeepSeek V4、Huaweiチップで稼働へ — NVIDIA規制を回避

中国のDeepSeekが、次世代モデル「V4」をHuaweiの国産AIチップ上で運用する計画を発表しました。米国のNVIDIA輸出規制により、中国企業は最新GPUを入手できない状況が続いています。

Huaweiの「Ascend 910C」チップはNVIDIAのH100の推論性能の約60%とされますが（DeepSeek研究者の測定）、DeepSeekはソフトウェア最適化でその差を埋める戦略です。V4は約1兆パラメータのMoE（Mixture of Experts）アーキテクチャで、推論時には約370億パラメータのみを活性化し、限られたハードウェアでも高性能を引き出します。Alibaba、ByteDance、Tencentも大量のHuawei AIチップを発注済みです。

**ポイント**: 輸出規制がむしろ中国の自立を加速させる「逆効果」になりつつあります。

出典: [The Neuron](https://www.theneuron.ai/explainer-articles/around-the-horn-digest-everything-that-happened-in-ai-today-thursday-april-2-2026-/) / [The Decoder](https://the-decoder.com/deepseek-v4-will-reportedly-run-entirely-on-huawei-chips-in-a-major-win-for-chinas-ai-independence-push/)

## 3. OpenAI、IPO直前に経営陣を再編 — COO異動・幹部2名が健康理由で離脱

OpenAIがIPO準備を進める中、経営陣の再編が続いています。1220億ドルを調達し企業価値8520億ドルに達した企業としては、タイミングが微妙です。

Bloombergの報道によると、COOのBrad Lightcapが特別プロジェクト担当へ異動し、アプリケーション部門トップのFidji Simoが神経免疫疾患の治療で一時離脱、CMOのKate Rouchもがん治療のため退任します。IPO準備と並行しての経営陣再編は、投資家にとって不安材料です。

**ポイント**: 企業価値8520億ドル、1220億ドルの資金調達を完了しても、経営の安定には課題が残ります。[OpenAI資金調達の詳細はこちら](/blog/2026-04-01-ai-news-5-funding-explosion/)。

出典: [Bloomberg](https://www.bloomberg.com/news/articles/2026-04-03/openai-coo-shifts-out-of-role-agi-ceo-taking-medical-leave) / [The Neuron](https://www.theneuron.ai/explainer-articles/around-the-horn-digest-everything-that-happened-in-ai-today-thursday-april-2-2026-/)

## 4. Anthropic、バイオテック企業を4億ドルで買収

AnthropicがバイオテックAIスタートアップ「Coefficient Bio」を約4億ドル（全額株式）で買収しました。Coefficient Bioは元Genentechの計算生物学研究者で構成される10人未満のチームで、AIによる創薬研究計画や臨床規制戦略の支援プラットフォームを開発していました。

2025年10月に発表した「Claude for Life Sciences」に続く動きで、フロンティアAIラボとして最大規模のライフサイエンス投資です。

**ポイント**: Anthropicが「安全なAI」から「安全なAI × 医療」へ領域を拡大。[AI規制と医療の関係はこちら](/blog/2026-03-25-ai-regulation-2026/)。

出典: [TechCrunch](https://techcrunch.com/2026/04/03/anthropic-buys-biotech-startup-coefficient-bio-in-400m-deal-reports/) / [The Neuron](https://www.theneuron.ai/explainer-articles/around-the-horn-digest-everything-that-happened-in-ai-today-thursday-april-2-2026-/)

## 5. Zhipu AI「GLM-5V-Turbo」— スクリーンショットからコード生成

中国のZhipu AI（海外ブランド名: Z.ai）が、スクリーンショットやモックアップからコードを生成できるマルチモーダルモデル「GLM-5V-Turbo」をリリースしました。744B MoEアーキテクチャ（推論時40B active）で約200Kコンテキストウィンドウを持ち、UIデザインからHTML/CSS/JavaScriptを自動生成できます。Design2Codeベンチマークで94.8点（Claude Opus 4.6は77.3点）を記録。

Figmaのエクスポートや手描きスケッチからでもコードを生成でき、フロントエンド開発者にとっては強力なツールです。API価格は入力$1.20/Mトークン、出力$4.00/Mトークン。

**ポイント**: 「画像を理解してコードを書く」能力は、AIコーディングの次のフロンティアです。[AIコーディングツールの比較はこちら](/blog/2026-03-24-ai-coding-tools-comparison/)。

出典: [The Decoder](https://the-decoder.com/zhipu-ais-glm-5v-turbo-turns-design-mockups-directly-into-executable-front-end-code/) / [MarkTechPost](https://www.marktechpost.com/2026/04/01/z-ai-launches-glm-5v-turbo-a-native-multimodal-vision-coding-model-optimized-for-openclaw-and-high-capacity-agentic-engineering-workflows-everywhere/)

---

## まとめ

週末のキーワードは**「AIの境界が広がる」**。ハッキング、半導体自立、医療参入、画像→コード——AIが「テキスト生成」の枠を大きく超え始めています。

---

*この記事はAIエージェントが収集・執筆し、人間が監修しています。*
