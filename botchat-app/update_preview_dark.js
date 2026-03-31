const fs = require('fs');

const files = [
  'd:\\botChat\\botchat-app\\app\\dashboard\\instagram\\bio-link\\page.tsx',
  'd:\\botChat\\botchat-app\\app\\p\\page.tsx'
];

const dict = {
  // Mockup structural background
  'bg-[#FAFAFA]': 'dark:bg-[#000000]',
  'text-[#111]': 'dark:text-white',
  'text-[#444]': 'dark:text-slate-300',
  'text-[#777]': 'dark:text-slate-400',
  'border-[#444]': 'dark:border-[#333]',
  'border-[#eaeaea]': 'dark:border-[#2A2E39]',
  'border-[#f1f3f5]': 'dark:border-[#2A2E39]',
  
  // Public Page Specific Pink Gradients mapping to Dark Mode elegant gradients
  'from-[#fce7f3]': 'dark:from-[#140b10]',
  'via-[#fff0f8]': 'dark:via-[#090507]',
  'to-[#fdf2f8]': 'dark:to-[#000000]',
  'from-[#fdf2f8]': 'dark:from-[#140b10]',
  'to-white': 'dark:to-[#000000]',
  'via-white': 'dark:via-[#050505]',
  'bg-white': 'dark:bg-[#12151E]',
  'bg-[#F8F9FB]': 'dark:bg-[#0A0D14]',
  'bg-slate-50': 'dark:bg-white/5',
  'bg-slate-100': 'dark:bg-white/10',
  'bg-slate-200': 'dark:bg-white/20',
  'text-[#2D334A]': 'dark:text-slate-200',
  'text-[#6C768A]': 'dark:text-slate-400',
  'text-slate-900': 'dark:text-white',
  'text-slate-800': 'dark:text-slate-200',
  'text-slate-700': 'dark:text-slate-300',
  'text-slate-600': 'dark:text-slate-400',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-400': 'dark:text-slate-500',
  'text-slate-300': 'dark:text-slate-600',
  'border-[#EAEBEE]': 'dark:border-[#2A2E39]',
  'border-[#D5D8DF]': 'dark:border-[#2A2E39]',
  'border-slate-50': 'dark:border-white/5',
  'border-slate-100': 'dark:border-white/5',
  'border-slate-200': 'dark:border-white/10',
  'bg-pink-100': 'dark:bg-pink-900/40',
  'bg-pink-50': 'dark:bg-pink-900/20'
};

const escapeRegex = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let txt = fs.readFileSync(file, 'utf8');

  for (const [light, dark] of Object.entries(dict)) {
    const strictRegex = new RegExp(`(?<=^|[\\s"'\\\`])(${escapeRegex(light)})(?=[\\s"'\\\`]|$)`, 'g');
    txt = txt.replace(strictRegex, (match, prefix, index, full) => {
      // Check if it's already followed by ` dark:something`
      const followedBy = full.slice(index + match.length);
      if (followedBy.match(/^\s*dark:/)) {
          return match;
      }
      return `${match} ${dark}`;
    });
  }

  fs.writeFileSync(file, txt, 'utf8');
  console.log(`Updated mobile canvas dark mode in: ${file}`);
});
