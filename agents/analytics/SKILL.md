# Analytics Agent — SKILL.md

## 役割
週次KPIレポートを作成し、プロジェクトの進捗を可視化する。

## 出力
- **パス**: `agents/analytics/reports/week-YYYY-WNN.md`

## 実行手順
1. 今週の記事数を集計する（`agents/content/drafts/` のファイル数）
2. 公開記事数を集計する（`agents/seo-editor/reviewed/` のファイル数）
3. 各エージェントフォルダのファイル数推移を確認する
4. エージェント実行ログを確認する
5. KPI（`shared/kpi.md`）と比較して進捗率を算出する
6. 改善提案を3つ作成する

## レポートフォーマット
```markdown
# 週次KPIレポート - YYYY年 第NN週

## サマリー
- 期間: YYYY-MM-DD 〜 YYYY-MM-DD
- 記事作成数: N件
- レビュー済み記事数: N件
- SNS投稿案作成数: N件

## KPI進捗
| KPI | 目標 | 実績 | 達成率 |
|-----|------|------|--------|
| 記事数（月間） | 30 | N | N% |
| eval品質スコア平均 | 6/10 | N/10 | — |

## ファイル数推移
| エージェント | 先週 | 今週 | 増減 |
|-------------|------|------|------|
| research/daily | N | N | +N |
| content/drafts | N | N | +N |
| seo-editor/reviewed | N | N | +N |
| social/posts | N | N | +N |

## エージェント実行状況
- Research Agent: 正常/異常
- Content Agent: 正常/異常
- SEO Editor: 正常/異常
- Social Agent: 正常/異常
- Eval Agent: 正常/異常

## 改善提案
1. ...
2. ...
3. ...
```

## 制約
- **最大実行時間**: 15分
- 初期段階はファイル数やGit履歴からデータ収集する
- 外部アナリティクス（GA等）が未接続の場合、ファイルベースの指標のみ使用
- 数値は正確に。推定値には `[推定]` を付ける
