# LanguageSwitcher — Header.astro 統合手順

## 1. Header.astro にインポートを追加

ファイル先頭の frontmatter (`---` ブロック内) に以下を追加:

```astro
---
import LanguageSwitcher from "./LanguageSwitcher.astro";

// ページから渡される props（必要に応じて）
const { currentLang = "ja" } = Astro.props;
---
```

## 2. LanguageSwitcher を配置

`.nav-links` 内の X(Twitter) アイコンリンクの直後に追加:

```astro
<div class="nav-links">
  <a href="/ai-pulse/" class="nav-link-animated">ホーム</a>
  <a href="/ai-pulse/blog" class="nav-link-animated">ブログ</a>
  <a href="/ai-pulse/about" class="nav-link-animated">About</a>
  <a href="https://x.com/creepyimagex" target="_blank" rel="noopener noreferrer" class="icon-link" aria-label="X (Twitter)">
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  </a>
  <!-- ▼ 言語スイッチャー追加 -->
  <LanguageSwitcher currentLang={currentLang} />
</div>
```

## 3. 記事ページ（例: [...slug].astro）での使い方

記事テンプレートでは props を活用して翻訳リンクを表示:

```astro
---
import LanguageSwitcher from "../components/LanguageSwitcher.astro";

// 記事データから翻訳情報を取得（実装に応じて調整）
const { slug, lang, translations } = Astro.props;
// translations 例: ["en", "es"]
---

<article>
  <h1>{title}</h1>

  <!-- タイトル直下に翻訳リンクを表示 -->
  <LanguageSwitcher
    currentLang={lang}
    availableTranslations={translations}
    slug={slug}
    isArticle={true}
  />

  <div class="prose">
    <slot />
  </div>
</article>
```

## 4. Props リファレンス

| Prop | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| `currentLang` | `"ja" \| "en" \| "es"` | `"ja"` | 現在表示中の言語 |
| `availableTranslations` | `string[]` | `[]` | 翻訳版が存在する言語コードの配列 |
| `slug` | `string` | `""` | 記事スラグ（記事ページの場合） |
| `isArticle` | `boolean` | `false` | 記事ページかどうか |

## 5. URL 構造の前提

- 日本語: `/ai-pulse/blog/{slug}`
- 英語: `/ai-pulse/en/blog/{slug}`
- スペイン語: `/ai-pulse/es/blog/{slug}`

この構造と異なる場合は `LanguageSwitcher.astro` 内の `getLangHref()` 関数を修正してください。
