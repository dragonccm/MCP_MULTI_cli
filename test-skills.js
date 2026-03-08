const fs = require('fs');
const path = require('path');

class TestDevTeam {
    constructor() {
        this.engineDir = process.cwd();
    }

    injectSkills(techStackContent) {
        const skillsDir = path.join(this.engineDir, 'agents/skills');
        if (!fs.existsSync(skillsDir)) return '';

        let injectedContent = '\n\n## 🥋 SPECIALIZED SKILLS INJECTED\nCác kỹ năng chuyên biệt sau đây đã được cài đặt vào hệ thống dựa trên Tech Stack của dự án:\n\n';
        const stackLower = techStackContent.toLowerCase();
        let skillsLoaded = false;

        const skillMapping = {
            'react': 'react-performance.md',
            'next': 'react-performance.md',
            'node': 'node-security.md',
            'express': 'node-security.md',
            'nest': 'node-security.md',
        };

        const addedFiles = new Set();

        for (const [keyword, file] of Object.entries(skillMapping)) {
            if (stackLower.includes(keyword) && !addedFiles.has(file)) {
                const skillFile = path.join(skillsDir, file);
                if (fs.existsSync(skillFile)) {
                    injectedContent += `### [Skill Group: ${file}]\n${fs.readFileSync(skillFile, 'utf-8')}\n\n`;
                    skillsLoaded = true;
                    addedFiles.add(file);
                }
            }
        }

        const cleanArchFile = path.join(skillsDir, 'clean-architecture.md');
        if (fs.existsSync(cleanArchFile) && !addedFiles.has('clean-architecture.md')) {
            injectedContent += `### [Skill Group: clean-architecture.md]\n${fs.readFileSync(cleanArchFile, 'utf-8')}\n\n`;
            skillsLoaded = true;
        }

        return skillsLoaded ? injectedContent : '';
    }
}

const team = new TestDevTeam();
console.log(team.injectSkills('We will use React for frontend and Node.js for backend.'));
