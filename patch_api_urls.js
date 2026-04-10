const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDir = fs.statSync(dirPath).isDirectory();
        if (isDir) {
            // Skip node_modules and .next
            if (f !== 'node_modules' && f !== '.next') walk(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const targetDirs = [
    'd:/Work/LUMIVST/frontend/app', 
    'd:/Work/LUMIVST/frontend/components', 
    'd:/Work/LUMIVST/frontend/hooks'
];

targetDirs.forEach(d => {
    if (fs.existsSync(d)) {
        walk(d, filepath => {
            if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts')) return;
            
            let content = fs.readFileSync(filepath, 'utf8');
            if (!content.includes('process.env.NEXT_PUBLIC_API_URL')) return;
            
            let modified = content;
            // Replace the full expression process.env.NEXT_PUBLIC_API_URL || '...' with API_BASE_URL
            modified = modified.replace(/process\.env\.NEXT_PUBLIC_API_URL(\s*\|\|\s*['"][^'"]+['"])?/g, 'API_BASE_URL');
            
            if (modified !== content) {
                if (!modified.includes("import { API_BASE_URL }")) {
                    // Try to insert after the last import
                    const importPattern = /^import .*?;?\r?\n/gm;
                    let lastIndex = 0;
                    let match;
                    while ((match = importPattern.exec(modified)) !== null) {
                        lastIndex = importPattern.lastIndex;
                    }
                    
                    if (lastIndex > 0) {
                        modified = modified.substring(0, lastIndex) + "import { API_BASE_URL } from '@/lib/api/config';\n" + modified.substring(lastIndex);
                    } else {
                        modified = "import { API_BASE_URL } from '@/lib/api/config';\n" + modified;
                    }
                }
                fs.writeFileSync(filepath, modified);
                console.log("Updated", filepath);
            }
        });
    }
});
