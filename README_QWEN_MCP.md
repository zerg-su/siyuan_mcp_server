# 📝 MCP Server для SiYuan Note — Руководство для Qwen Code

> Полное руководство по установке и использованию MCP сервера SiYuan в Qwen Code

---

## 🚀 Быстрый старт

### 1. Установка MCP сервера

```bash
# Перейдите в директорию проекта
cd C:\Users\zak\Documents\Projects\siyuan_mcp_server

# Установите зависимости и соберите проект
npm install && npm run build
```

### 2. Добавление в Qwen Code

```bash
# Добавьте MCP сервер через CLI Qwen
qwen mcp add -s project -t stdio siyuan-mcp \
  -e SIYUAN_HOST=127.0.0.1 \
  -e SIYUAN_PORT=6806 \
  -e SIYUAN_TOKEN=ваш-токен-из-siyuan \
  node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
```

### 3. Проверка

```bash
# Проверьте, что сервер добавлен
qwen mcp list
```

**Ожидаемый вывод:**

```
Configured MCP servers:
✓ siyuan-mcp: node C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js (stdio) - Connected
```

---

## 📋 Пошаговая инструкция

### Шаг 1: Подготовка SiYuan Note

1. Откройте **SiYuan Note**
2. Перейдите в **Настройки** → **О программе** → **API токен**
3. Скопируйте токен (например: `qu1lc099w6cqlrxn`)
4. Убедитесь, что SiYuan запущен

### Шаг 2: Сборка MCP сервера

```bash
cd C:\Users\zak\Documents\Projects\siyuan_mcp_server
npm run build
```

После сборки в папке `dist/` появится файл `index.js` — это и есть MCP сервер.

### Шаг 3: Добавление через Qwen CLI

**Важно:** Используйте именно этот порядок аргументов:

```bash
qwen mcp add -s project -t stdio siyuan-mcp \
  -e SIYUAN_HOST=127.0.0.1 \
  -e SIYUAN_PORT=6806 \
  -e SIYUAN_TOKEN=qu1lc099w6cqlrxn \
  node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
```

**Разбор аргументов:**

| Аргумент | Описание |
|----------|----------|
| `-s project` | Сохранить в настройках проекта (локально) |
| `-t stdio` | Использовать stdio транспорт (локальный процесс) |
| `siyuan-mcp` | Имя сервера |
| `-e KEY=value` | Переменные окружения для сервера |
| `node` | Команда для запуска |
| `--` | Разделитель между командой и аргументами |
| `C:/.../dist/index.js` | Путь к MCP серверу |

### Шаг 4: Проверка конфигурации

Откройте файл `.qwen/settings.json` в проекте:

```json
{
  "mcpServers": {
    "siyuan-mcp": {
      "command": "node",
      "args": ["C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js"],
      "env": {
        "SIYUAN_HOST": "127.0.0.1",
        "SIYUAN_PORT": "6806",
        "SIYUAN_TOKEN": "qu1lc099w6cqlrxn"
      }
    }
  },
  "$version": 3
}
```

### Шаг 5: Перезапуск Qwen Code

**Полностью закройте и откройте Qwen Code** для применения конфигурации.

---

## 🛠️ Использование в Qwen Code

### Через чат

Просто попросите Qwen Code использовать инструменты SiYuan:

```
Покажи список всех блокнотов в SiYuan
```

```
Создай новый документ в блокноте Notes с заголовком "Meeting Notes"
```

```
Выполни SQL-запрос: SELECT * FROM blocks LIMIT 5
```

### Через команду /mcp

1. Введите `/mcp` в чате
2. Выберите сервер `siyuan-mcp`
3. Выберите инструмент из списка
4. Заполните параметры

---

## 📚 Доступные инструменты (52 шт)

### Notebook Management (8)

| Инструмент | Описание |
|------------|----------|
| `list_notebooks` | Показать список всех блокнотов |
| `open_notebook` | Открыть указанный блокнот |
| `close_notebook` | Закрыть указанный блокнот |
| `rename_notebook` | Переименовать блокнот |
| `create_notebook` | Создать новый блокнот |
| `remove_notebook` | Удалить блокнот |
| `get_notebook_conf` | Получить конфигурацию блокнота |
| `set_notebook_conf` | Сохранить конфигурацию блокнота |

### Document Management (9)

| Инструмент | Описание |
|------------|----------|
| `create_doc` | Создать новый документ (Markdown) |
| `rename_doc` | Переименовать документ |
| `rename_doc_by_id` | Переименовать документ по ID |
| `remove_doc` | Удалить документ |
| `remove_doc_by_id` | Удалить документ по ID |
| `move_docs` | Переместить документы |
| `move_docs_by_id` | Переместить документы по ID |
| `get_hpath_by_path` | Получить читаемый путь |
| `get_hpath_by_id` | Получить читаемый путь по ID |

### Block Operations (13)

| Инструмент | Описание |
|------------|----------|
| `insert_block` | Вставить новый блок |
| `prepend_block` | Вставить дочерний блок в начало |
| `append_block` | Вставить дочерний блок в конец |
| `update_block` | Обновить содержимое блока |
| `delete_block` | Удалить блок |
| `move_block` | Переместить блок |
| `get_block_kramdown` | Получить исходный код блока |
| `get_child_blocks` | Получить список дочерних блоков |
| `fold_block` | Свернуть блок |
| `unfold_block` | Развернуть блок |
| `transfer_block_ref` | Переместить ссылки на блок |
| `set_block_attrs` | Установить атрибуты блока |
| `get_block_attrs` | Получить атрибуты блока |

### Остальные инструменты

- **Search & Query (2):** `sql_query`, `flush_transaction`
- **File Operations (5):** `get_file`, `remove_file`, `rename_file`, `read_dir`, `put_file`
- **Export (2):** `export_md_content`, `export_resources`
- **Notifications (2):** `push_msg`, `push_err_msg`
- **System Info (5):** `get_version`, `get_current_time`, `get_boot_progress`, `check_siyuan_status`, `get_workspace_info`
- **Templates (3):** `render_template`, `render_sprig`, `pandoc_convert`
- **Assets (1):** `upload_asset`

---

## 🔧 Troubleshooting

### Qwen Code не видит MCP сервер

**Проверьте:**

```bash
qwen mcp list
```

Если сервер не отображается:

```bash
# Удалите и добавьте заново
qwen mcp remove siyuan-mcp
qwen mcp add -s project -t stdio siyuan-mcp \
  -e SIYUAN_HOST=127.0.0.1 \
  -e SIYUAN_PORT=6806 \
  -e SIYUAN_TOKEN=ваш-токен \
  node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
```

**Перезапустите Qwen Code полностью.**

### Ошибка подключения к SiYuan

1. Убедитесь, что SiYuan Note запущен
2. Проверьте токен в настройках SiYuan
3. Проверьте, что API включён

### Документы не создаются

1. Убедитесь, что блокнот существует:
   ```
   list_notebooks
   ```

2. Откройте блокнот перед созданием:
   ```
   open_notebook {"notebook": "20260129011436-mjq587r"}
   ```

3. Используйте правильный формат:
   ```json
   {
     "notebook": "20260129011436-mjq587r",
     "path": "/dialogs/2026-03-10",
     "markdown": "# Заголовок\n\nСодержимое"
   }
   ```

---

## 📁 Структура проекта

```
siyuan_mcp_server/
├── src/                    # Исходный код TypeScript
│   └── index.ts           # Главный файл MCP сервера
├── dist/                   # Скомпилированный JavaScript
│   └── index.js           # MCP сервер (запускается)
├── .qwen/
│   └── settings.json      # Конфигурация MCP для Qwen
├── package.json           # Зависимости и скрипты
├── QWEN_MCP_SETUP.md      # Подробная инструкция
└── README.md              # Основная документация
```

---

## 🎯 Примеры использования

### Пример 1: Создание ежедневного отчёта

```
Создай документ в блокноте Notes с путём /daily/2026-03-10
и содержанием:

# Отчёт за 10 марта 2026

## Выполнено
- Настройка MCP сервера
- Тестирование инструментов

## Планы
- Интеграция с рабочим процессом
```

### Пример 2: Поиск информации

```
Найди все документы, содержащие слово "MCP" используя SQL-запрос
```

### Пример 3: Организация блокнотов

```
Покажи все блокноты, затем создай новый с названием "Projects"
```

---

## 📖 Дополнительные ресурсы

- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [SiYuan Note API](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)
- [Qwen Code Documentation](https://qwen.ai/docs)

---

**Версия:** 1.0.3  
**Дата обновления:** 10 марта 2026 г.  
**Автор:** xgq18237
