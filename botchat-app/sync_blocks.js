const fs = require('fs');
const phonePreview = fs.readFileSync('d:/botChat/botchat-app/app/dashboard/instagram/bio-link/PhonePreview.tsx', 'utf-8');
const page = fs.readFileSync('d:/botChat/botchat-app/app/p/page.tsx', 'utf-8');

const startMarker = '{/* ── HERO SECTION (Edge-to-Edge Website Style) ── */}';
const endMarker = '{/* ── GENERIC CATCH-ALL for remaining block types (Hyper Trendy Links) ── */}';
const startIndex = phonePreview.indexOf(startMarker);
const endIndex = phonePreview.indexOf(endMarker);
let blocks = phonePreview.substring(startIndex, endIndex);

let newPage = page;
if (!newPage.includes('MessageCircle')) {
    newPage = newPage.replace('import { Globe,', 'import { Globe, MessageCircle, User,');
}

let outBlocks = [];
const parts = blocks.split('{/* ── ');
for (let part of parts) {
    if (!part.trim()) continue;
    part = '{/* ── ' + part;
    part = part.replace(/\{\s*\((type ===.*?)\)\s*&&\s*\(/, 'if ($1) return (');
    part = part.replace(/\{\s*type === \"(.*?)\"\s*&&\s*\(/, 'if (type === \"$1\") return (');
    
    const lastBraceIndex = part.lastIndexOf(')}');
    if (lastBraceIndex !== -1) {
        part = part.substring(0, lastBraceIndex) + ');' + part.substring(lastBraceIndex + 2);
    }
    part = part.replace(/effectiveTextColor/g, '(theme.textColor || \"#000000\")');
    outBlocks.push(part);
}

const defaultReturn = 'default: return null;';
const injectedCode = outBlocks.join('\n\n') + '\n\n    ' + defaultReturn;
newPage = newPage.replace(defaultReturn, injectedCode);

fs.writeFileSync('d:/botChat/botchat-app/app/p/page.tsx', newPage);
console.log('Successfully updated app/p/page.tsx');
