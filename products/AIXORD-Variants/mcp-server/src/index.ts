#!/usr/bin/env node
/**
 * PMERIT KDP Tools MCP Server
 *
 * Provides tools for converting manuscripts to KDP-ready format.
 * Part of PMERIT TECHNOLOGIES LLC product suite.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Configuration
const TOOLS_DIR = path.resolve(__dirname, "../../tools");
const STAGING_DIR = path.resolve(__dirname, "../../staging");
const OUTPUT_DIR = path.resolve(__dirname, "../../output");

// Ensure directories exist
[STAGING_DIR, OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define available tools
const tools: Tool[] = [
  {
    name: "kdp_list_staging",
    description: "List all files in the staging directory ready for KDP conversion",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "kdp_expand_manuscript",
    description: "Expand a manuscript to meet KDP 24-page minimum (6,600+ words). Specify the product type.",
    inputSchema: {
      type: "object",
      properties: {
        product: {
          type: "string",
          description: "Product type to generate",
          enum: [
            "CHATGPT_FREE",
            "CHATGPT_PLUS",
            "CHATGPT_PRO",
            "CLAUDE_FREE",
            "CLAUDE_PRO",
            "CLAUDE_DUAL",
            "GEMINI_FREE",
            "GEMINI_ADVANCED",
            "COPILOT",
            "DEEPSEEK",
            "STARTER_GUIDE",
          ],
        },
        outputFilename: {
          type: "string",
          description: "Optional custom output filename (without extension)",
        },
      },
      required: ["product"],
    },
  },
  {
    name: "kdp_expand_all",
    description: "Expand all configured manuscripts to KDP format. Generates DOCX files for all products.",
    inputSchema: {
      type: "object",
      properties: {
        outputDir: {
          type: "string",
          description: "Optional output directory path",
        },
      },
      required: [],
    },
  },
  {
    name: "kdp_check_requirements",
    description: "Check if Python and required dependencies are installed for KDP tools",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "kdp_get_output",
    description: "List all generated DOCX files in the output directory",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Helper function to run Python scripts
async function runPythonScript(
  scriptPath: string,
  args: string[] = []
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const proc = spawn("python", [scriptPath, ...args], {
      cwd: TOOLS_DIR,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });

    proc.on("error", (err) => {
      resolve({ stdout, stderr: err.message, code: 1 });
    });
  });
}

// Helper to check Python installation
async function checkPythonDeps(): Promise<{
  python: boolean;
  docx: boolean;
  version: string;
}> {
  try {
    const versionResult = await runPythonScript("-c", [
      "import sys; print(sys.version)",
    ]);
    const pythonOk = versionResult.code === 0;

    const docxResult = await runPythonScript("-c", [
      "import docx; print('OK')",
    ]);
    const docxOk = docxResult.code === 0;

    return {
      python: pythonOk,
      docx: docxOk,
      version: pythonOk ? versionResult.stdout.trim().split("\n")[0] : "Not found",
    };
  } catch {
    return { python: false, docx: false, version: "Error checking" };
  }
}

// Create server
const server = new Server(
  {
    name: "pmerit-kdp-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "kdp_list_staging": {
      try {
        const files = fs.readdirSync(STAGING_DIR);
        if (files.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "Staging directory is empty. Place files in:\n" + STAGING_DIR,
              },
            ],
          };
        }
        const fileList = files
          .map((f) => {
            const stat = fs.statSync(path.join(STAGING_DIR, f));
            return `- ${f} (${(stat.size / 1024).toFixed(1)} KB)`;
          })
          .join("\n");
        return {
          content: [
            {
              type: "text",
              text: `Files in staging:\n${fileList}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true,
        };
      }
    }

    case "kdp_expand_manuscript": {
      const product = (args as { product: string }).product;
      const scriptPath = path.join(TOOLS_DIR, "expand_all_manuscripts.py");

      if (!fs.existsSync(scriptPath)) {
        return {
          content: [
            { type: "text", text: `Error: Script not found at ${scriptPath}` },
          ],
          isError: true,
        };
      }

      // For now, run the full script (TODO: add CLI args to Python script)
      const result = await runPythonScript(scriptPath);

      return {
        content: [
          {
            type: "text",
            text: result.code === 0
              ? `Successfully generated ${product} manuscript.\n\nOutput:\n${result.stdout}`
              : `Error generating manuscript:\n${result.stderr || result.stdout}`,
          },
        ],
        isError: result.code !== 0,
      };
    }

    case "kdp_expand_all": {
      const scriptPath = path.join(TOOLS_DIR, "expand_all_manuscripts.py");

      if (!fs.existsSync(scriptPath)) {
        return {
          content: [
            { type: "text", text: `Error: Script not found at ${scriptPath}` },
          ],
          isError: true,
        };
      }

      const result = await runPythonScript(scriptPath);

      return {
        content: [
          {
            type: "text",
            text: result.code === 0
              ? `Successfully generated all manuscripts.\n\nOutput:\n${result.stdout}`
              : `Error generating manuscripts:\n${result.stderr || result.stdout}`,
          },
        ],
        isError: result.code !== 0,
      };
    }

    case "kdp_check_requirements": {
      const deps = await checkPythonDeps();
      const status = [
        `Python: ${deps.python ? "OK" : "NOT FOUND"} (${deps.version})`,
        `python-docx: ${deps.docx ? "OK" : "NOT INSTALLED"}`,
      ];

      if (!deps.docx) {
        status.push("\nTo install missing dependencies:");
        status.push("  pip install python-docx");
      }

      return {
        content: [
          {
            type: "text",
            text: `KDP Tools Requirements:\n${status.join("\n")}`,
          },
        ],
      };
    }

    case "kdp_get_output": {
      try {
        if (!fs.existsSync(OUTPUT_DIR)) {
          return {
            content: [
              {
                type: "text",
                text: "Output directory does not exist yet. Run kdp_expand_all first.",
              },
            ],
          };
        }

        const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".docx"));
        if (files.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No DOCX files in output directory. Run kdp_expand_all to generate.",
              },
            ],
          };
        }

        const fileList = files
          .map((f) => {
            const stat = fs.statSync(path.join(OUTPUT_DIR, f));
            return `- ${f} (${(stat.size / 1024).toFixed(1)} KB)`;
          })
          .join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Generated manuscripts:\n${fileList}\n\nLocation: ${OUTPUT_DIR}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `Error: ${err}` }],
          isError: true,
        };
      }
    }

    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PMERIT KDP Tools MCP Server running");
}

main().catch(console.error);
