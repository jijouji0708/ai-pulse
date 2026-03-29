#!/usr/bin/env node
/**
 * fetch-analytics.js — Google Analytics 4 Data API レポート取得スクリプト
 *
 * AI Pulse プロジェクト用。GA4 Data API を使用してサイトのアクセスデータを取得し、
 * Markdown形式のレポートを出力する。
 *
 * ============================================================
 * セットアップ手順（初回のみ）
 * ============================================================
 * 1. Google Cloud Console でプロジェクトを作成
 * 2. 「Google Analytics Data API」を有効化
 * 3. サービスアカウントを作成し、JSONキーをダウンロード
 * 4. GA4 管理画面でサービスアカウントのメールアドレスに「閲覧者」権限を付与
 * 5. 以下の環境変数を設定:
 *    - GA4_PROPERTY_ID: GA4プロパティID（数字のみ。例: 123456789）
 *    - GOOGLE_APPLICATION_CREDENTIALS: サービスアカウントJSONキーのパス
 *      または
 *    - GA4_CREDENTIALS_PATH: サービスアカウントJSONキーのパス（こちらでもOK）
 *
 * 詳細は ANALYTICS_SETUP.md を参照。
 *
 * ============================================================
 * 使い方
 * ============================================================
 * # 過去7日間のレポート（デフォルト）
 * node scripts/fetch-analytics.js
 *
 * # 過去30日間のレポート
 * node scripts/fetch-analytics.js --days 30
 *
 * # ファイルに保存
 * node scripts/fetch-analytics.js --output agents/analytics/reports/ga-report.md
 *
 * # 過去7日と前の7日を比較
 * node scripts/fetch-analytics.js --compare
 * ============================================================
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 設定
// ---------------------------------------------------------------------------
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GA4_CREDENTIALS_PATH ||
  resolve(PROJECT_ROOT, 'credentials', 'ga4-service-account.json');

// ---------------------------------------------------------------------------
// 引数パース
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { days: 7, output: null, compare: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      opts.days = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = args[i + 1];
      i++;
    } else if (args[i] === '--compare') {
      opts.compare = true;
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// 前提チェック
// ---------------------------------------------------------------------------
function checkPrerequisites() {
  const errors = [];

  if (!GA4_PROPERTY_ID) {
    errors.push(
      '環境変数 GA4_PROPERTY_ID が未設定です。\n' +
        '  GA4 管理画面 → プロパティ設定 → プロパティID をコピーして設定してください。\n' +
        '  例: export GA4_PROPERTY_ID=123456789'
    );
  }

  const credPath = CREDENTIALS_PATH;
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !existsSync(credPath)) {
    errors.push(
      'サービスアカウントの認証情報が見つかりません。\n' +
        '  以下のいずれかを設定してください:\n' +
        '  1. 環境変数 GOOGLE_APPLICATION_CREDENTIALS にJSONキーのパスを設定\n' +
        '  2. 環境変数 GA4_CREDENTIALS_PATH にJSONキーのパスを設定\n' +
        `  3. ${resolve(PROJECT_ROOT, 'credentials', 'ga4-service-account.json')} にファイルを配置\n` +
        '\n' +
        '  セットアップ手順は scripts/ANALYTICS_SETUP.md を参照してください。'
    );
  }

  if (errors.length > 0) {
    console.error('=== Google Analytics セットアップエラー ===\n');
    errors.forEach((e, i) => console.error(`[${i + 1}] ${e}\n`));
    console.error('詳細: scripts/ANALYTICS_SETUP.md を参照\n');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// GA4 クライアント初期化
// ---------------------------------------------------------------------------
function createClient() {
  const opts = {};
  const credPath = CREDENTIALS_PATH;
  if (existsSync(credPath) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    opts.keyFilename = credPath;
  }
  return new BetaAnalyticsDataClient(opts);
}

// ---------------------------------------------------------------------------
// 日付ヘルパー
// ---------------------------------------------------------------------------
function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

// ---------------------------------------------------------------------------
// レポート取得: 概要指標
// ---------------------------------------------------------------------------
async function fetchOverview(client, propertyId, startDate, endDate) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'screenPageViews' },
      { name: 'averageSessionDuration' },
      { name: 'bounceRate' },
      { name: 'newUsers' },
    ],
  });

  const row = response.rows?.[0];
  if (!row) return null;

  return {
    activeUsers: parseInt(row.metricValues[0].value, 10),
    sessions: parseInt(row.metricValues[1].value, 10),
    pageviews: parseInt(row.metricValues[2].value, 10),
    avgSessionDuration: parseFloat(row.metricValues[3].value).toFixed(1),
    bounceRate: (parseFloat(row.metricValues[4].value) * 100).toFixed(1),
    newUsers: parseInt(row.metricValues[5].value, 10),
  };
}

// ---------------------------------------------------------------------------
// レポート取得: トップページ
// ---------------------------------------------------------------------------
async function fetchTopPages(client, propertyId, startDate, endDate, limit = 15) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit,
  });

  return (response.rows || []).map((row) => ({
    path: row.dimensionValues[0].value,
    title: row.dimensionValues[1].value,
    pageviews: parseInt(row.metricValues[0].value, 10),
    users: parseInt(row.metricValues[1].value, 10),
    avgDuration: parseFloat(row.metricValues[2].value).toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// レポート取得: トラフィックソース
// ---------------------------------------------------------------------------
async function fetchTrafficSources(client, propertyId, startDate, endDate) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  return (response.rows || []).map((row) => ({
    channel: row.dimensionValues[0].value,
    sessions: parseInt(row.metricValues[0].value, 10),
    users: parseInt(row.metricValues[1].value, 10),
    pageviews: parseInt(row.metricValues[2].value, 10),
  }));
}

// ---------------------------------------------------------------------------
// レポート取得: 日別推移
// ---------------------------------------------------------------------------
async function fetchDailyTrend(client, propertyId, startDate, endDate) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
      { name: 'sessions' },
    ],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
  });

  return (response.rows || []).map((row) => {
    const d = row.dimensionValues[0].value;
    return {
      date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`,
      users: parseInt(row.metricValues[0].value, 10),
      pageviews: parseInt(row.metricValues[1].value, 10),
      sessions: parseInt(row.metricValues[2].value, 10),
    };
  });
}

// ---------------------------------------------------------------------------
// レポート取得: デバイスカテゴリ
// ---------------------------------------------------------------------------
async function fetchDevices(client, propertyId, startDate, endDate) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  return (response.rows || []).map((row) => ({
    device: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value, 10),
    sessions: parseInt(row.metricValues[1].value, 10),
  }));
}

// ---------------------------------------------------------------------------
// レポート取得: 国別
// ---------------------------------------------------------------------------
async function fetchCountries(client, propertyId, startDate, endDate) {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    limit: 10,
  });

  return (response.rows || []).map((row) => ({
    country: row.dimensionValues[0].value,
    users: parseInt(row.metricValues[0].value, 10),
  }));
}

// ---------------------------------------------------------------------------
// Markdown レポート生成
// ---------------------------------------------------------------------------
function generateReport({
  overview,
  prevOverview,
  topPages,
  trafficSources,
  dailyTrend,
  devices,
  countries,
  startDate,
  endDate,
  compare,
}) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let md = '';

  md += `# Google Analytics レポート\n\n`;
  md += `> 取得日時: ${now}\n`;
  md += `> 対象期間: ${startDate} 〜 ${endDate}\n`;
  md += `> プロパティID: ${GA4_PROPERTY_ID}\n\n`;
  md += `---\n\n`;

  // --- 概要 ---
  md += `## サイト概要\n\n`;
  if (overview) {
    md += `| 指標 | 値 |`;
    if (compare && prevOverview) md += ` 前期間 | 変化 |`;
    md += `\n`;
    md += `|------|-----|`;
    if (compare && prevOverview) md += `--------|------|`;
    md += `\n`;

    const metrics = [
      ['ユーザー数', 'activeUsers', ''],
      ['新規ユーザー数', 'newUsers', ''],
      ['セッション数', 'sessions', ''],
      ['ページビュー数', 'pageviews', ''],
      ['平均セッション時間', 'avgSessionDuration', '秒'],
      ['直帰率', 'bounceRate', '%'],
    ];

    for (const [label, key, unit] of metrics) {
      const val = overview[key];
      md += `| ${label} | ${val}${unit} |`;
      if (compare && prevOverview) {
        const prev = prevOverview[key];
        const diff =
          typeof val === 'number'
            ? val - prev
            : (parseFloat(val) - parseFloat(prev)).toFixed(1);
        const sign = parseFloat(diff) > 0 ? '+' : '';
        md += ` ${prev}${unit} | ${sign}${diff}${unit} |`;
      }
      md += `\n`;
    }
  } else {
    md += `データなし\n`;
  }
  md += `\n`;

  // --- 日別推移 ---
  if (dailyTrend && dailyTrend.length > 0) {
    md += `## 日別推移\n\n`;
    md += `| 日付 | ユーザー | PV | セッション |\n`;
    md += `|------|---------|-----|----------|\n`;
    for (const d of dailyTrend) {
      md += `| ${d.date} | ${d.users} | ${d.pageviews} | ${d.sessions} |\n`;
    }
    md += `\n`;
  }

  // --- トップページ ---
  if (topPages && topPages.length > 0) {
    md += `## トップページ（PV順）\n\n`;
    md += `| # | ページ | PV | ユーザー | 平均滞在秒 |\n`;
    md += `|---|--------|-----|---------|----------|\n`;
    topPages.forEach((p, i) => {
      const title = p.title.length > 40 ? p.title.slice(0, 37) + '...' : p.title;
      md += `| ${i + 1} | ${title} | ${p.pageviews} | ${p.users} | ${p.avgDuration} |\n`;
    });
    md += `\n`;
  }

  // --- トラフィックソース ---
  if (trafficSources && trafficSources.length > 0) {
    md += `## トラフィックソース\n\n`;
    md += `| チャネル | セッション | ユーザー | PV |\n`;
    md += `|---------|-----------|---------|-----|\n`;
    for (const s of trafficSources) {
      md += `| ${s.channel} | ${s.sessions} | ${s.users} | ${s.pageviews} |\n`;
    }
    md += `\n`;
  }

  // --- デバイス ---
  if (devices && devices.length > 0) {
    md += `## デバイス別\n\n`;
    md += `| デバイス | ユーザー | セッション |\n`;
    md += `|---------|---------|----------|\n`;
    for (const d of devices) {
      md += `| ${d.device} | ${d.users} | ${d.sessions} |\n`;
    }
    md += `\n`;
  }

  // --- 国別 ---
  if (countries && countries.length > 0) {
    md += `## 国別ユーザー\n\n`;
    md += `| 国 | ユーザー |\n`;
    md += `|-----|--------|\n`;
    for (const c of countries) {
      md += `| ${c.country} | ${c.users} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*このレポートは fetch-analytics.js により自動生成されました。*\n`;

  return md;
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs();
  checkPrerequisites();

  const client = createClient();
  const propertyId = GA4_PROPERTY_ID;

  const endDate = daysAgo(1); // 昨日まで（GA4は当日データが不完全）
  const startDate = daysAgo(opts.days);

  console.error(`GA4 レポート取得中... (${startDate} 〜 ${endDate})`);

  try {
    // 全クエリを並列実行
    const promises = [
      fetchOverview(client, propertyId, startDate, endDate),
      fetchTopPages(client, propertyId, startDate, endDate),
      fetchTrafficSources(client, propertyId, startDate, endDate),
      fetchDailyTrend(client, propertyId, startDate, endDate),
      fetchDevices(client, propertyId, startDate, endDate),
      fetchCountries(client, propertyId, startDate, endDate),
    ];

    // 比較期間
    let prevOverviewPromise = null;
    if (opts.compare) {
      const prevEnd = daysAgo(opts.days + 1);
      const prevStart = daysAgo(opts.days * 2);
      prevOverviewPromise = fetchOverview(client, propertyId, prevStart, prevEnd);
      promises.push(prevOverviewPromise);
    }

    const results = await Promise.all(promises);

    const [overview, topPages, trafficSources, dailyTrend, devices, countries] = results;
    const prevOverview = opts.compare ? results[6] : null;

    const report = generateReport({
      overview,
      prevOverview,
      topPages,
      trafficSources,
      dailyTrend,
      devices,
      countries,
      startDate,
      endDate,
      compare: opts.compare,
    });

    if (opts.output) {
      const outPath = resolve(process.cwd(), opts.output);
      writeFileSync(outPath, report, 'utf-8');
      console.error(`レポートを保存しました: ${outPath}`);
    } else {
      console.log(report);
    }
  } catch (err) {
    console.error('\n=== GA4 API エラー ===');
    if (err.code === 7 || err.message?.includes('PERMISSION_DENIED')) {
      console.error(
        'アクセス権限エラー。サービスアカウントにGA4プロパティの閲覧権限があるか確認してください。\n' +
          '  GA4 管理画面 → プロパティ → プロパティのアクセス管理 → サービスアカウントのメールを追加'
      );
    } else if (err.code === 5 || err.message?.includes('NOT_FOUND')) {
      console.error(
        `プロパティ "${propertyId}" が見つかりません。GA4_PROPERTY_ID が正しいか確認してください。\n` +
          '  GA4 管理画面 → プロパティ設定 → プロパティID'
      );
    } else {
      console.error(`エラー詳細: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
