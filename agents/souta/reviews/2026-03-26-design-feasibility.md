# AI Pulse ブログ「遊び心」UI演出 — 技術フィージビリティレポート

**作成者**: 藤原ソウタ（技術顧問）
**日付**: 2026-03-26
**ステータス**: 提案（CEO承認待ち）

---

## はじめに

CEO から「ブログに遊び心を足したい」って話があったので、技術的に実現可能なUI演出をリサーチした。結論から言うと、**CSSだけでかなりいい線いける**。ただし「映える」と「軽い」は常にトレードオフなので、優先度つけて段階的に入れるのがいいと思う。

制約の再確認:
- Astro + GitHub Pages（静的サイト、SSRなし）
- CSSとバニラJSのみ（React不使用）
- Core Web Vitals 死守（LCP / CLS / INP）
- ダークモード必須
- モバイル対応必須
- フォント: Noto Sans JP

---

## 提案一覧（優先度順）

### 1. ダークモード切り替えアニメーション
**優先度: S（最優先）** — ダークモード対応するなら、切り替え自体を演出にできる

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only（CSS Variables + transition） |
| パフォーマンス影響 | ほぼゼロ。`transition: background-color 0.4s ease, color 0.3s ease` だけ |
| バンドルサイズ増加 | 0KB（CSSのみ） |
| モバイル挙動 | 問題なし |
| ダークモード対応 | これ自体がダークモード機能 |
| 実装時間 | 1-2時間 |

**具体的な実装:**
```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --accent: #6366f1;
}

[data-theme="dark"] {
  --bg: #0f0f0f;
  --text: #e5e5e5;
  --accent: #818cf8;
}

body {
  background-color: var(--bg);
  color: var(--text);
  transition: background-color 0.4s ease, color 0.3s ease;
}
```

**発展形**: View Transition API を使えば、切り替え時にページ全体のクロスフェードや円形ワイプも可能。ただし Safari のサポート状況を要確認。`document.startViewTransition()` で before/after のスナップショットを撮ってアニメーションする仕組み。

**ソウタの見解**: これは「遊び心」以前にUXの基本だと思う。カクッと色が変わるより、ふわっと変わるほうが明らかに気持ちいい。工数もほぼゼロだし最初にやるべき。

---

### 2. スクロール連動アニメーション（CSS Scroll-Driven Animations）
**優先度: A** — 2026年のトレンド本命。記事の読み体験が大きく変わる

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only（`animation-timeline: view()`） |
| パフォーマンス影響 | 極めて低い。**コンポジターで動く**のでメインスレッド非占有 |
| バンドルサイズ増加 | 0KB（CSSのみ） |
| モバイル挙動 | 良好（GPU加速） |
| ダークモード対応 | 影響なし（色は CSS Variables で管理） |
| 実装時間 | 3-5時間 |

**ブラウザサポート（2026年3月時点）:**
- Chrome 115+: OK
- Edge 115+: OK
- Safari 26+: OK（Safari 26 で正式対応。Interop 2026 の対象にも入ってる）
- Firefox: ポリフィル必要（ただし Interop 2026 で改善中）

**具体的な使い方:**
```css
/* 記事カードがビューポートに入ったらフェードイン */
.article-card {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**ポイント:**
- `transform` と `opacity` のみ使用 → GPU アクセラレーション確定
- JS ゼロで IntersectionObserver 相当のことができる
- Firefox 向けには `animation-duration: 1ms` のフォールバックで最低限動く

**ソウタの見解**: これはマジで革命的なんだよね。今まで IntersectionObserver + JS で書いてたスクロールアニメーションが CSS だけでできる。しかもコンポジタースレッドで動くから、JS の方式より**理論上パフォーマンスが良い**。Safari 26 で対応したのがデカい。Firefox だけがまだだけど、Interop 2026 の対象だから年内には揃うんじゃないかな。Progressive enhancement で入れるのが正解。

---

### 3. マイクロインタラクション（ホバー・クリック）
**優先度: A** — 小さいけど効果大。「手触り感」の本丸

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only（transition + transform） |
| パフォーマンス影響 | ほぼゼロ |
| バンドルサイズ増加 | 0KB |
| モバイル挙動 | ホバーは非適用（`@media (hover: hover)` で制御）、タップフィードバックは `:active` で |
| ダークモード対応 | 色だけ変数で切り替えれば OK |
| 実装時間 | 2-3時間 |

**具体例:**

```css
/* 記事カードのホバー: 浮き上がり + 影 */
.article-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (hover: hover) {
  .article-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
}

/* ボタンのクリック: 押し込み */
.btn:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}

/* リンクのホバー: 下線アニメーション */
.content a {
  text-decoration: none;
  background-image: linear-gradient(var(--accent), var(--accent));
  background-size: 0% 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}

.content a:hover {
  background-size: 100% 2px;
}
```

**タイミングの黄金ルール**: 200-500ms。これより短いと気づかない、長いとモッサリ。

**ソウタの見解**: Vercel のデザインガイドラインでも「CSS > Web Animations API > JS ライブラリ」の優先順位を明示してる。`transform` と `opacity` だけで表現できるマイクロインタラクションは、GPUアクセラレーションが効くからパフォーマンスへの影響がほぼゼロ。やらない理由がない。

---

### 4. Vercel風グラデーションテキスト
**優先度: B** — ヒーローセクションに映える

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only |
| パフォーマンス影響 | 低い（静的グラデーション）〜 中（アニメーション付き） |
| バンドルサイズ増加 | 0KB |
| モバイル挙動 | 問題なし |
| ダークモード対応 | グラデーション色を CSS Variables で切り替え |
| 実装時間 | 1-2時間 |

**実装:**
```css
.hero-title {
  background: linear-gradient(90deg, var(--accent), #ec4899, var(--accent));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 8s linear infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
```

**注意**: `background-clip: text` はコンポジターで動かないので、ページ内に大量に配置するのはNG。ヒーローの見出し1箇所に限定すべき。

**ソウタの見解**: Vercel がやってて有名だけど、仕組みは意外とシンプル。`linear-gradient` + `background-clip: text` + `animation` だけ。ただし `background-position` のアニメーションはリペイントが走るから、使い所は限定したほうがいい。ヒーローの h1 だけなら問題ない。

---

### 5. グラスモーフィズム（カード・ナビゲーション）
**優先度: B** — 今っぽさが出る。ただしパフォーマンスに注意

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only（`backdrop-filter`） |
| パフォーマンス影響 | **中〜高**。要注意 |
| バンドルサイズ増加 | 0KB |
| モバイル挙動 | ローエンド端末で blur が重い可能性 |
| ダークモード対応 | 中難度（暗い背景だとブラー効果が見えにくい → rgba の調整必要） |
| 実装時間 | 3-4時間 |

**実装:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
}

[data-theme="dark"] .glass-card {
  background: rgba(17, 25, 40, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

**パフォーマンスの懸念:**
- `backdrop-filter` は GPU アクセラレーションされるが、**レンダリングパスが増える**
- 大きな要素に blur をかけると重い（shadcn/ui でも Issue が立ってた）
- テーブルやリストの各行に適用するのは NG
- **ナビゲーションバーやモーダルなど、1-2箇所に限定すべき**

**ソウタの見解**: 正直、グラスモーフィズムは「映えるけどコスト高い」の典型。ナビの `backdrop-filter: blur(8px)` くらいなら全然OK。でも記事カード全部にかけるのは絶対やめたほうがいい。特にモバイルのローエンド端末で60fps維持できなくなるリスクがある。「本当にそう？」って思う人はshadcn/uiのGitHub Issue #327を見てほしい。

---

### 6. CSS `linear()` イージング（バウンス・スプリング）
**優先度: B** — 少しの工夫でアニメーションの質が一段上がる

| 項目 | 内容 |
|------|------|
| 実装方法 | CSS only |
| パフォーマンス影響 | ゼロ（イージング関数の変更だけ） |
| バンドルサイズ増加 | 0KB |
| モバイル挙動 | 問題なし |
| ダークモード対応 | 無関係 |
| 実装時間 | 1時間 |

**実装:**
```css
/* スプリングっぽいバウンス */
.bounce-in {
  transition: transform 0.5s linear(
    0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141, 0.191,
    0.25, 0.316, 0.391, 0.473, 0.562, 0.66, 0.766, 0.879,
    1, 1.091, 1.141, 1.152, 1.127, 1.07, 0.987, 0.886,
    1, 1.023, 1.015, 1, 0.992, 1
  );
}
```

**ソウタの見解**: 今まで JS ライブラリがないとできなかったバウンスやスプリングのイージングが、CSS だけでできるようになった。`linear()` 関数は Chrome 113+、Safari 17.2+、Firefox 112+ で対応済み。Josh W. Comeau が詳しい解説記事を書いてるから参考にするといい。地味だけど、これ入れるだけでアニメーションの「生き物感」が全然違う。

---

### 7. パーティクル背景（Canvas）
**優先度: C** — 見た目のインパクトは大きいがコストも高い

| 項目 | 内容 |
|------|------|
| 実装方法 | Canvas + JS（`requestAnimationFrame`） |
| パフォーマンス影響 | **高い**。パーティクル数に比例 |
| バンドルサイズ増加 | 自作なら 2-5KB / Sparticles.js 使用で約 5KB |
| モバイル挙動 | 要制御（パーティクル数を減らす or 無効化） |
| ダークモード対応 | 色を JS から制御するだけ |
| 実装時間 | 5-8時間（自作） / 2-3時間（ライブラリ） |

**パフォーマンス対策:**
```javascript
// モバイルではパーティクル数を大幅に減らす
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const particleCount = isMobile ? 15 : 50;

// prefers-reduced-motion を尊重する
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) return; // アニメーション無効化

// ページが非表示のときは停止
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelAnimationFrame(rafId);
  else animate();
});
```

**ソウタの見解**: Stripe の mesh gradient は WebGL（minigl）で実装されてて、コード量は約 800 行・10KB くらい。見た目はすごいけど、正直うちのブログにはオーバースペックだと思う。やるなら Canvas で 30-50 個の軽いパーティクルを `requestAnimationFrame` で動かすくらいが適正。ただ、**CSSだけでできる演出を先に全部入れてから検討すべき**。パーティクルはバッテリー消費も気になるしね。

---

### 8. Stripe風メッシュグラデーション背景
**優先度: C** — 圧倒的に映えるが、WebGL必須

| 項目 | 内容 |
|------|------|
| 実装方法 | WebGL（Canvas + GLSL シェーダー） |
| パフォーマンス影響 | 中〜高（GPU依存） |
| バンドルサイズ増加 | 約 10KB |
| モバイル挙動 | 動くが、バッテリー消費大 |
| ダークモード対応 | CSS Variables で色を渡せる設計 |
| 実装時間 | 8-12時間 |

**ソウタの見解**: Stripe のあのグラデーション、CSS で再現しようとすると CPU/RAM を食い過ぎる。だから Stripe は WebGL の minigl を使ってる。うちの規模だと ROI が合わないと思う。CSS の `@keyframes` でグラデーションの `background-position` を動かす簡易版で十分じゃないかな。

---

## 実装しないほうがいいもの

| 演出 | 理由 |
|------|------|
| カスタムカーソル（CSS cursor 置き換え） | モバイルで意味なし。アクセシビリティ問題。パフォーマンスコスト |
| 重い Lottie アニメーション | バンドルサイズ大。Astro の静的サイトの思想に反する |
| スクロールジャック | UX 最悪。Core Web Vitals に悪影響（INP） |
| 大量のパララックスレイヤー | CLS の原因になりやすい。モバイルで挙動が不安定 |

---

## 推奨実装ロードマップ

### Phase 1（今すぐ・1日で完了）— CSS のみ
1. ダークモード切り替えアニメーション（transition）
2. マイクロインタラクション（ホバー、クリック、リンク下線）
3. `linear()` イージングの導入

**工数**: 4-6時間
**バンドルサイズ増加**: 0KB
**パフォーマンス影響**: ほぼゼロ

### Phase 2（1週間以内）— CSS + Progressive Enhancement
4. スクロール連動アニメーション（CSS Scroll-Driven Animations）
5. Vercel 風グラデーションテキスト（ヒーローのみ）
6. ナビゲーションバーのグラスモーフィズム（1箇所のみ）

**工数**: 7-11時間
**バンドルサイズ増加**: 0KB
**パフォーマンス影響**: 低い（グラスモーフィズムだけ注意）

### Phase 3（余裕があれば）— JS 追加
7. 軽量パーティクル背景（Canvas、ヒーローセクションのみ）

**工数**: 5-8時間
**バンドルサイズ増加**: 2-5KB
**パフォーマンス影響**: 中（モバイルでは無効化推奨）

---

## Core Web Vitals への影響まとめ

| 指標 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| LCP | 影響なし | 影響なし | 要検証（Canvas の初期化タイミング） |
| CLS | 影響なし | 影響なし | 影響なし（Canvas は position: fixed） |
| INP | 影響なし | 影響なし | 影響なし |

---

## 必須の安全策

どの演出を入れるにしても、以下は**絶対に入れる**:

```css
/* アクセシビリティ: モーション軽減設定を尊重 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

これがないと、前庭障害のあるユーザーに不快感を与えるリスクがある。アクセシビリティは「あったらいいな」じゃなくて必須。

---

## 結論

**Phase 1 だけでも十分「遊び心」は出せる**。しかもバンドルサイズ増加ゼロ、パフォーマンス影響ゼロ。まずはここから始めて、効果を見てから Phase 2 に進むのが賢いと思う。

2026 年は CSS Scroll-Driven Animations が全ブラウザで揃う年になりそうだから、Phase 2 は時期的にもちょうどいい。Firefox だけポリフィルで凌げばいけるんじゃないかな。

Stripe みたいな WebGL メッシュグラデーションは確かにカッコいいけど、うちの優先順位は「軽い + 読みやすい + SEO 強い」だから、CSS で完結する演出を極めるほうが正解だと思う。

---

## 参考ソース

- [CSS / JS Animation Trends 2026 — WebPeak](https://webpeak.org/blog/css-js-animation-trends/)
- [9 CSS Animation Techniques That Make UIs Feel Alive in 2026 — Medium](https://mohammadtabishanwar9.medium.com/9-css-animation-techniques-that-make-uis-feel-alive-in-2026-a8e48b472488)
- [Mastering CSS Scroll Timeline: A Complete Guide — DEV Community](https://dev.to/softheartengineer/mastering-css-scroll-timeline-a-complete-guide-to-animation-on-scroll-in-2025-3g7p)
- [CSS scroll-driven animations — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [A guide to Scroll-driven Animations with just CSS — WebKit](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- [Announcing Interop 2026 — WebKit](https://webkit.org/blog/17818/announcing-interop-2026/)
- [Vercel Gradient Animation — Kevin Hufnagl](https://kevinhufnagl.com/verceltext-gradient/)
- [Vercel Design Guidelines](https://vercel.com/design/guidelines)
- [How To create the Stripe Website Gradient Effect — Bram.us](https://www.bram.us/2021/10/13/how-to-create-the-stripe-website-gradient-effect/)
- [Dark Glassmorphism: The Aesthetic That Will Define UI in 2026 — Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [Dark Mode Glassmorphism Tips — Alpha Efficiency](https://alphaefficiency.com/dark-mode-glassmorphism)
- [backdrop-filter performance issues — shadcn/ui #327](https://github.com/shadcn-ui/ui/issues/327)
- [Springs and Bounces in Native CSS — Josh W. Comeau](https://www.joshwcomeau.com/animation/linear-timing-function/)
- [Building a Smooth Dark/Light Mode Switch — DEV Community](https://dev.to/web_dev-usman/building-a-smooth-darklight-mode-switch-with-modern-css-features-3jlc)
- [Sparticles.js — GitHub](https://github.com/simeydotme/sparticles)
- [2026 Web Design Trends — Digital Upward](https://www.digitalupward.com/blog/2026-web-design-trends-glassmorphism-micro-animations-ai-magic/)
