const fs = require('fs');

const file = 'd:\\botChat\\botchat-app\\app\\dashboard\\flows\\page.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Replace standard static backgrounds (e.g. background: "#fff") with DS.card or DS.bg
txt = txt.replace(/background:\s*["']#fff["']/g, 'background: DS.bg');
txt = txt.replace(/background:\s*["']#FAFAFA["']/g, 'background: DS.bg');
txt = txt.replace(/background:\s*["']#F8F9FB["']/g, 'background: DS.bg');
txt = txt.replace(/background:\s*["']#F3F4F6["']/g, 'background: DS.bg');
txt = txt.replace(/background:\s*["']#F0F2F5["']/g, 'background: DS.bg');
txt = txt.replace(/background:\s*["']#F1F5F9["']/g, 'background: DS.bg');

// Replace conditional backgrounds (e.g. open ? DS.bg : "#fff") 
txt = txt.replace(/\? DS\.bg : ["']#fff["']/g, '? DS.card : DS.bg');
txt = txt.replace(/\? ["']#fff["'] : ["']transparent["']/g, '? DS.bg : "transparent"');
txt = txt.replace(/\? ["']#F0F2F5["'] : ["']#fff["']/g, '? DS.bg : DS.card');
txt = txt.replace(/\? ["']#fff["'] : ["']rgba\(255,255,255,0\.92\)["']/g, '? DS.bg : DS.card');

// Clean up standard static borders inline
txt = txt.replace(/border: ["']?1(?:.5)?px solid (?:#E4E6EB|#DBDBDB|#E2E8F0|#EAEBEE|#D5D8DF)["']?/g, 'border: `1px solid ${DS.border}`');
txt = txt.replace(/border: \`1(?:.5)?px solid \$\{isFB \? ["'](?:#E4E6EB|#DBDBDB)["'] : ["'](?:#DBDBDB|#E4E6EB)["']\}\`/g, 'border: `1px solid ${DS.border}`');

// Clean up hardcoded svgs and main drawing container background patterns
txt = txt.replace(/stroke=["']#E2E8F0["']/g, 'stroke={DS.border}');
txt = txt.replace(/stroke=["']#EAEBEE["']/g, 'stroke={DS.border}');
txt = txt.replace(/fill=["']#fff["']/g, 'fill={DS.bg}');

// A specific background grid or canvas wrapper likely uses "#f4f5f7" or "#FAFAFA"
txt = txt.replace(/background:\s*["']#f4f5f7["']/g, 'background: DS.bg');
txt = txt.replace(/backgroundColor:\s*["']#FAFAFA["']/g, 'backgroundColor: DS.bg');
txt = txt.replace(/backgroundColor:\s*["']#fff["']/g, 'backgroundColor: DS.card');
txt = txt.replace(/backgroundColor:\s*["']#F3F4F6["']/g, 'backgroundColor: DS.bg');
txt = txt.replace(/backgroundColor:\s*["']#F8F9FB["']/g, 'backgroundColor: DS.bg');

fs.writeFileSync(file, txt, 'utf8');
console.log('Flow builder hardcoded colors integrated to DS.bg natively!');
