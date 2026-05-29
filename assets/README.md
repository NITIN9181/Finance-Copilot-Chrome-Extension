# Assets Directory

## Required Icons

Plasmo requires PNG icon files in the following sizes:
- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Temporary Workaround

For development, you can:

1. Create simple placeholder icons using any image editor
2. Use online tools like https://www.favicon-generator.org/
3. Convert the provided icon.svg to PNG using:
   - Online: https://cloudconvert.com/svg-to-png
   - Command line: `convert icon.svg -resize 16x16 icon16.png` (ImageMagick)

## Icon Design

The Finance Copilot icon should represent:
- Financial data/tables (horizontal lines)
- AI assistance (plus sign or sparkle)
- Professional appearance
- Good visibility at small sizes

Current icon.svg shows:
- Blue background (#3B82F6)
- White horizontal lines (representing table rows)
- Green circle with plus sign (representing AI assistance)
