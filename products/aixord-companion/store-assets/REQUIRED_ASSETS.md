# Chrome Web Store Required Assets

## Still Needed (Manual Creation)

### 1. Icon (128x128 PNG)
- File: `icon-128.png`
- Requirements: 128x128 pixels, PNG format
- Suggestion: AIXORD logo or shield icon with "A" monogram

### 2. Screenshots (1280x800 or 640x400)
- File: `screenshot-1.png` - Side panel showing gate tracker
- File: `screenshot-2.png` - Phase selector in action
- Requirements: At least 1 screenshot required, up to 5 allowed

### 3. Promotional Images (Optional but Recommended)
- Small tile: 440x280 PNG
- Large tile: 920x680 PNG
- Marquee: 1400x560 PNG

## Already Created

- [x] description.txt - Short and full descriptions
- [x] privacy-policy.md - Privacy policy document

## Privacy Policy URL

Host the privacy policy at one of:
- https://aixord-webapp-ui.pages.dev/privacy
- https://gist.github.com (create public gist)
- https://pmerit.com/privacy/aixord-companion

## Creating the Store ZIP

Once all assets are ready:

```powershell
cd C:\dev\pmerit\pmerit-technologies\products\aixord-companion
Compress-Archive -Path dist\* -DestinationPath aixord-companion-store.zip -Force
```

## Store Listing Checklist

- [ ] Developer account ($5 one-time fee): https://chrome.google.com/webstore/devconsole
- [ ] Extension ZIP uploaded
- [ ] Icon 128x128 uploaded
- [ ] At least 1 screenshot uploaded
- [ ] Short description (132 chars)
- [ ] Full description
- [ ] Privacy policy URL
- [ ] Category: Productivity
- [ ] Language: English
