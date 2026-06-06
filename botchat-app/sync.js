const fs = require('fs');
const phoneSrc = fs.readFileSync('d:/botChat/botchat-app/app/dashboard/instagram/bio-link/PhonePreview.tsx', 'utf8');

// Find start of these cases in PhonePreview
const startIdx = phoneSrc.indexOf('case \"hero_section\":');
const endIdx = phoneSrc.indexOf('default:', startIdx);
let casesBlock = phoneSrc.slice(startIdx, endIdx);

// Now in p/page.tsx, replace its current cases block from hero_section to default:
const pSrc = fs.readFileSync('d:/botChat/botchat-app/app/p/page.tsx', 'utf8');
const pStartIdx = pSrc.indexOf('case \"hero_section\":');
const pEndIdx = pSrc.indexOf('default:', pStartIdx);

let pNew = pSrc.slice(0, pStartIdx) + casesBlock + pSrc.slice(pEndIdx);

// We also need to add missing subcomponents that might be referenced but missing in p/page.tsx. Right now, PhonePreview uses subcomponents like:
// `HeroBlockView`, `CarouselBlockView` etc inside the switch? 
// No! PhonePreview defines them inside the component but it actually passes them out? No, they are inside the same file in PhonePreview.tsx.
// Wait, the new sections (pricing_cards, impact_section, etc) in PhonePreview.tsx DO NOT use subcomponets! They do the rendering fully inline!
// Yes, like `case "pricing_cards_section": return ( <div className="w-full space-y-6 my-8">... )`
// So it's 100% fine to just inject the switch cases.

fs.writeFileSync('d:/botChat/botchat-app/app/p/page.tsx', pNew);
console.log('REPLACED SUCCESSFULLY');
