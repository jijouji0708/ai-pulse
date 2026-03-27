# UXリサーチ: AI Pulseの「手触り」を最高レベルに引き上げるための技術調査

**レビュアー**: 藤原 ソウタ（技術顧問）
**日付**: 2026-03-26
**対象**: AI Pulse サイトのマイクロインタラクション・アニメーション・質感向上

---

## はじめに

CEO から「手触りをもっと良くしたい」って依頼が来たので、Stripe・Linear・Vercel・Raycast あたりの一線級サイトがどんな技術使ってるかガッツリ調べた。で、今の `global.css` も分析して「何が足りないか」を洗い出してる。

正直に言うと、今の CSS は**土台としてはかなり良い**。デザイントークン、ダークモード、`prefers-reduced-motion` 対応、scroll-driven animation まで入ってる。でも「手触り」って言われると、まだ **表面的なレベル** に留まってるんだよね。Stripe や Linear が持ってる「触ってて気持ちいい」感覚を出すには、もう何段階か上の実装が要る。

---

## 現在の global.css の技術分析

### 今あるもの（良い点）
- デザイントークンの体系（色、スペース、半径、シャドウ）
- ダークモード対応（`prefers-color-scheme`）
- `font-feature-settings: "palt"` — 日本語プロポーショナル詰め
- `word-break: auto-phrase` — 日本語改行の最適化
- グラデーションテキストアニメーション
- スクロールドリブンアニメーション（`animation-timeline: view()`）
- カーソルグローエフェクト
- `prefers-reduced-motion` フォールバック
- ナビリンクのアンダーラインアニメーション

### 足りないもの（技術的ギャップ）

1. **トランジションのイージングが全部 `ease` か `cubic-bezier(0.25, 0.1, 0.25, 1)`** — 自然な物理運動（スプリング）がない
2. **`transition: all` は使ってないけど、個別プロパティの明示が甘い** — Vercel のガイドラインでは `transition: all` 禁止、明示的にプロパティをリストするのが原則
3. **ホバーフィードバックが弱い** — `scale(0.98)` の押下だけ。磁力ボタンやグローフィードバックがない
4. **テクスチャ・質感が皆無** — ノイズグレイン、グラスモーフィズム、いずれもない。背景が「フラット」すぎる
5. **タイポグラフィのダークモード最適化が不十分** — ダークモードでの font-weight 調整、letter-spacing 微調整がない
6. **スクロール体験の深み** — fade-in-up 一択。テキストリビール、スタガードアニメーションがない
7. **ヘッダーにグラスモーフィズムがない** — `backdrop-filter: blur()` 未使用
8. **インタラクティブ要素のフィードバック層が薄い** — フォーカスリング、アクティブ状態のアニメーションが最小限

---

## 発見と提案（優先度付き）

---

### 1. グラスモーフィズム・ヘッダー

**優先度: S**

現状のヘッダーには `backdrop-filter` がない。Vercel、Linear、Raycast、全部やってる。スクロールしたときにコンテンツがヘッダーの下に滑り込む感覚は、サイトの「高級感」を一番手っ取り早く上げる方法。

**実装イメージ:**
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

@media (prefers-color-scheme: dark) {
  .site-header {
    background: rgba(10, 10, 10, 0.72);
  }
}
```

**パフォーマンス**: `backdrop-filter` は GPU コンポジティングを発火させる。ヘッダーだけなら問題ないけど、ページ全体に使うとローエンド端末でバッテリー消耗 + jank が出る。**ヘッダー1箇所に限定**すれば安全。

**AI Pulseへの適用**: ヘッダー固定時にコンテンツが透けて見える感じ。記事読んでるときの没入感が上がる。

---

### 2. スプリングアニメーション（CSS `linear()` タイミング関数）

**優先度: S**

今の CSS は全部 `ease` か固定の `cubic-bezier`。人間の脳は物理法則に沿った動きを「自然」と感じる。スプリング（バネ）物理を使うと、オーバーシュート → 収束のモーションで「生きてる」感じになる。

**実装イメージ:**
```css
:root {
  /* スプリングイージング（linear() で物理ベース曲線をシミュレーション） */
  --ease-spring: linear(
    0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%,
    0.721 25.3%, 0.849 31.5%, 0.937 38.1%,
    0.968 41.8%, 0.991 45.7%, 1.006 50.1%,
    1.015 55%, 1.017 63.9%, 1.001 85.2%, 1
  );
  --ease-bounce: linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141 13.6%,
    0.25, 0.391, 0.563, 0.765, 1, 0.891 40.9%,
    0.848, 0.813, 0.785, 0.766, 0.754, 0.75,
    0.754, 0.766, 0.785, 0.813, 0.848, 0.891,
    0.941, 1 68.2%, 0.973, 0.953, 0.941,
    0.938, 0.941, 0.953, 0.973, 1 86.4%,
    0.988, 0.984, 0.988, 1
  );
}
```

**パフォーマンス**: `linear()` は CSS ネイティブ。JS ライブラリ（Framer Motion: ~30KB, React Spring: ~25KB）不要。パフォーマンスコストはほぼゼロ。ただし Chrome 113+, Safari 17.2+, Firefox 112+ が必要。

**AI Pulseへの適用**: ボタンのホバー、カード出現、モーダルオープンにスプリングイージングを適用。全体的に「ヌルッ」とした気持ちいい動きになる。

---

### 3. ノイズテクスチャ背景（SVG グレインエフェクト）

**優先度: A**

フラットな背景って、どうしても「デジタルっぽく」見える。微かなノイズテクスチャを乗せると、紙やスクリーンの物理的な質感が出る。Stripe のサイトもよく見ると微妙にグレインかかってる。

**実装イメージ:**
```css
.noise-overlay::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  pointer-events: none;
  z-index: 9998;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

**パフォーマンス**: SVG ノイズを data URI でインライン化するので、ネットワークリクエスト0。`opacity: 0.03` 程度なら GPU 負荷もほぼなし。ただし `position: fixed` の要素が増えるので、スクロールパフォーマンスには注意。`will-change: transform` を付けるか、要検証。

**AI Pulseへの適用**: `body` にオーバーレイとして薄いグレインを乗せる。ダークモードだと特に効果的。「安っぽいフラット」から「上質なマット仕上げ」に変わる。

---

### 4. テキストリビールアニメーション（スクロール連動）

**優先度: A**

今の `scroll-reveal` は `fade-in-up` 一択。これだと全部同じ動きで単調になる。テキストがマスクから現れるリビールエフェクトを追加すると、コンテンツの「語りかけてくる」感じが出る。

**実装イメージ:**
```css
@keyframes text-reveal {
  from {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

.text-reveal {
  animation: text-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}

/* スタガード（子要素を順番に表示） */
.stagger-reveal > * {
  animation: fade-in-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 35%;
}
.stagger-reveal > *:nth-child(1) { animation-delay: 0ms; }
.stagger-reveal > *:nth-child(2) { animation-delay: 60ms; }
.stagger-reveal > *:nth-child(3) { animation-delay: 120ms; }
.stagger-reveal > *:nth-child(4) { animation-delay: 180ms; }
```

**パフォーマンス**: `clip-path` は GPU アクセラレーション対象。`animation-timeline: view()` はブラウザネイティブなので JS 不要。ただしスタガードの `animation-delay` は scroll-driven animation と相性が微妙な場合がある。要テスト。

**AI Pulseへの適用**: 記事一覧ページのカード、ヒーローセクションの見出し、About セクションに使う。「ページが生きてる」感覚になる。

---

### 5. ダークモードのグロー＆タイポグラフィ最適化

**優先度: A**

今のダークモードは色を反転してるだけ。でも光学的に、ダークモードでは明るいテキストが「細く」見えるんだよね。あと、アクセントカラーにグローを足すと「発光体っぽい」高級感が出る。

**実装イメージ:**
```css
@media (prefers-color-scheme: dark) {
  body {
    /* ダークモードでのテキスト最適化 */
    -webkit-font-smoothing: auto; /* antialiased だとダークで細く見えすぎる */
    letter-spacing: 0.025em; /* 少し広げて可読性UP */
  }

  h1, h2, h3 {
    font-weight: 800; /* ダークでは1段階太く */
  }

  /* アクセントカラーのグローエフェクト */
  .glow-accent {
    text-shadow: 0 0 20px rgba(132, 140, 208, 0.3),
                 0 0 40px rgba(132, 140, 208, 0.15);
  }

  /* ボタンのグロー */
  .cta-primary {
    box-shadow: 0 0 20px rgba(132, 140, 208, 0.25),
                0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* カードのホバーグロー */
  .card:hover {
    box-shadow: 0 0 30px rgba(132, 140, 208, 0.12),
                0 4px 16px rgba(0, 0, 0, 0.4);
    border-color: rgba(132, 140, 208, 0.2);
  }
}
```

**パフォーマンス**: `text-shadow` と `box-shadow` はリペイントのみでリフローは発生しない。ホバー時だけなら問題なし。ただし `text-shadow` を全テキストに適用するのはNG（パフォーマンス悪化）。見出しとアクセント要素に限定する。

**AI Pulseへの適用**: ダークモードで読んでるときの「プレミアム感」が格段に上がる。Linear やRaycast がやってるあの感じ。

---

### 6. マグネティックボタン

**優先度: B**

カーソルを近づけるとボタンが「吸い寄せられる」エフェクト。Stripe とか Vercel の CTA でよく見る。CSS だけだと hover の `transform` 程度、本格的にやるなら JS で `mousemove` のイベントリスナーが要る。

**実装イメージ（CSS + 軽量JS）:**
```css
.magnetic-btn {
  transition: transform 0.4s var(--ease-spring);
  will-change: transform;
}
```

```javascript
// 軽量版: ~15行
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    btn.style.transform = `translate(${x}px, ${y}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});
```

**パフォーマンス**: `mousemove` イベントは高頻度発火するけど、`transform` だけなので GPU で処理される。`requestAnimationFrame` でスロットルすればさらに安全。ポインターデバイスだけに限定（`@media (pointer: fine)`）。

**AI Pulseへの適用**: ヒーローの CTA ボタン、ニュースレター登録ボタンに限定適用。全ボタンにやると逆にうざい。

---

### 7. 日本語タイポグラフィの追加最適化

**優先度: B**

今の CSS は `palt` と `auto-phrase` があって基本は良い。でも、もう少し詰められる。

**追加すべき設定:**
```css
body {
  /* 既存に追加 */
  font-feature-settings: "palt", "kern";
  hanging-punctuation: first allow-end;
  /* 行長の最適化（日本語: 25-35文字） */
}

.prose {
  /* 日本語の最適行長: 25-35文字 × 約16px = 400-560px */
  /* 現在の 680px はちょっと広い。でも英語混在を考えると妥当かも */
  line-height: 1.8; /* 日本語は 1.7 より 1.8 の方が読みやすい */
}

/* 日本語にイタリックは使わない */
.prose em {
  font-style: normal;
  font-weight: 600;
  color: var(--color-accent);
}

/* 見出しの letter-spacing 調整 */
h1, h2, h3 {
  font-feature-settings: "palt";
  letter-spacing: -0.02em; /* 日本語見出しは詰め気味が美しい */
}
```

**パフォーマンス**: CSS のみ。コストゼロ。

**AI Pulseへの適用**: 記事の可読性が上がる。特に `.prose` の `line-height: 1.8` はすぐ試す価値がある。`em` のスタイル変更は日本語特有の問題を解決する（イタリック体の日本語は読みにくい）。

---

### 8. スムーズスクロールの改善

**優先度: B**

今は `scroll-behavior: smooth` と `scroll-padding-top` がある。これは基本OK。でも `prefers-reduced-motion` のときに `scroll-behavior` を off にしてない。

**追加すべき設定:**
```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

**パフォーマンス**: なし。アクセシビリティ改善。

**AI Pulseへの適用**: 前庭障害のあるユーザーへの配慮。小さいけど大事。

---

### 9. インタラクティブフィードバックの強化

**優先度: B**

ボタンの `:active` が `scale(0.98)` だけ。もう少し「押した感」が欲しい。

**追加イメージ:**
```css
.cta-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.cta-primary:active {
  transform: translateY(0) scale(0.98);
  box-shadow: var(--shadow-sm);
  transition-duration: 50ms; /* 押下は瞬時 */
}

/* フォーカスリングのカスタマイズ */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* リンクのホバー — アンダーラインのアニメーション */
.prose a {
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s ease;
}
.prose a:hover {
  text-decoration-color: var(--color-accent);
}
```

**パフォーマンス**: CSS のみ。コストゼロ。

**AI Pulseへの適用**: 全体的な「レスポンシブ感」が上がる。ユーザーが「このサイト、ちゃんと反応してくれる」と感じる。

---

### 10. ハプティクスフィードバック（モバイル）

**優先度: C**

Vibration API を使ってモバイルでの触覚フィードバック。ボタンタップ時に微振動を返す。

**実装イメージ:**
```javascript
// プリセット
const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(20),
  success: () => navigator.vibrate?.([10, 50, 20]),
};
```

**パフォーマンス**: API コール自体は軽量。ただしブラウザ対応がまちまち（Safari は非対応）。

**AI Pulseへの適用**: 正直、ブログサイトにここまで要るかは疑問。ニュースレター登録完了時の success フィードバック程度なら面白いかも。でも今やることじゃない。

---

## 優先度サマリー

| 優先度 | 項目 | 工数 | 効果 |
|--------|------|------|------|
| **S** | グラスモーフィズム・ヘッダー | 小 | 即効性あり。高級感が一気に上がる |
| **S** | スプリングイージング（`linear()`） | 小 | 全トランジションの質が上がる。コストゼロ |
| **A** | ノイズテクスチャ背景 | 小 | 質感の底上げ。特にダークモードで効果大 |
| **A** | テキストリビールアニメーション | 中 | スクロール体験の差別化 |
| **A** | ダークモード グロー＆タイポ最適化 | 小 | ダークモードユーザーの満足度直結 |
| **B** | マグネティックボタン | 中 | CTA の訴求力UP。ただし JS 必要 |
| **B** | 日本語タイポグラフィ追加最適化 | 小 | 可読性微改善 |
| **B** | スムーズスクロール改善 | 極小 | アクセシビリティ |
| **B** | インタラクティブフィードバック強化 | 小 | 全体の手触り向上 |
| **C** | ハプティクスフィードバック | 中 | 時期尚早。Safari 非対応 |

---

## 俺の結論

**S ランクの2つ（グラスモーフィズムヘッダー + スプリングイージング）は今すぐやっていい。**工数が小さくて効果がデカい。この2つだけで「あ、このサイトちゃんと作ってるな」って印象が変わる。

A ランクのノイズテクスチャとダークモード最適化も、CSS だけで完結するからサクッと入れられる。テキストリビールはちょっとテストが要るけど、スクロール体験の質を大きく上げる。

マグネティックボタンは面白いけど、JS が要るし、やりすぎると「うざい」になる。CTA に1-2箇所だけ、が正解。

ハプティクスは忘れていい。ブログサイトに振動フィードバックとか、完全にオーバーエンジニアリング。

あと1つ気になったのが、**Vercel のデザインガイドラインの原則**。彼らは「CSS > Web Animations API > JS ライブラリ」の優先順位を明文化してる。AI Pulse もこの方針でいくべき。今の CSS ベースのアプローチは正しい方向。Framer Motion とか入れたくなる気持ちはわかるけど、30KB のバンドルサイズ増加に見合う価値があるかは疑問。`linear()` でスプリングアニメーションが CSS ネイティブでできる今、JS ライブラリの必要性は下がってる。

---

## 参考リンク

- [Stripe - Connect Front-End Experience](https://stripe.com/blog/connect-front-end-experience)
- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- [Vercel Geist Design System](https://vercel.com/geist/introduction)
- [Linear - Behind the Latest Design Refresh](https://linear.app/now/behind-the-latest-design-refresh)
- [Josh W. Comeau - Springs and Bounces in Native CSS](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [Josh W. Comeau - Next-level Frosted Glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/)
- [Motion.dev - CSS Spring Animation](https://motion.dev/docs/css)
- [CSS-Tricks - Grainy Gradients](https://css-tricks.com/grainy-gradients/)
- [MDN - Scroll Progress Animations in CSS](https://developer.mozilla.org/en-US/blog/scroll-progress-animations-in-css/)
- [Codrops - Magnetic Buttons](https://tympanus.net/codrops/2020/08/05/magnetic-buttons/)
- [Seven Rules for Perfect Japanese Typography](https://www.aqworks.com/blog/perfect-japanese-typography)
- [CSS-Tricks - Dark Mode on the Web](https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/)
- [ibelick - Creating Grainy Backgrounds with CSS](https://ibelick.com/blog/create-grainy-backgrounds-with-css)
- [Glass UI - Glassmorphism CSS Generator](https://ui.glass/generator)
- [Prismic - CSS Scroll Effects: 50 Interactive Animations](https://prismic.io/blog/css-scroll-effects)
