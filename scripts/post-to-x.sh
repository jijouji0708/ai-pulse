#!/usr/bin/env bash
# post-to-x.sh — X (Twitter) posting helper with human-in-the-loop
#
# Safety: This script does NOT post automatically.
# It opens X's compose URL in the browser; the user must click "Post" manually.
#
# Usage:
#   ./scripts/post-to-x.sh                  # uses latest x-posts file
#   ./scripts/post-to-x.sh path/to/file.md  # uses specified file

set -euo pipefail

POSTS_DIR="$(cd "$(dirname "$0")/../agents/social/posts" && pwd)"

# --- Determine input file ---
if [[ $# -ge 1 ]]; then
  INPUT_FILE="$1"
else
  # Find the most recent *-x-posts.md file (excluding multilingual variants like -en-es)
  INPUT_FILE=$(ls -1 "$POSTS_DIR"/*-x-posts.md 2>/dev/null | sort | tail -n 1)
  if [[ -z "$INPUT_FILE" ]]; then
    echo "Error: No x-posts file found in $POSTS_DIR"
    exit 1
  fi
fi

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Error: File not found: $INPUT_FILE"
  exit 1
fi

echo "========================================"
echo "  X Post Helper — Human-in-the-Loop"
echo "========================================"
echo ""
echo "File: $INPUT_FILE"
echo ""

# --- Parse Japanese sections ---
# Extract text between "### 日本語" and the next "###" or "---"
post_num=0
in_japanese=0
current_post=""

while IFS= read -r line || [[ -n "$line" ]]; do
  # Detect start of Japanese section
  if [[ "$line" =~ ^###[[:space:]]+日本語 ]]; then
    in_japanese=1
    current_post=""
    continue
  fi

  # Detect end of Japanese section (next ### heading or --- separator)
  if [[ $in_japanese -eq 1 ]] && [[ "$line" =~ ^###[[:space:]] || "$line" =~ ^--- ]]; then
    in_japanese=0

    # Process the collected post if non-empty
    # Trim leading/trailing blank lines
    current_post=$(echo "$current_post" | sed -e '/./,$!d' -e :a -e '/^[[:space:]]*$/{ $d; N; ba; }')

    if [[ -n "$current_post" ]]; then
      post_num=$((post_num + 1))

      echo "----------------------------------------"
      echo "  Post $post_num"
      echo "----------------------------------------"
      echo ""
      echo "$current_post"
      echo ""

      # Ask for confirmation
      read -rp "Open X compose for this post? (y/n/q): " answer
      case "$answer" in
        [Yy]|[Yy][Ee][Ss])
          # URL-encode the post text
          encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))" <<< "$current_post")
          url="https://x.com/intent/tweet?text=${encoded}"
          echo "Opening browser..."
          open "$url"
          echo "=> Browser opened. Click 'Post' to publish."
          echo ""
          # Brief pause so the browser can open before next prompt
          sleep 1
          ;;
        [Qq]|[Qq][Uu][Ii][Tt])
          echo "Quitting."
          exit 0
          ;;
        *)
          echo "Skipped."
          echo ""
          ;;
      esac
    fi
    continue
  fi

  # Accumulate lines in current Japanese section
  if [[ $in_japanese -eq 1 ]]; then
    current_post="${current_post}${line}
"
  fi
done < "$INPUT_FILE"

# Handle case where file ends while still in a Japanese section
if [[ $in_japanese -eq 1 && -n "$current_post" ]]; then
  current_post=$(echo "$current_post" | sed -e '/./,$!d' -e :a -e '/^[[:space:]]*$/{ $d; N; ba; }')
  if [[ -n "$current_post" ]]; then
    post_num=$((post_num + 1))

    echo "----------------------------------------"
    echo "  Post $post_num"
    echo "----------------------------------------"
    echo ""
    echo "$current_post"
    echo ""

    read -rp "Open X compose for this post? (y/n): " answer
    case "$answer" in
      [Yy]|[Yy][Ee][Ss])
        encoded=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.stdin.read().strip(), safe=''))" <<< "$current_post")
        url="https://x.com/intent/tweet?text=${encoded}"
        echo "Opening browser..."
        open "$url"
        echo "=> Browser opened. Click 'Post' to publish."
        ;;
      *)
        echo "Skipped."
        ;;
    esac
  fi
fi

echo ""
echo "========================================"
if [[ $post_num -eq 0 ]]; then
  echo "  No Japanese posts found in file."
else
  echo "  Done. $post_num post(s) processed."
fi
echo "========================================"
