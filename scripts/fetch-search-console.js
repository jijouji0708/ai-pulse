#!/usr/bin/env node
/**
 * fetch-search-console.js — Google Search Console API レポート取得スクリプト
 *
 * AI Pulse プロジェクト用。Search Console API を使用して検索パフォーマンスデータを取得し、
 * Markdown形式のレポートを出力する。
 *
 * ============================================================
 * セットアップ手順（初回のみ）
 * ============================================================
 * 1. Google Cloud Console で「Search Console API」を有効化
 *    （fetch-analytics.js と同じプロジェクトでOK）
 * 2. 同じサービスアカウントを Search Console のプロパティにも追加
 *    Search Console → 設定 → ユーザーと権限 → ユーザーを追加
 *    サービスアカウントのメールアドレスに「フル」権限を付与
 * 3. 以下の環境変数を設定:
 *    - GSC_SITE_URL: サイトURL（例: https://takamuranaoya.github.io/ai-pulse/）
 *    - GOOGLE_APPLICATION_CREDENTIALS: サービスアカウントJSONキーのパス
 *
 * 詳細は ANALYTICS_SETUP.md を参照。
 * ============================================================
 *
 * 使い方:
 *   node scripts/fetch-search-console.js
 *   node scripts/fetch-search-console.js --days 28
 *   node scripts/fetch-search-console.js --output agents/analytics/reports/gsc-report.md
 * ============================================================
 */

import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 設定
// ---------------------------------------------------------------------------
const GSC_SITE_URL = process.env.GSC_SITE_URL;
const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GA4_CREDENTIALS_PATH ||
  resolve(PROJECT_ROOT, 'credentials', 'ga4-service-account.json');

// ---------------------------------------------------------------------------
// 引数パース
// ---------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { days: 7, output: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      opts.days = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      opts.output = args[i + 1];
      i++;
    }
  }
  return opts;
}

// ---------------------------------------------------------------------------
// 前提チェック
// ---------------------------------------------------------------------------
function checkPrerequisites() {
  const errors = [];

  if (!GSC_SITE_URL) {
    errors.push(
      '環境変数 GSC_SITE_URL が未設定です。\n' +
        '  Search Console に登録済みのサイトURLを設定してください。\n' +
        '  例: export GSC_SITE_URL="https://takamuranaoya.github.io/ai-pulse/"'
    );
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !existsSync(CREDENTIALS_PATH)) {
    errors.push(
      'サービスアカウントの認証情報が見つかりません。\n' +
        '  GOOGLE_APPLICATION_CREDENTIALS 環境変数を設定するか、\n' +
        `  ${resolve(PROJECT_ROOT, 'credentials', 'ga4-service-account.json')} にファイルを配置してください。`
    );
  }

  if (errors.length > 0) {
    console.error('=== Google Search Console セットアップエラー ===\n');
    errors.forEach((e, i) => console.error(`[${i + 1}] ${e}\n`));
    console.error('詳細: scripts/ANALYTICS_SETUP.md を参照\n');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 認証
// ---------------------------------------------------------------------------
async function createAuthClient() {
  let keyFile = CREDENTIALS_PATH;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  return auth;
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
// データ取得: サイト全体のサマリー
// ---------------------------------------------------------------------------
async function fetchSiteSummary(searchconsole, siteUrl, startDate, endDate) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: [],
      rowLimit: 1,
    },
  });

  const row = res.data.rows?.[0];
  if (!row) return null;

  return {
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: (row.ctr * 100).toFixed(2),
    position: row.position.toFixed(1),
  };
}

// ---------------------------------------------------------------------------
// データ取得: トップクエリ
// ---------------------------------------------------------------------------
async function fetchTopQueries(searchconsole, siteUrl, startDate, endDate, limit = 20) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
      orderBy: 'clicks',
    },
  });

  return (res.data.rows || []).map((row) => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: (row.ctr * 100).toFixed(2),
    position: row.position.toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// データ取得: トップページ
// ---------------------------------------------------------------------------
async function fetchTopPages(searchconsole, siteUrl, startDate, endDate, limit = 15) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: limit,
      orderBy: 'clicks',
    },
  });

  return (res.data.rows || []).map((row) => ({
    page: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: (row.ctr * 100).toFixed(2),
    position: row.position.toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// データ取得: 日別推移
// ---------------------------------------------------------------------------
async function fetchDailyTrend(searchconsole, siteUrl, startDate, endDate) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['date'],
      rowLimit: 100,
    },
  });

  return (res.data.rows || []).map((row) => ({
    date: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: (row.ctr * 100).toFixed(2),
    position: row.position.toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// データ取得: デバイス別
// ---------------------------------------------------------------------------
async function fetchDeviceBreakdown(searchconsole, siteUrl, startDate, endDate) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['device'],
    },
  });

  return (res.data.rows || []).map((row) => ({
    device: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: (row.ctr * 100).toFixed(2),
    position: row.position.toFixed(1),
  }));
}

// ---------------------------------------------------------------------------
// Markdown レポート生成
// ---------------------------------------------------------------------------
function generateReport({ summary, topQueries, topPages, dailyTrend, devices, startDate, endDate }) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let md = '';

  md += `# Google Search Console レポート\n\n`;
  md += `> 取得日時: ${now}\n`;
  md += `> 対象期間: ${startDate} 〜 ${endDate}\n`;
  md += `> サイト: ${GSC_SITE_URL}\n\n`;
  md += `---\n\n`;

  // --- サマリー ---
  md += `## サイト全体サマリー\n\n`;
  if (summary) {
    md += `| 指標 | 値 |\n`;
    md += `|------|-----|\n`;
    md += `| クリック数 | ${summary.clicks} |\n`;
    md += `| 表示回数 | ${summary.impressions} |\n`;
    md += `| 平均CTR | ${summary.ctr}% |\n`;
    md += `| 平均掲載順位 | ${summary.position} |\n\n`;
  } else {
    md += `データなし（サイトがまだインデックスされていない可能性があります）\n\n`;
  }

  // --- 日別推移 ---
  if (dailyTrend && dailyTrend.length > 0) {
    md += `## 日別推移\n\n`;
    md += `| 日付 | クリック | 表示 | CTR | 順位 |\n`;
    md += `|------|---------|------|------|------|\n`;
    for (const d of dailyTrend) {
      md += `| ${d.date} | ${d.clicks} | ${d.impressions} | ${d.ctr}% | ${d.position} |\n`;
    }
    md += `\n`;
  }

  // --- トップクエリ ---
  if (topQueries && topQueries.length > 0) {
    md += `## 検索クエリ TOP${topQueries.length}\n\n`;
    md += `| # | クエリ | クリック | 表示 | CTR | 順位 |\n`;
    md += `|---|--------|---------|------|------|------|\n`;
    topQueries.forEach((q, i) => {
      md += `| ${i + 1} | ${q.query} | ${q.clicks} | ${q.impressions} | ${q.ctr}% | ${q.position} |\n`;
    });
    md += `\n`;
  }

  // --- トップページ ---
  if (topPages && topPages.length > 0) {
    md += `## ページ別パフォーマンス TOP${topPages.length}\n\n`;
    md += `| # | ページ | クリック | 表示 | CTR | 順位 |\n`;
    md += `|---|--------|---------|------|------|------|\n`;
    topPages.forEach((p, i) => {
      const short = p.page.length > 60 ? '...' + p.page.slice(-57) : p.page;
      md += `| ${i + 1} | ${short} | ${p.clicks} | ${p.impressions} | ${p.ctr}% | ${p.position} |\n`;
    });
    md += `\n`;
  }

  // --- デバイス別 ---
  if (devices && devices.length > 0) {
    md += `## デバイス別\n\n`;
    md += `| デバイス | クリック | 表示 | CTR | 順位 |\n`;
    md += `|---------|---------|------|------|------|\n`;
    for (const d of devices) {
      md += `| ${d.device} | ${d.clicks} | ${d.impressions} | ${d.ctr}% | ${d.position} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*このレポートは fetch-search-console.js により自動生成されました。*\n`;

  return md;
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------
async function main() {
  const opts = parseArgs();
  checkPrerequisites();

  const auth = await createAuthClient();
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const siteUrl = GSC_SITE_URL;

  // Search Console のデータは2-3日遅れ
  const endDate = daysAgo(3);
  const startDate = daysAgo(opts.days + 3);

  console.error(`Search Console レポート取得中... (${startDate} 〜 ${endDate})`);

  try {
    const [summary, topQueries, topPages, dailyTrend, devices] = await Promise.all([
      fetchSiteSummary(searchconsole, siteUrl, startDate, endDate),
      fetchTopQueries(searchconsole, siteUrl, startDate, endDate),
      fetchTopPages(searchconsole, siteUrl, startDate, endDate),
      fetchDailyTrend(searchconsole, siteUrl, startDate, endDate),
      fetchDeviceBreakdown(searchconsole, siteUrl, startDate, endDate),
    ]);

    const report = generateReport({
      summary,
      topQueries,
      topPages,
      dailyTrend,
      devices,
      startDate,
      endDate,
    });

    if (opts.output) {
      const outPath = resolve(process.cwd(), opts.output);
      writeFileSync(outPath, report, 'utf-8');
      console.error(`レポートを保存しました: ${outPath}`);
    } else {
      console.log(report);
    }
  } catch (err) {
    console.error('\n=== Search Console API エラー ===');
    if (err.code === 403) {
      console.error(
        'アクセス権限エラー。サービスアカウントに Search Console の権限があるか確認してください。\n' +
          '  Search Console → 設定 → ユーザーと権限 → サービスアカウントのメールを追加'
      );
    } else if (err.code === 404) {
      console.error(
        `サイト "${siteUrl}" が見つかりません。GSC_SITE_URL が正しいか確認してください。\n` +
          '  Search Console に登録済みのURLと完全に一致させてください（末尾のスラッシュも含む）。'
      );
    } else {
      console.error(`エラー詳細: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
