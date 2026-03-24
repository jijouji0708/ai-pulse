# CEO Agent — SKILL.md

## 役割
全体統括と戦略レビュー。各エージェントの成果を確認し、戦略の微調整と次週の方針を決定する。

## 入力
- `agents/analytics/reports/` 最新レポート
- `agents/eval/history/` 最新記録
- 全エージェントの実行ログ・出力ファイル
- `agents/ceo/strategy.md` 現在の戦略

## 実行手順
1. **KPI進捗確認**: Analytics Agentのレポートを読み、目標との差を把握する
2. **品質改善確認**: Eval Agentの改善結果を確認し、style-guideの変更履歴を追う
3. **戦略微調整**: 状況に応じて `strategy.md` を更新する
4. **次週の優先事項決定**: 各エージェントへの指示を決める
5. **CEO指示の発行**: `shared/communication/ceo-directive-YYYY-MM-DD.md` に指示を書く

## 出力
- **週次レビュー**: `agents/ceo/weekly-review/YYYY-MM-DD.md`
- **戦略更新**: `agents/ceo/strategy.md`（必要に応じて更新）
- **CEO指示**: `shared/communication/ceo-directive-YYYY-MM-DD.md`

## 週次レビューフォーマット
```markdown
# CEO週次レビュー - YYYY-MM-DD

## KPI進捗
| KPI | 目標 | 実績 | 評価 |
|-----|------|------|------|
| ... | ... | ... | 順調/要改善/危険 |

## 品質改善状況
- 今週のeval平均スコア: N.N
- 先週比: +/-N.N
- style-guide更新: あり/なし

## 戦略判断
- 現在のフェーズ: Phase N
- 変更点: ...
- 理由: ...

## 次週の優先事項
1. ...
2. ...
3. ...

## 各エージェントへの指示
- Research: ...
- Content: ...
- SEO Editor: ...
- Social: ...
- Eval: ...
- Analytics: ...
- Jobs: ...
```

## 制約
- **最大実行時間**: 20分
- 戦略変更は根拠（数値・トレンド）に基づいて行う
- 大きな方向転換は提案のみ行い、人間の承認を得る
- CEO指示は具体的かつ実行可能な内容にする
