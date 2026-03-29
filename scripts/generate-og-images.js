/**
 * OG画像生成スクリプト
 *
 * 全ブログ記事のOGP画像を生成し、site/public/og/ に保存する。
 * 使用: node scripts/generate-og-images.js
 *
 * 依存: satori, @resvg/resvg-js, sharp (site/node_modules)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.join(__dirname, '..', 'site');
const BLOG_DIR = path.join(SITE_DIR, 'src', 'content', 'blog');
const OUTPUT_DIR = path.join(SITE_DIR, 'public', 'og');
const FONT_PATH = path.join(__dirname, 'fonts', 'NotoSansJP-Bold.ttf');

// Dynamic import from site/node_modules
const satori = (await import(path.join(SITE_DIR, 'node_modules', 'satori', 'dist', 'index.js'))).default;
const { Resvg } = await import(path.join(SITE_DIR, 'node_modules', '@resvg', 'resvg-js', 'index.js'));

// --- Configuration ---
const WIDTH = 1200;
const HEIGHT = 630;

// カテゴリをtagsから推定する
function detectCategory(tags) {
  if (!tags || tags.length === 0) return 'AI';
  const first = tags[0];
  if (first.includes('ニュース')) return 'ニュースまとめ';
  if (first.includes('解説') || first.includes('入門') || first.includes('初心者')) return '解説・入門';
  if (first.includes('比較')) return '比較レビュー';
  if (first.includes('事例') || first.includes('ビジネス')) return 'ビジネス';
  if (first.includes('規制') || first.includes('法律')) return '規制・政策';
  return first.length > 8 ? 'AI' : first;
}

// フロントマターをパース
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  const lines = match[1].split('\n');
  for (const line of lines) {
    const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
    if (kv) {
      fm[kv[1]] = kv[2];
    }
    // tags配列のパース
    const tagMatch = line.match(/^tags:\s*\[(.+)\]/);
    if (tagMatch) {
      fm.tags = tagMatch[1].split(',').map(t => t.trim().replace(/"/g, ''));
    }
  }
  return fm;
}

// タイトルを行分割（1行あたり最大文字数）
function wrapTitle(title, maxCharsPerLine = 18) {
  const lines = [];
  let remaining = title;
  while (remaining.length > maxCharsPerLine) {
    // 自然な区切りを探す
    let breakPoint = maxCharsPerLine;
    const punctuations = ['、', '。', '！', '？', '—', '：', ' ', '｜', '」', '』'];
    for (let i = maxCharsPerLine; i >= maxCharsPerLine - 5 && i > 0; i--) {
      if (punctuations.includes(remaining[i])) {
        breakPoint = i + 1;
        break;
      }
    }
    lines.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint);
  }
  if (remaining) lines.push(remaining);
  return lines.slice(0, 3); // 最大3行
}

// satori用のVNode（JSX互換オブジェクト）を生成
function buildOgImage(title, category, date) {
  const titleLines = wrapTitle(title);

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 70px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        fontFamily: 'Noto Sans JP',
      },
      children: [
        // 上部: カテゴリバッジ
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontSize: '22px',
                    fontWeight: 700,
                  },
                  children: category,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '20px',
                  },
                  children: date,
                },
              },
            ],
          },
        },
        // 中央: タイトル
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              justifyContent: 'center',
            },
            children: titleLines.map(line => ({
              type: 'div',
              props: {
                style: {
                  color: '#ffffff',
                  fontSize: titleLines.length > 2 ? '42px' : '48px',
                  fontWeight: 700,
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                },
                children: line,
              },
            })),
          },
        },
        // 下部: ロゴ + サイト名
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    // パルスアイコン（CSSで表現）
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        },
                        children: '',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          color: '#ffffff',
                          fontSize: '28px',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                        },
                        children: 'AI Pulse',
                      },
                    },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '18px',
                  },
                  children: 'ai-pulse.dev',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// --- Main ---
async function main() {
  // フォント読み込み
  const fontData = fs.readFileSync(FONT_PATH);

  // 出力ディレクトリ
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // 記事一覧を取得
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  console.log(`${files.length} 件の記事を処理します...`);

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.(md|mdx)$/, '');
    const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

    // 既存ファイルがあればスキップ（--force オプションで再生成）
    if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
      skipped++;
      continue;
    }

    const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm || !fm.title) {
      console.warn(`  スキップ: ${file} (フロントマターなし)`);
      continue;
    }

    const category = detectCategory(fm.tags);
    const date = fm.pubDate || '';

    const vnode = buildOgImage(fm.title, category, date);

    // SVG生成
    const svg = await satori(vnode, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    });

    // SVG → PNG
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    fs.writeFileSync(outputPath, pngBuffer);
    generated++;
    console.log(`  生成: ${slug}.png`);
  }

  console.log(`\n完了: ${generated} 件生成, ${skipped} 件スキップ`);
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
