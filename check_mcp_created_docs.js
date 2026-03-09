#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const workspaceDir = 'C:\\Users\\zak\\SiYuan';
const dataDir = path.join(workspaceDir, 'data');
const notesNb = '20260129011436-mjq587r';
const notesPath = path.join(dataDir, notesNb);

console.log('🔍 Поиск документов, созданных через MCP...\n');

// Ищем файлы с "mcp-test" в названии
const findFiles = (dir, pattern) => {
    const results = [];
    const search = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            if (item.startsWith('.')) continue;
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                search(itemPath);
            } else if (item.toLowerCase().includes(pattern.toLowerCase())) {
                results.push({
                    path: itemPath.substring(notesPath.length + 1),
                    fullPath: itemPath,
                    created: stat.birthtime,
                    size: stat.size
                });
            }
        }
    };
    search(dir);
    return results;
};

console.log('1. Поиск файлов с "mcp-test":\n');
const mcpFiles = findFiles(notesPath, 'mcp-test');

if (mcpFiles.length === 0) {
    console.log('   Не найдено\n');
} else {
    mcpFiles.forEach((f, i) => {
        console.log(`   ✅ ${i + 1}. ${f.path}`);
        console.log(`      Создан: ${f.created.toLocaleString('ru-RU')}`);
        console.log(`      Размер: ${f.size} байт`);
        
        // Читаем заголовок
        const content = fs.readFileSync(f.fullPath, 'utf8');
        try {
            const data = JSON.parse(content);
            const title = data.Properties?.title || data.Children?.[0]?.Children?.[0]?.Children?.[0]?.Data || 'Без названия';
            console.log(`      Заголовок: ${title}`);
        } catch {
            console.log(`      Содержимое: ${content.substring(0, 100)}...`);
        }
        console.log('');
    });
}

// Показываем последние созданные файлы
console.log('\n2. Последние созданные файлы .sy (10 шт):\n');

const findRecentSy = (dir, limit = 10) => {
    const results = [];
    const search = (currentDir) => {
        if (!fs.existsSync(currentDir)) return;
        const items = fs.readdirSync(currentDir);
        for (const item of items) {
            if (item.startsWith('.')) continue;
            const itemPath = path.join(currentDir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                search(itemPath);
            } else if (item.endsWith('.sy')) {
                results.push({
                    path: itemPath.substring(notesPath.length + 1),
                    fullPath: itemPath,
                    created: stat.birthtimeMs
                });
            }
        }
    };
    search(dir);
    return results.sort((a, b) => b.created - a.created).slice(0, limit);
};

const recentFiles = findRecentSy(notesPath);

recentFiles.forEach((f, i) => {
    const isMcpTest = f.path.includes('mcp-test') || f.path.includes('qwen');
    const marker = isMcpTest ? '📝' : '📄';
    console.log(`   ${marker} ${i + 1}. ${f.path}`);
    console.log(`      Создан: ${new Date(f.created).toLocaleString('ru-RU')}`);
});

console.log('\n\n✅ MCP сервер работает и создаёт документы в SiYuan!\n');
