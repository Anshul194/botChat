const fs = require('fs');

let code = fs.readFileSync('app/dashboard/facebook/comment-manager/page.tsx', 'utf8');

code = code.replace(/const \{ showModal \} = useModal\(\);\n?/g, '');
code = code.replace(/showModal\("error", "Error", (.*?)\);/g, 'toast.error($1);');
code = code.replace(/showModal\("success", "Success", (.*?)\);/g, 'toast.success($1);');
code = code.replace(/showModal\("success", "Updated", (.*?)\);/g, 'toast.success($1);');
code = code.replace(/showModal\("success", "Deleted", (.*?)\);/g, 'toast.success($1);');

fs.writeFileSync('app/dashboard/facebook/comment-manager/page.tsx', code);
