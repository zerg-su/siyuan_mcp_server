# Установка и настройка MCP сервера SiYuan для Qwen Code

Это руководство описывает процесс подключения MCP сервера SiYuan к Qwen Code для управления блокнотами и документами.

---

## 📋 Оглавление

1. [Требования](#требования)
2. [Установка MCP сервера](#установка-mcp-сервера)
3. [Настройка в Qwen Code](#настройка-в-qwen-code)
4. [Проверка подключения](#проверка-подключения)
5. [Использование инструментов](#использование-инструментов)
6. [Troubleshooting](#troubleshooting)

---

## Требования

Перед началом убедитесь, что у вас установлены:

| Компонент | Версия | Как проверить |
|-----------|--------|---------------|
| **Node.js** | >= 18.0.0 | `node --version` |
| **SiYuan Note** | Любая современная | Запущен и доступен |
| **Qwen Code** | Последняя | Установлен и настроен |

### Подготовка SiYuan Note

1. Откройте **SiYuan Note**
2. Перейдите в **Настройки** → **О программе** → **API токен**
3. Скопируйте или создайте новый токен
4. Убедитесь, что API включён в настройках

---

## Установка MCP сервера

### Вариант 1: Из исходного кода (разработка)

```bash
# Клонирование репозитория
git clone https://github.com/xgq18237/siyuan_mcp_server.git
cd siyuan_mcp_server

# Установка зависимостей
npm install

# Сборка проекта
npm run build
```

### Вариант 2: Из npm (готовая установка)

```bash
npm install -g siyuan-mcp
```

---

## Настройка в Qwen Code

### Шаг 1: Добавление MCP сервера через CLI

Qwen Code предоставляет встроенную команду для управления MCP серверами:

```bash
# Перейдите в директорию проекта
cd C:\Users\zak\Documents\Projects\siyuan_mcp_server

# Добавьте MCP сервер
qwen mcp add -s project -t stdio siyuan-mcp node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
```

### Шаг 2: Настройка переменных окружения

После добавления сервера настройте переменные окружения:

```bash
# Откройте файл .qwen/settings.json в проекте
# Добавьте секцию env:

{
  "mcpServers": {
    "siyuan-mcp": {
      "command": "node",
      "args": ["C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js"],
      "env": {
        "SIYUAN_HOST": "127.0.0.1",
        "SIYUAN_PORT": "6806",
        "SIYUAN_TOKEN": "ваш-токен-из-siyuan"
      }
    }
  }
}
```

### Шаг 3: Альтернативный способ - ручное добавление

1. Откройте Qwen Code
2. Введите команду `/mcp`
3. Нажмите **"Add Server"** или **"Добавить сервер"**
4. Выберите **"Manual"** (Вручную)
5. Заполните параметры:

| Поле | Значение |
|------|----------|
| **Name** | `siyuan-mcp` |
| **Type** | `stdio` |
| **Command** | `node` |
| **Args** | `C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js` |
| **Environment Variables** | См. ниже |

**Переменные окружения:**

```
SIYUAN_HOST=127.0.0.1
SIYUAN_PORT=6806
SIYUAN_TOKEN=ваш-токен-из-siyuan
```

---

## Проверка подключения

### Команда 1: Проверка списка серверов

```bash
qwen mcp list
```

**Ожидаемый вывод:**

```
Configured MCP servers:
✓ siyuan-mcp: node C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js (stdio) - Connected
```

### Команда 2: Тест через Qwen Code

В чате Qwen Code введите:

```
Покажи список всех блокнотов в SiYuan
```

Или используйте команду:

```
/mcp → siyuan-mcp → list_notebooks
```

---

## Использование инструментов

### Основные инструменты для работы с блокнотами

| Инструмент | Описание | Пример |
|------------|----------|--------|
| `list_notebooks` | Список всех блокнотов | `list_notebooks` |
| `open_notebook` | Открыть блокнот | `open_notebook {"notebook": "ID"}` |
| `close_notebook` | Закрыть блокнот | `close_notebook {"notebook": "ID"}` |
| `create_notebook` | Создать блокнот | `create_notebook {"name": "My Notebook"}` |
| `rename_notebook` | Переименовать | `rename_notebook {"notebook": "ID", "name": "New Name"}` |
| `remove_notebook` | Удалить блокнот | `remove_notebook {"notebook": "ID"}` |

### Инструменты для работы с документами

| Инструмент | Описание | Пример |
|------------|----------|--------|
| `create_doc` | Создать документ | `create_doc {"notebook": "ID", "path": "/doc", "markdown": "# Title"}` |
| `rename_doc` | Переименовать | `rename_doc {"notebook": "ID", "path": "/doc", "title": "New"}` |
| `remove_doc` | Удалить документ | `remove_doc {"notebook": "ID", "path": "/doc"}` |
| `move_docs` | Переместить | `move_docs {"fromPaths": [...], "toNotebook": "ID", "toPath": "/"}` |

### Примеры использования в чате

**Пример 1: Получить список блокнотов**

```
Используй инструмент list_notebooks чтобы показать все блокноты
```

**Пример 2: Создать документ**

```
Создай новый документ в блокноте Notes с названием "Meeting Notes" 
и содержанием "# Встреча\n\nДата: сегодня"
```

**Пример 3: SQL-запрос**

```
Выполни SQL-запрос: SELECT * FROM blocks WHERE type = 'd' LIMIT 5
```

---

## Troubleshooting

### Проблема: Qwen Code не видит MCP сервер

**Решение:**

1. Проверьте, что сервер добавлен:
   ```bash
   qwen mcp list
   ```

2. Если сервер не отображается, добавьте заново:
   ```bash
   qwen mcp add -s project -t stdio siyuan-mcp node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
   ```

3. Перезапустите Qwen Code полностью

### Проблема: Ошибка подключения к SiYuan

**Решение:**

1. Убедитесь, что SiYuan Note запущен
2. Проверьте токен в настройках SiYuan
3. Проверьте переменные окружения в `.qwen/settings.json`:
   ```json
   {
     "mcpServers": {
       "siyuan-mcp": {
         "env": {
           "SIYUAN_HOST": "127.0.0.1",
           "SIYUAN_PORT": "6806",
           "SIYUAN_TOKEN": "правильный-токен"
         }
       }
     }
   }
   ```

### Проблема: Документы не создаются

**Решение:**

1. Убедитесь, что блокнот открыт:
   ```
   Используй open_notebook для открытия блокнота Notes
   ```

2. Проверьте, что указан правильный `notebook` ID:
   ```
   list_notebooks
   ```

3. Используйте полный путь к документу:
   ```json
   {
     "notebook": "20260129011436-mjq587r",
     "path": "/dialogs/2026-03-10",
     "markdown": "# Заголовок"
   }
   ```

### Проблема: SQL-запросы возвращают пустой результат

**Решение:**

Это известная особенность — некоторые запросы могут не работать через MCP. Используйте альтернативные инструменты:

- Вместо `sql_query` используйте `list_notebooks` + `get_hpath_by_id`
- Для поиска документов используйте `get_ids_by_hpath`

---

## Полная конфигурация для копирования

Файл: `.qwen/settings.json`

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

---

## Полезные команды

```bash
# Показать список MCP серверов
qwen mcp list

# Удалить сервер
qwen mcp remove siyuan-mcp

# Добавить сервер с нуля
qwen mcp add -s project -t stdio siyuan-mcp node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js

# Добавить сервер с переменными окружения
qwen mcp add -s project -t stdio siyuan-mcp \
  -e SIYUAN_HOST=127.0.0.1 \
  -e SIYUAN_PORT=6806 \
  -e SIYUAN_TOKEN=ваш-токен \
  node -- C:/Users/zak/Documents/Projects/siyuan_mcp_server/dist/index.js
```

---

## Дополнительные ресурсы

- [Официальная документация MCP](https://modelcontextprotocol.io/)
- [SiYuan API Documentation](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)
- [Qwen Code MCP Documentation](https://qwen.ai/docs/mcp)

---

**Дата обновления:** 10 марта 2026 г.  
**Версия MCP сервера:** 1.0.3
