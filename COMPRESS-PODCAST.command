#!/bin/bash
set -e

echo "🎙️  PODCAST COMPRESSOR"
echo ""

# Find the latest .wav or .mp3 file in Downloads
DOWNLOADS="$HOME/Downloads"
LATEST=$(ls -t "$DOWNLOADS"/*.wav "$DOWNLOADS"/*.mp3 "$DOWNLOADS"/*.m4a 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
    echo "❌ No audio files found in Downloads!"
    echo "   Looking for: .mp3, .wav, .m4a"
    read -p "Press Enter to close..."
    exit 1
fi

FILENAME=$(basename "$LATEST")
FILESIZE=$(du -h "$LATEST" | cut -f1)
echo "📁 Found: $FILENAME ($FILESIZE)"
echo ""

# Output file
OUTPUT="$DOWNLOADS/compressed_podcast.mp3"

# Check if ffmpeg is available
if command -v ffmpeg &> /dev/null; then
    echo "🔧 Compressing with ffmpeg (128kbps mono)..."
    ffmpeg -y -i "$LATEST" -codec:a libmp3lame -b:a 128k -ac 1 "$OUTPUT" 2>&1 | tail -5
elif command -v afconvert &> /dev/null; then
    echo "🔧 Compressing with afconvert..."
    afconvert -d aac -f m4af -b 128000 -c 1 "$LATEST" "$OUTPUT"
else
    echo "❌ No audio converter found. Install ffmpeg: brew install ffmpeg"
    read -p "Press Enter to close..."
    exit 1
fi

NEWSIZE=$(du -h "$OUTPUT" | cut -f1)
echo ""
echo "✅ DONE!"
echo "   Original: $FILENAME ($FILESIZE)"
echo "   Compressed: compressed_podcast.mp3 ($NEWSIZE)"
echo "   Location: $OUTPUT"
echo ""
echo "📤 Upload compressed_podcast.mp3 to the admin panel instead."
echo ""
read -p "Press Enter to close..."
