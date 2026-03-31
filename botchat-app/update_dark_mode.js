const fs = require('fs');

const file = 'd:\\botChat\\botchat-app\\app\\dashboard\\instagram\\bio-link\\page.tsx';
let txt = fs.readFileSync(file, 'utf8');

const dict = {
  'bg-[#F8F9FB]': 'dark:bg-[#0A0D14]',
  'bg-white': 'dark:bg-[#12151E]',
  'bg-slate-50': 'dark:bg-white/5',
  'bg-slate-100': 'dark:bg-white/10',
  'bg-slate-200': 'dark:bg-white/20',
  'text-[#2D334A]': 'dark:text-slate-200',
  'text-[#6C768A]': 'dark:text-slate-400',
  'text-slate-900': 'dark:text-white',
  'text-slate-800': 'dark:text-slate-200',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-400': 'dark:text-slate-500',
  'border-[#EAEBEE]': 'dark:border-[#2A2E39]',
  'border-[#D5D8DF]': 'dark:border-[#2A2E39]',
  'border-slate-100': 'dark:border-white/5',
  'border-slate-200': 'dark:border-white/10'
};

const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

for (const [light, dark] of Object.entries(dict)) {
  // We want to match `light` only if it's NOT already followed by ` dark:something`
  // We use string replace on the full text but carefully matching borders.
  // Since Tailwind classes are separated by spaces, quotes, or backticks:
  const regex = new RegExp(`(${escapeRegex(light)})(?!\\s*dark:)`, 'g');
  
  // Actually, we must make sure `light` is a full class. e.g. bg-white shouldn't match bg-white-500
  // So we check that the character after the match is a space, quote, backtick, or newline.
  const strictRegex = new RegExp(`(?<=^|[\\s"'\\\`])(${escapeRegex(light)})(?=[\\s"'\\\`]|$)`, 'g');

  txt = txt.replace(strictRegex, (match) => {
    return `${match} ${dark}`;
  });
}

// Quick clean up of any double spacing or weird quotes if generated
fs.writeFileSync(file, txt, 'utf8');
console.log('Dark mode classes successfully injected.');
