# AI Pulse — プロジェクト共有設定

> 全エージェントが参照する共通設定ファイル

## 基本情報
- **プロジェクト名**: AI Pulse
- **言語**: 日本語
- **ドメイン**: （未設定）
- **開始日**: 2026-03-24

## プラットフォーム
- **ニュースレター**: Buttondown
- **SNS**: X（@creepyimagex）— noteプロジェクトと共用
- **ブログ**: GitHub Pages（ai-pulse リポジトリ）
- **note**: じょうじ — noteプロジェクトと共用

## 連絡先・アカウント
- **X**: @creepyimagex（じょうじ）
- **note**: じょうじ
- **アイコン**: noteプロジェクトと統一（AI生成女性アイコン）

## noteプロジェクトとの連携
- X投稿はnoteプロジェクトのSNS Managerと共用
- AI Pulseの記事をXで告知する際はnoteの投稿ルール（初速30分ルール等）に従う
- プロフィール文はnoteプロジェクトと統一

## エージェント構成
| エージェント | 役割 | 最大実行時間 |
|-------------|------|-------------|
| Research | AI/Techニュース収集 | 15分 |
| Content | 記事執筆 | 30分 |
| SEO Editor | 校正・ファクトチェック・SEO | 10分 |
| Social | X投稿文生成 | 10分 |
| Analytics | 週次KPIレポート | 15分 |
| Eval | 品質評価・自己改善 | 30分 |
| CEO | 全体統括・戦略 | 20分 |
| Jobs | 案件モニタリング | 10分 |

## パイプライン
```
Research → Content → SEO Editor → Social
                                → Analytics (週次)
                                → Eval (週次)
                                → CEO (週次)
Jobs (随時)
```
