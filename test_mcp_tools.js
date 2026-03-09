#!/usr/bin/env node

/**
 * Тест всех MCP инструментов для работы с блокнотами
 */

import { spawn } from 'child_process';
import path from 'path';

const serverPath = path.join(process.cwd(), 'dist', 'index.js');

console.log('🔍 Тест MCP инструментов для работы с блокнотами...\n');

const mcp = spawn('node', [serverPath], {
    env: {
        ...process.env,
        SIYUAN_HOST: '127.0.0.1',
        SIYUAN_PORT: '6806',
        SIYUAN_TOKEN: 'qu1lc099w6cqlrxn'
    },
    stdio: ['pipe', 'pipe', 'pipe']
});

let response = '';
let idCounter = 1;

mcp.stderr.on('data', (data) => {
    const str = data.toString();
    if (str.includes('API:') || str.includes('Response status:')) {
        console.error(str.trim());
    }
});

mcp.stdout.on('data', (data) => {
    response += data.toString();
});

function sendRequest(method, params, callback) {
    const request = {
        jsonrpc: '2.0',
        id: idCounter++,
        method,
        params
    };
    response = '';
    mcp.stdin.write(JSON.stringify(request) + '\n');
    
    setTimeout(() => {
        try {
            const result = JSON.parse(response.trim());
            callback(null, result);
        } catch (e) {
            callback(e, null);
        }
    }, 1500);
}

// Тест 1: list_notebooks
console.log('📋 Тест 1: list_notebooks\n');
sendRequest('tools/call', {
    name: 'list_notebooks',
    arguments: {}
}, (err, result) => {
    if (err) {
        console.log('❌ Ошибка:', err.message);
    } else if (result?.result?.content) {
        const content = result.result.content[0]?.text;
        console.log('✅ Результат:');
        console.log(content?.substring(0, 500) || content);
        console.log('');
    }
});

// Тест 2: create_doc
setTimeout(() => {
    console.log('\n📄 Тест 2: create_doc\n');
    const today = new Date();
    sendRequest('tools/call', {
        name: 'create_doc',
        arguments: {
            notebook: '20260129011436-mjq587r',
            path: `/mcp-test-${today.getHours()}-${String(today.getMinutes()).padStart(2, '0')}`,
            markdown: `# Тест через MCP\n\nВремя: ${today.toLocaleString('ru-RU')}`
        }
    }, (err, result) => {
        if (err) {
            console.log('❌ Ошибка:', err.message);
        } else if (result?.result?.content) {
            const content = result.result.content[0]?.text;
            console.log('✅ Результат:');
            console.log(content);
            console.log('');
        }
    });
}, 3000);

// Тест 3: sql_query (проверка создания)
setTimeout(() => {
    console.log('\n🔍 Тест 3: sql_query (поиск созданных документов)\n');
    sendRequest('tools/call', {
        name: 'sql_query',
        arguments: {
            sql: "SELECT id, hpath, created FROM blocks WHERE type = 'd' AND notebook = '20260129011436-mjq587r' ORDER BY created DESC LIMIT 5"
        }
    }, (err, result) => {
        if (err) {
            console.log('❌ Ошибка:', err.message);
        } else if (result?.result?.content) {
            const content = result.result.content[0]?.text;
            console.log('✅ Результат:');
            console.log(content?.substring(0, 1000) || content);
            console.log('');
        }
        
        mcp.kill();
        console.log('\n✨ Тест завершён!\n');
    });
}, 6000);
