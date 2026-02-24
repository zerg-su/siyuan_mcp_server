#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const SY_HOST = process.env.SIYUAN_HOST || "127.0.0.1";
const SY_PORT = process.env.SIYUAN_PORT || "6806";
const SY_TOKEN = process.env.SIYUAN_TOKEN || "";   // 如果没有令牌就留空
const SY_URL = process.env.SIYUAN_URL;  // Full URL override (e.g., https://siyuan.example.com)

// Use SIYUAN_URL if provided, otherwise construct from host/port
const base = SY_URL || `http://${SY_HOST}:${SY_PORT}`;

const headers: Record<string, string> = { "Content-Type": "application/json" };
if (SY_TOKEN) headers["Authorization"] = `token ${SY_TOKEN}`;

async function api(path: string, body?: any) {
  try {
    console.error(`Calling API: ${base}${path}`);
  const res = await fetch(base + path, {
      method: "POST", // 所有请求都使用 POST 方法
    headers,
      body: JSON.stringify(body || {}), // 总是发送 body，即使是空对象
    });
    
    console.error(`Response status: ${res.status}`);
    console.error(`Response headers:`, Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const text = await res.text();
    console.error(`Response text length: ${text.length}`);
    console.error(`Response text: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
    
    if (!text) {
      throw new Error(`Empty response from server. This usually means:
1. SiYuan API service is not enabled in settings
2. The API endpoint ${path} does not exist
3. Authentication is required but token is invalid`);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`API call failed for ${path}:`, error);
    throw new Error(`Failed to call SiYuan API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/* ---------- Server ---------- */
const server = new Server(
  {
    name: "siyuan-mcp",
    version: "1.0.0",
  },
  { capabilities: { tools: {}, resources: {} } }
);

/* ---------- 工具：思源笔记功能 ---------- */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // 笔记本管理
    {
      name: "list_notebooks",
      description: "Показать список всех блокнотов",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "open_notebook",
      description: "Открыть указанный блокнот",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
        },
        required: ["notebook"],
      },
    },
    {
      name: "close_notebook",
      description: "Закрыть указанный блокнот",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
        },
        required: ["notebook"],
      },
    },
    {
      name: "rename_notebook",
      description: "Переименовать блокнот",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
          name: { type: "string", description: "Новое имя" },
        },
        required: ["notebook", "name"],
      },
    },
    {
      name: "create_notebook",
      description: "Создать новый блокнот",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Имя блокнота" },
        },
        required: ["name"],
      },
    },
    {
      name: "remove_notebook",
      description: "Удалить блокнот",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
        },
        required: ["notebook"],
      },
    },
    {
      name: "get_notebook_conf",
      description: "Получить конфигурацию блокнота",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
        },
        required: ["notebook"],
      },
    },
    {
      name: "set_notebook_conf",
      description: "Сохранить конфигурацию блокнота",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
          conf: { type: "object", description: "笔记本配置" },
        },
        required: ["notebook", "conf"],
      },
    },
    
    // 文档管理
    {
      name: "create_doc",
      description: "Создать новый документ (Markdown) в указанном блокноте",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "笔记本 ID（可选，不提供则使用当前笔记本）" },
          path: { type: "string", description: "Путь к документу (например: /daily/2025-08-03)" },
          markdown: { type: "string", description: "Содержимое в формате Markdown" },
        },
        required: ["path", "markdown"],
      },
    },
    {
      name: "rename_doc",
      description: "Переименовать документ",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
          path: { type: "string", description: "Путь к документу" },
          title: { type: "string", description: "Новый заголовок" },
        },
        required: ["notebook", "path", "title"],
      },
    },
    {
      name: "rename_doc_by_id",
      description: "Переименовать документ по его ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID документа" },
          title: { type: "string", description: "Новый заголовок" },
        },
        required: ["id", "title"],
      },
    },
    {
      name: "remove_doc",
      description: "Удалить документ",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
          path: { type: "string", description: "Путь к документу" },
        },
        required: ["notebook", "path"],
      },
    },
    {
      name: "remove_doc_by_id",
      description: "Удалить документ по его ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID документа" },
        },
        required: ["id"],
      },
    },
    {
      name: "move_docs",
      description: "Переместить документ",
      inputSchema: {
        type: "object",
        properties: {
          fromPaths: { type: "array", items: { type: "string" }, description: "源路径列表" },
          toNotebook: { type: "string", description: "ID целевого блокнота" },
          toPath: { type: "string", description: "Целевой путь" },
        },
        required: ["fromPaths", "toNotebook", "toPath"],
      },
    },
    {
      name: "move_docs_by_id",
      description: "Переместить документ по его ID",
      inputSchema: {
        type: "object",
        properties: {
          fromIDs: { type: "array", items: { type: "string" }, description: "源文档ID列表" },
          toID: { type: "string", description: "目标父文档ID" },
        },
        required: ["fromIDs", "toID"],
      },
    },

    {
      name: "get_hpath_by_path",
      description: "Получить читаемый путь по системному пути",
      inputSchema: {
        type: "object",
        properties: {
          notebook: { type: "string", description: "ID блокнота" },
          path: { type: "string", description: "路径" },
        },
        required: ["notebook", "path"],
      },
    },
    {
      name: "get_hpath_by_id",
      description: "Получить читаемый путь по ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_path_by_id",
      description: "Получить путь сохранения по ID",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_ids_by_hpath",
      description: "Получить ID по читаемому пути",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Человекочитаемый путь" },
          notebook: { type: "string", description: "ID блокнота" },
        },
        required: ["path", "notebook"],
      },
    },
    
    // 块操作
    {
      name: "insert_block",
      description: "Вставить новый блок",
      inputSchema: {
        type: "object",
        properties: {
          dataType: { type: "string", description: "数据类型 (markdown 或 dom)", default: "markdown" },
          data: { type: "string", description: "Содержимое/код" },
          nextID: { type: "string", description: "后一个块的 ID（可选）" },
          previousID: { type: "string", description: "前一个块的 ID（可选）" },
          parentID: { type: "string", description: "父块 ID（可选）" },
        },
        required: ["data"],
      },
    },
    {
      name: "prepend_block",
      description: "Вставить дочерний блок в начало",
      inputSchema: {
        type: "object",
        properties: {
          dataType: { type: "string", description: "数据类型 (markdown 或 dom)", default: "markdown" },
          data: { type: "string", description: "Содержимое/код" },
          parentID: { type: "string", description: "ID родительского блока" },
        },
        required: ["data", "parentID"],
      },
    },
    {
      name: "append_block",
      description: "Вставить дочерний блок в конец",
      inputSchema: {
        type: "object",
        properties: {
          dataType: { type: "string", description: "数据类型 (markdown 或 dom)", default: "markdown" },
          data: { type: "string", description: "Содержимое/код" },
          parentID: { type: "string", description: "ID родительского блока" },
        },
        required: ["data", "parentID"],
      },
    },
    {
      name: "update_block",
      description: "Обновить содержимое блока",
      inputSchema: {
        type: "object",
        properties: {
          dataType: { type: "string", description: "数据类型 (markdown 或 dom)", default: "markdown" },
          data: { type: "string", description: "Новое содержимое" },
          id: { type: "string", description: "ID блока" },
        },
        required: ["data", "id"],
      },
    },
    {
      name: "delete_block",
      description: "Удалить блок",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "move_block",
      description: "Переместить блок",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID перемещаемого блока" },
          previousID: { type: "string", description: "前一个块的 ID（可选）" },
          parentID: { type: "string", description: "父块 ID（可选）" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_block_kramdown",
      description: "Получить исходный код блока (Kramdown)",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "get_child_blocks",
      description: "Получить список дочерний блоков",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID родительского блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "fold_block",
      description: "Свернуть блок",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "unfold_block",
      description: "Развернуть блок",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    {
      name: "transfer_block_ref",
      description: "Переместить ссылки на блок",
      inputSchema: {
        type: "object",
        properties: {
          fromID: { type: "string", description: "定义块 ID" },
          toID: { type: "string", description: "目标块 ID" },
          refIDs: { type: "array", items: { type: "string" }, description: "引用块 ID 列表（可选）" },
        },
        required: ["fromID", "toID"],
      },
    },
    
    // 属性操作
    {
      name: "set_block_attrs",
      description: "Установить атрибуты блока",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
          attrs: { type: "object", description: "属性对象" },
        },
        required: ["id", "attrs"],
      },
    },
    {
      name: "get_block_attrs",
      description: "Получить атрибуты блока",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID блока" },
        },
        required: ["id"],
      },
    },
    
    // 搜索和查询
    {
      name: "sql_query",
      description: "Выполнить SQL запрос к базе данных SiYuan",
      inputSchema: {
        type: "object",
        properties: {
          sql: { type: "string", description: "Строка запроса SQL" },
        },
        required: ["sql"],
      },
    },
    {
      name: "flush_transaction",
      description: "Применить транзакцию (Flush)",
      inputSchema: { type: "object", properties: {} },
    },
    
    // 文件操作
    {
      name: "get_file",
      description: "Получить файл",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Путь к файлу" },
        },
        required: ["path"],
      },
    },
    {
      name: "remove_file",
      description: "Удалить файл",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Путь к файлу" },
        },
        required: ["path"],
      },
    },
    {
      name: "rename_file",
      description: "Переименовать файл",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Путь к файлу" },
          newPath: { type: "string", description: "新文件路径" },
        },
        required: ["path", "newPath"],
      },
    },
    {
      name: "read_dir",
      description: "Показать список файлов в папке",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "文件夹路径" },
        },
        required: ["path"],
      },
    },
    {
      name: "put_file",
      description: "Сохранить (записать) в файл",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Путь к файлу" },
          isDir: { type: "boolean", description: "是否为创建文件夹", default: false },
          modTime: { type: "number", description: "最近访问和修改时间（Unix time）" },
          file: { type: "string", description: "文件内容" },
        },
        required: ["path"],
      },
    },
    
    // 导出功能
    {
      name: "export_md_content",
      description: "Экспортировать документ в Markdown",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "要导出的文档块 ID" },
        },
        required: ["id"],
      },
    },
    {
      name: "export_resources",
      description: "Экспортировать файлы и папки",
      inputSchema: {
        type: "object",
        properties: {
          paths: { type: "array", items: { type: "string" }, description: "要导出的文件或文件夹路径列表" },
          name: { type: "string", description: "导出的文件名（可选）" },
        },
        required: ["paths"],
      },
    },
    
    // 通知功能
    {
      name: "push_msg",
      description: "Отправить системное уведомление",
      inputSchema: {
        type: "object",
        properties: {
          msg: { type: "string", description: "消息内容" },
          timeout: { type: "number", description: "显示时间（毫秒，可选）" },
        },
        required: ["msg"],
      },
    },
    {
      name: "push_err_msg",
      description: "Отправить уведомление об ошибке",
      inputSchema: {
        type: "object",
        properties: {
          msg: { type: "string", description: "错误消息内容" },
          timeout: { type: "number", description: "显示时间（毫秒，可选）" },
        },
        required: ["msg"],
      },
    },
    
    // 系统信息

    {
      name: "get_version",
      description: "Получить версию SiYuan",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_current_time",
      description: "Получить текущее системное время сервера",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_boot_progress",
      description: "Узнать процесс загрузки базы",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "check_siyuan_status",
      description: "Проверить статус SiYuan и доступность API",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "get_workspace_info",
      description: "Получить информацию о Workspace",
      inputSchema: { type: "object", properties: {} },
    },
    
    // 模板功能
    {
      name: "render_template",
      description: "Сгенерировать по шаблону",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "调用渲染所在的文档 ID" },
          path: { type: "string", description: "模板文件绝对路径" },
        },
        required: ["id", "path"],
      },
    },
    {
      name: "render_sprig",
      description: "Сгенерировать через Sprig",
      inputSchema: {
        type: "object",
        properties: {
          template: { type: "string", description: "模板内容" },
        },
        required: ["template"],
      },
    },
    
    // 转换功能
    {
      name: "pandoc_convert",
      description: "Конвертация через Pandoc",
      inputSchema: {
        type: "object",
        properties: {
          dir: { type: "string", description: "工作目录" },
          args: { type: "array", items: { type: "string" }, description: "Pandoc 命令行参数" },
        },
        required: ["dir", "args"],
      },
    },
    
    // 资源文件
    {
      name: "upload_asset",
      description: "Загрузить ресурсы (assets)",
      inputSchema: {
        type: "object",
        properties: {
          assetsDirPath: { type: "string", description: "资源文件存放的文件夹路径" },
          files: { type: "array", items: { type: "string" }, description: "上传的文件列表" },
        },
        required: ["assetsDirPath", "files"],
      },
    },
  ],
}));

/* ---------- 工具调用 ---------- */
server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
  const { name, arguments: args } = req.params;
  switch (name) {
      // 笔记本管理
    case "list_notebooks": {
        try {
          const data = await api("/api/notebook/lsNotebooks");
          if (data.code === 0 && data.data && data.data.notebooks) {
            return { content: [{ type: "text", text: JSON.stringify(data.data.notebooks, null, 2) }] };
          } else {
            return { content: [{ type: "text", text: `Ошибка при получении списка блокнотов: ${data.msg || 'Неизвестная ошибка'}` }] };
          }
        } catch (error) {
          return { content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }] };
        }
      }
      
      case "open_notebook": {
        if (!args) throw new Error("Необходимы аргументы для вызова open_notebook tool");
        const result = await api("/api/notebook/openNotebook", { notebook: args.notebook });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Блокнот успешно открыт: ${args.notebook}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при открытии: ${result.msg}` }] };
        }
      }
      
      case "close_notebook": {
        if (!args) throw new Error("Необходимы аргументы для вызова close_notebook tool");
        const result = await api("/api/notebook/closeNotebook", { notebook: args.notebook });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Блокнот успешно закрыт: ${args.notebook}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при закрытии: ${result.msg}` }] };
        }
      }
      
      case "rename_notebook": {
        if (!args) throw new Error("Необходимы аргументы для вызова rename_notebook tool");
        const result = await api("/api/notebook/renameNotebook", { 
          notebook: args.notebook, 
          name: args.name 
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Блокнот успешно переименован: ${args.name}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при переименовании: ${result.msg}` }] };
        }
      }
      
      case "create_notebook": {
        if (!args) throw new Error("Необходимы аргументы для вызова create_notebook tool");
        const result = await api("/api/notebook/createNotebook", { name: args.name });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Блокнот успешно создан: ${args.name}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при создании: ${result.msg}` }] };
        }
      }
      
      case "remove_notebook": {
        if (!args) throw new Error("Необходимы аргументы для вызова remove_notebook tool");
        const result = await api("/api/notebook/removeNotebook", { notebook: args.notebook });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Блокнот успешно удален: ${args.notebook}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при удалении: ${result.msg}` }] };
        }
      }
      
      case "get_notebook_conf": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_notebook_conf tool");
        const result = await api("/api/notebook/getNotebookConf", { notebook: args.notebook });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "set_notebook_conf": {
        if (!args) throw new Error("Необходимы аргументы для вызова set_notebook_conf tool");
        const result = await api("/api/notebook/setNotebookConf", { 
          notebook: args.notebook, 
          conf: args.conf 
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 文档管理
    case "create_doc": {
        if (!args) throw new Error("Необходимы аргументы для вызова create_doc tool");
        
        let notebookId = args.notebook;
        if (!notebookId) {
          // 获取当前笔记本 - 这个接口不存在，需要移除
          throw new Error("Пожалуйста, укажите параметр notebook вручную");
        }
        
        const result = await api("/api/filetree/createDocWithMd", {
          notebook: notebookId,
        path: args.path,
        markdown: args.markdown,
      });
        
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Документ успешно создан: ${args.path}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при создании: ${result.msg}` }] };
        }
      }
      
      case "rename_doc": {
        if (!args) throw new Error("Необходимы аргументы для вызова rename_doc tool");
        const result = await api("/api/filetree/renameDoc", {
          notebook: args.notebook,
          path: args.path,
          title: args.title,
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Документ успешно переименован: ${args.title}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при переименовании: ${result.msg}` }] };
        }
      }
      
      case "rename_doc_by_id": {
        if (!args) throw new Error("Необходимы аргументы для вызова rename_doc_by_id tool");
        const result = await api("/api/filetree/renameDocByID", {
          id: args.id,
          title: args.title,
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Документ успешно переименован: ${args.title}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при переименовании: ${result.msg}` }] };
        }
      }
      
      case "remove_doc": {
        if (!args) throw new Error("Необходимы аргументы для вызова remove_doc tool");
        const result = await api("/api/filetree/removeDoc", {
          notebook: args.notebook,
          path: args.path,
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Документ успешно удален: ${args.path}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при удалении: ${result.msg}` }] };
        }
      }
      
      case "remove_doc_by_id": {
        if (!args) throw new Error("Необходимы аргументы для вызова remove_doc_by_id tool");
        const result = await api("/api/filetree/removeDocByID", { id: args.id });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ Документ успешно удален: ${args.id}` }] };
        } else {
          return { content: [{ type: "text", text: `❌ Ошибка при удалении: ${result.msg}` }] };
        }
      }
      
      case "move_docs": {
        if (!args) throw new Error("Необходимы аргументы для вызова move_docs tool");
        const result = await api("/api/filetree/moveDocs", {
          fromPaths: args.fromPaths,
          toNotebook: args.toNotebook,
          toPath: args.toPath,
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ 文档移动成功` }] };
        } else {
          return { content: [{ type: "text", text: `❌ 移动失败: ${result.msg}` }] };
        }
      }
      
      case "move_docs_by_id": {
        if (!args) throw new Error("Необходимы аргументы для вызова move_docs_by_id tool");
        const result = await api("/api/filetree/moveDocsByID", {
          fromIDs: args.fromIDs,
          toID: args.toID,
        });
        if (result.code === 0) {
          return { content: [{ type: "text", text: `✅ 文档移动成功` }] };
        } else {
          return { content: [{ type: "text", text: `❌ 移动失败: ${result.msg}` }] };
        }
      }
      

      
      case "get_hpath_by_path": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_hpath_by_path tool");
        const result = await api("/api/filetree/getHPathByPath", {
          notebook: args.notebook,
          path: args.path,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_hpath_by_id": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_hpath_by_id tool");
        const result = await api("/api/filetree/getHPathByID", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_path_by_id": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_path_by_id tool");
        const result = await api("/api/filetree/getPathByID", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_ids_by_hpath": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_ids_by_hpath tool");
        const result = await api("/api/filetree/getIDsByHPath", {
          path: args.path,
          notebook: args.notebook,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 块操作
      case "insert_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова insert_block tool");
        const params: any = {
          dataType: args.dataType || "markdown",
          data: args.data,
        };
        if (args.nextID) params.nextID = args.nextID;
        if (args.previousID) params.previousID = args.previousID;
        if (args.parentID) params.parentID = args.parentID;
        
        const result = await api("/api/block/insertBlock", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "prepend_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова prepend_block tool");
        const result = await api("/api/block/prependBlock", {
          dataType: args.dataType || "markdown",
          data: args.data,
          parentID: args.parentID,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "append_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова append_block tool");
        const result = await api("/api/block/appendBlock", {
          dataType: args.dataType || "markdown",
          data: args.data,
          parentID: args.parentID,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "update_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова update_block tool");
        const result = await api("/api/block/updateBlock", {
          dataType: args.dataType || "markdown",
          data: args.data,
          id: args.id,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "delete_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова delete_block tool");
        const result = await api("/api/block/deleteBlock", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "move_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова move_block tool");
        const params: any = { id: args.id };
        if (args.previousID) params.previousID = args.previousID;
        if (args.parentID) params.parentID = args.parentID;
        
        const result = await api("/api/block/moveBlock", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_block_kramdown": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_block_kramdown tool");
        const result = await api("/api/block/getBlockKramdown", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_child_blocks": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_child_blocks tool");
        const result = await api("/api/block/getChildBlocks", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "fold_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова fold_block tool");
        const result = await api("/api/block/foldBlock", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "unfold_block": {
        if (!args) throw new Error("Необходимы аргументы для вызова unfold_block tool");
        const result = await api("/api/block/unfoldBlock", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "transfer_block_ref": {
        if (!args) throw new Error("Необходимы аргументы для вызова transfer_block_ref tool");
        const params: any = {
          fromID: args.fromID,
          toID: args.toID,
        };
        if (args.refIDs) params.refIDs = args.refIDs;
        
        const result = await api("/api/block/transferBlockRef", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 属性操作
      case "set_block_attrs": {
        if (!args) throw new Error("Необходимы аргументы для вызова set_block_attrs tool");
        const result = await api("/api/attr/setBlockAttrs", {
          id: args.id,
          attrs: args.attrs,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_block_attrs": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_block_attrs tool");
        const result = await api("/api/attr/getBlockAttrs", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 搜索和查询
      case "sql_query": {
        if (!args) throw new Error("Необходимы аргументы для вызова sql_query tool");
        const result = await api("/api/query/sql", { stmt: args.sql });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "flush_transaction": {
        const result = await api("/api/sqlite/flushTransaction");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 文件操作
      case "get_file": {
        if (!args) throw new Error("Необходимы аргументы для вызова get_file tool");
        const result = await api("/api/file/getFile", { path: args.path });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "remove_file": {
        if (!args) throw new Error("Необходимы аргументы для вызова remove_file tool");
        const result = await api("/api/file/removeFile", { path: args.path });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "rename_file": {
        if (!args) throw new Error("Необходимы аргументы для вызова rename_file tool");
        const result = await api("/api/file/renameFile", {
          path: args.path,
          newPath: args.newPath,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "read_dir": {
        if (!args) throw new Error("Необходимы аргументы для вызова read_dir tool");
        const result = await api("/api/file/readDir", { path: args.path });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "put_file": {
        if (!args) throw new Error("Необходимы аргументы для вызова put_file tool");
        const params: any = { path: args.path };
        if (args.isDir !== undefined) params.isDir = args.isDir;
        if (args.modTime) params.modTime = args.modTime;
        if (args.file) params.file = args.file;
        
        const result = await api("/api/file/putFile", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 导出功能
      case "export_md_content": {
        if (!args) throw new Error("Необходимы аргументы для вызова export_md_content tool");
        const result = await api("/api/export/exportMdContent", { id: args.id });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "export_resources": {
        if (!args) throw new Error("Необходимы аргументы для вызова export_resources tool");
        const params: any = { paths: args.paths };
        if (args.name) params.name = args.name;
        
        const result = await api("/api/export/exportResources", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 通知功能
      case "push_msg": {
        if (!args) throw new Error("Необходимы аргументы для вызова push_msg tool");
        const params: any = { msg: args.msg };
        if (args.timeout) params.timeout = args.timeout;
        
        const result = await api("/api/notification/pushMsg", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "push_err_msg": {
        if (!args) throw new Error("Необходимы аргументы для вызова push_err_msg tool");
        const params: any = { msg: args.msg };
        if (args.timeout) params.timeout = args.timeout;
        
        const result = await api("/api/notification/pushErrMsg", params);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 系统信息

      
      case "get_version": {
        const result = await api("/api/system/version");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_current_time": {
        const result = await api("/api/system/currentTime");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "get_boot_progress": {
        const result = await api("/api/system/bootProgress");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
              case "check_siyuan_status": {
          const status: {
            version: any;
            systemInfo: any;
            notebooks: any;
            sqlQuery: any;
            errors: string[];
          } = {
            version: null,
            systemInfo: null,
            notebooks: null,
            sqlQuery: null,
            errors: []
          };
          
          try {
            status.version = await api("/api/system/version");
          } catch (error) {
            status.errors.push(`版本检查失败: ${error instanceof Error ? error.message : String(error)}`);
          }
          

          
          try {
            status.notebooks = await api("/api/notebook/lsNotebooks");
          } catch (error) {
            status.errors.push(`笔记本列表检查失败: ${error instanceof Error ? error.message : String(error)}`);
          }
          
          try {
            status.sqlQuery = await api("/api/query/sql", { stmt: "SELECT 1" });
          } catch (error) {
            status.errors.push(`SQL 查询检查失败: ${error instanceof Error ? error.message : String(error)}`);
          }
          
          const summary = `
=== Проверка статуса SiYuan ===

✅ Работающие API:
${status.version ? '- API версии системы' : ''}
${status.sqlQuery ? '- API SQL-запросов' : ''}

❌ Неработающие API:
${status.notebooks ? '' : '- 笔记本列表 API'}
${status.errors.length > 0 ? status.errors.map(e => `- ${e}`).join('\n') : ''}

Рекомендуемые действия:
1. Убедитесь, что в SiYuan открыт хотя бы один блокнот
2. Проверьте настройки доступов API
3. Попробуйте перезапустить SiYuan
4. Если проблема сохраняется, возможно, нужно пересоздать API-токен

Подробный статус: ${JSON.stringify(status, null, 2)}
          `;
          
          return { content: [{ type: "text", text: summary }] };
        }
        
              case "get_workspace_info": {
        const info = {
          connection: {
            host: SY_HOST,
            port: SY_PORT,
            baseUrl: base,
            hasToken: !!SY_TOKEN,
            usingCustomUrl: !!SY_URL
          },
          workspace: {
            path: "未设置",
            description: "工作空间路径已移除，使用相对路径"
          },
          environment: {
            SIYUAN_URL: SY_URL || "未设置",
            SIYUAN_HOST: SY_HOST,
            SIYUAN_PORT: SY_PORT,
            SIYUAN_TOKEN: SY_TOKEN ? "已设置" : "未设置",
            SIYUAN_WORKSPACE: "已移除"
          }
        };
        
        const summary = `
=== 工作空间和连接信息 ===

🔗 连接信息:
- 主机: ${info.connection.host}
- 端口: ${info.connection.port}
- 基础URL: ${info.connection.baseUrl}
- 令牌状态: ${info.connection.hasToken ? '已设置' : '未设置'}
- 使用自定义URL: ${info.connection.usingCustomUrl ? '是' : '否'}

📁 工作空间:
- 路径: ${info.workspace.path}
- 状态: ${info.workspace.description}

⚙️ 环境变量:
${Object.entries(info.environment).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

💡 建议:
1. 如果访问远程思源笔记，请设置 SIYUAN_URL (推荐) 或 SIYUAN_HOST
2. 如果使用非默认端口，请设置 SIYUAN_PORT
3. 确保 SIYUAN_TOKEN 已正确设置

详细配置: ${JSON.stringify(info, null, 2)}
        `;
        
        return { content: [{ type: "text", text: summary }] };
      }
      
      // 模板功能
      case "render_template": {
        if (!args) throw new Error("Необходимы аргументы для вызова render_template tool");
        const result = await api("/api/template/render", {
          id: args.id,
          path: args.path,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      case "render_sprig": {
        if (!args) throw new Error("Необходимы аргументы для вызова render_sprig tool");
        const result = await api("/api/template/renderSprig", {
          template: args.template,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 转换功能
      case "pandoc_convert": {
        if (!args) throw new Error("Необходимы аргументы для вызова pandoc_convert tool");
        const result = await api("/api/convert/pandoc", {
          dir: args.dir,
          args: args.args,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      // 资源文件
      case "upload_asset": {
        if (!args) throw new Error("Необходимы аргументы для вызова upload_asset tool");
        const result = await api("/api/asset/upload", {
          assetsDirPath: args.assetsDirPath,
          files: args.files,
        });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error("Tool call failed:", error);
    return { 
      content: [{ 
        type: "text", 
        text: `Error: ${error instanceof Error ? error.message : String(error)}` 
      }] 
    };
  }
});

/* ---------- 资源：思源笔记数据资源 ---------- */
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "siyuan://recent",
      name: "最近 10 篇文档",
      mimeType: "application/json",
    },
    {
      uri: "siyuan://notebooks",
      name: "所有笔记本列表",
      mimeType: "application/json",
    },


  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async ({ params: { uri } }) => {
  try {
    switch (uri) {
      case "siyuan://recent": {
    const sql = `SELECT * FROM blocks WHERE type = 'd' ORDER BY created DESC LIMIT 10`;
    const res = await api("/api/query/sql", { stmt: sql });
    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(res.data, null, 2) }] };
  }
      
      case "siyuan://notebooks": {
        const res = await api("/api/notebook/lsNotebooks");
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(res, null, 2) }] };
      }
      

      

      
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    console.error("Resource read failed:", error);
    return { 
      contents: [{ 
        uri, 
        mimeType: "text/plain", 
        text: `Error: ${error instanceof Error ? error.message : String(error)}` 
      }] 
    };
  }
});

/* ---------- 启动 ---------- */
const transport = new StdioServerTransport();
server.connect(transport);
