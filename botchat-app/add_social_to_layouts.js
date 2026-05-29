const fs = require('fs');
const path = require('path');

const layoutsDir = '/Users/divyangdeveloper/Projects/nextjs-project/botChat/botchat-app/app/dashboard/instagram/bio-link/layouts';

const socialBlockString = `
        case 'social_medias_section':
        case 'socials':
            return (
                <div className="space-y-3 pt-4">
                    {s.title && <h2 className="text-center text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">{s.title}</h2>}
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {(blockItems.length > 0 ? blockItems : []).map((item: any, i: number) => (
                            <a key={i} href={item.url || item.link || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center opacity-70 hover:opacity-100 hover:scale-110 transition-all">
                                <BrandIcon name={item.name || item.type || item.icon || "globe"} size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            );
`;

const files = fs.readdirSync(layoutsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(layoutsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes("case 'social_medias_section':")) {
        // Find default:
        const defaultIndex = content.lastIndexOf('default:');
        if (defaultIndex !== -1) {
            content = content.slice(0, defaultIndex) + socialBlockString + content.slice(defaultIndex);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Added to', file);
        }
    }
}
