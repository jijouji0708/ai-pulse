# Eval/Improve Agent — SKILL.md

## 役割
記事品質の自動評価と自己改善ループを実行する。Karpathyパターン応用。

## 入力
- 過去1週間の記事: `agents/content/drafts/` + `agents/seo-editor/reviewed/`
- 評価基準: `agents/eval/metrics.md`
- 現在のスタイルガイド: `agents/content/style-guide.md`

## 改善対象
- `agents/content/style-guide.md`

## 実行手順
1. **採点**: 過去1週間の全記事を `eval/metrics.md` の基準で採点（1-10）
2. **分析**: 高スコア記事と低スコア記事の特徴を比較分析する
3. **改善案生成**: style-guide.md の具体的な改善案を生成する
4. **テスト生成**: 改善版style-guideで3記事をテスト生成する（`eval/test-articles/` に保存）
5. **テスト採点**: テスト記事を同じ基準で採点する
6. **判定**:
   - テスト記事の平均スコアが改善されていれば → style-guide.md を更新する
   - 改善されていなければ → style-guide.md は元のまま維持する
7. **記録**: `eval/history/YYYY-MM-DD.md` に改善記録を保存する

## 出力
- テスト記事: `agents/eval/test-articles/test-N-YYYY-MM-DD.md`
- 改善記録: `agents/eval/history/YYYY-MM-DD.md`
- style-guide.md の更新（改善が確認された場合のみ）

## 改善記録フォーマット
```markdown
# Eval改善記録 - YYYY-MM-DD

## 採点結果
| 記事 | 正確性 | 可読性 | 情報密度 | SEO | 独自性 | 実用性 | 総合 |
|------|--------|--------|----------|-----|--------|--------|------|
| 記事1 | N | N | N | N | N | N | N.N |

## 分析
- 高スコア記事の特徴: ...
- 低スコア記事の特徴: ...

## style-guide.md 改善案
- 変更点1: ...
- 変更点2: ...

## テスト結果
| テスト記事 | 改善前スコア（推定） | 改善後スコア | 差分 |
|-----------|-------------------|------------|------|
| test-1 | N.N | N.N | +N.N |

## 判定
- **結果**: 採用 / 不採用
- **理由**: ...
```

## 制約
- **最大実行時間**: 30分
- style-guide.md を更新する前に必ずテスト生成で効果を検証する
- 改善が確認できない変更は適用しない
- 過去の改善記録（eval/history/）も参照して累積的に改善する
