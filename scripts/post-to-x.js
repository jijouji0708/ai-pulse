#!/usr/bin/env node
/**
 * post-to-x.js — X (Twitter) posting helper with human-in-the-loop
 *
 * Safety: This script does NOT post automatically.
 * It opens X's compose URL in the browser; the user must click "Post" manually.
 *
 * Usage:
 *   node scripts/post-to-x.js                  # uses latest x-posts file
 *   node scripts/post-to-x.js path/to/file.md  # uses specified file
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

// --- Config ---
const POSTS_DIR = path.resolve(__dirname, "../agents/social/posts");

// --- Helpers ---

function findLatestPostsFile() {
  if (!fs.existsSync(POSTS_DIR)) {
    throw new Error(`Posts directory not found: ${POSTS_DIR}`);
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.match(/^\d{4}-\d{2}-\d{2}-x-posts\.md$/))
    .sort();

  if (files.length === 0) {
    throw new Error(`No x-posts files found in ${POSTS_DIR}`);
  }

  return path.join(POSTS_DIR, files[files.length - 1]);
}

function extractJapanesePosts(content) {
  const posts = [];
  const lines = content.split("\n");

  let inJapanese = false;
  let currentPost = [];
  let articleTitle = "";

  for (const line of lines) {
    // Track article headings (## 記事N: ...)
    const articleMatch = line.match(/^##\s+(.+)/);
    if (articleMatch && !line.startsWith("###")) {
      articleTitle = articleMatch[1].trim();
    }

    // Start of Japanese section
    if (/^###\s+日本語/.test(line)) {
      inJapanese = true;
      currentPost = [];
      continue;
    }

    // End of Japanese section
    if (inJapanese && (/^###\s+/.test(line) || /^---/.test(line))) {
      inJapanese = false;

      const text = currentPost
        .join("\n")
        .replace(/^\n+/, "")
        .replace(/\n+$/, "");

      if (text.length > 0) {
        posts.push({ title: articleTitle, text });
      }
      continue;
    }

    if (inJapanese) {
      currentPost.push(line);
    }
  }

  // Handle case where file ends in a Japanese section
  if (inJapanese && currentPost.length > 0) {
    const text = currentPost
      .join("\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "");

    if (text.length > 0) {
      posts.push({ title: articleTitle, text });
    }
  }

  return posts;
}

function openInBrowser(url) {
  const platform = process.platform;
  if (platform === "darwin") {
    execSync(`open "${url}"`);
  } else if (platform === "linux") {
    execSync(`xdg-open "${url}"`);
  } else if (platform === "win32") {
    execSync(`start "" "${url}"`);
  } else {
    console.log(`  Please open manually: ${url}`);
  }
}

function buildXIntentUrl(text) {
  const encoded = encodeURIComponent(text);
  return `https://x.com/intent/tweet?text=${encoded}`;
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function charCount(text) {
  // X counts URLs as ~23 chars regardless of length.
  // For display, show actual character count.
  return [...text].length;
}

// --- Main ---

async function main() {
  // Determine input file
  let inputFile;
  if (process.argv[2]) {
    inputFile = path.resolve(process.argv[2]);
  } else {
    inputFile = findLatestPostsFile();
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`);
    process.exit(1);
  }

  console.log("========================================");
  console.log("  X Post Helper — Human-in-the-Loop");
  console.log("========================================");
  console.log("");
  console.log(`File: ${inputFile}`);
  console.log(`Date: ${path.basename(inputFile).slice(0, 10)}`);
  console.log("");

  const content = fs.readFileSync(inputFile, "utf-8");
  const posts = extractJapanesePosts(content);

  if (posts.length === 0) {
    console.log("No Japanese posts found in file.");
    process.exit(0);
  }

  console.log(`Found ${posts.length} Japanese post(s).`);
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let posted = 0;
  let skipped = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const chars = charCount(post.text);

    console.log("----------------------------------------");
    console.log(`  Post ${i + 1}/${posts.length}: ${post.title}`);
    console.log(`  Characters: ${chars}${chars > 280 ? " (WARNING: over 280!)" : ""}`);
    console.log("----------------------------------------");
    console.log("");
    console.log(post.text);
    console.log("");

    const answer = await ask(rl, "Open X compose? (y/n/q): ");

    if (answer.toLowerCase() === "q") {
      console.log("Quitting.");
      break;
    }

    if (answer.toLowerCase() === "y") {
      const url = buildXIntentUrl(post.text);
      console.log("Opening browser...");
      openInBrowser(url);
      console.log("=> Browser opened. Click 'Post' to publish.");
      posted++;

      // Wait a moment before showing next post
      if (i < posts.length - 1) {
        await ask(rl, "Press Enter when ready for next post...");
      }
    } else {
      console.log("Skipped.");
      skipped++;
    }

    console.log("");
  }

  rl.close();

  console.log("========================================");
  console.log(`  Done. Opened: ${posted}, Skipped: ${skipped}`);
  console.log("========================================");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
