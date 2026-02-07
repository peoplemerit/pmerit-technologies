PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> $dirs = @(
>>   "$root\src\background",
>>   "$root\src\content",
>>   "$root\src\popup\components",
>>   "$root\src\enforcement",
>>   "$root\src\adapters",
>>   "$root\src\storage",
>>   "$root\src\sync",
>>   "$root\src\ui\modals",
>>   "$root\src\ui\components",
>>   "$root\build",
>>   "$root\docs",
>>   "$root\tests"
>> )
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> $dirs | ForEach-Object {
>>   New-Item -ItemType Directory -Force -Path $_ | Out-Null
>> }
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> tree products\aixord-extension /F
Folder PATH listing for volume OS
Volume serial number is EEF5-0AEA
C:\DEV\PMERIT\PMERIT-AI-PLATFORM\PRODUCTS\AIXORD-EXTENSION
├───build
├───docs
├───src
│   ├───adapters
│   ├───background
│   ├───content
│   ├───enforcement
│   ├───popup
│   │   └───components
│   ├───storage
│   ├───sync
│   └───ui
│       ├───components
│       └───modals
└───tests
PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # 1) package.json
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "name": "@aixord/extension",
>>   "private": true,
>>   "version": "1.0.0",
>>   "description": "Application-layer governance enforcement for LLM interactions",
>>   "type": "module",
>>   "scripts": {
>>     "build": "echo \"TODO: build pipeline\"",
>>     "dev": "echo \"TODO: dev pipeline\""
>>   }
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\package.json"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # 2) tsconfig.json
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "extends": "../../tsconfig.base.json",
>>   "compilerOptions": {
>>     "target": "ES2022",
>>     "lib": ["ES2022", "DOM"],
>>     "module": "ESNext",
>>     "moduleResolution": "Bundler",
>>     "strict": true,
>>     "skipLibCheck": true,
>>     "noEmit": true
>>   },
>>   "include": ["src"]
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\tsconfig.json"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # 3) manifest.json (Chrome/Edge)
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "manifest_version": 3,
>>   "name": "AIXORD Enforcement Platform",
>>   "version": "1.0.0",
>>   "description": "Application-layer governance enforcement for LLM interactions",
>>   "permissions": ["storage", "activeTab"],
>>   "host_permissions": [
>>     "https://claude.ai/*",
>>     "https://chat.openai.com/*",
>>     "https://chatgpt.com/*",
>>     "https://gemini.google.com/*"
>>   ],
>>   "background": {
>>     "service_worker": "background.js",
>>     "type": "module"
>>   },
>>   "content_scripts": [
>>     {
>>       "matches": [
>>         "https://claude.ai/*",
>>         "https://chat.openai.com/*",
>>         "https://chatgpt.com/*",
>>         "https://gemini.google.com/*"
>>       ],
>>       "js": ["content.js"],
>>       "css": ["content.css"],
>>       "run_at": "document_idle"
>>     }
>>   ],
>>   "action": {
>>     "default_popup": "popup.html",
>>     "default_icon": {
>>       "16": "icons/icon16.png",
>>       "48": "icons/icon48.png",
>>       "128": "icons/icon128.png"
>>     }
>>   },
>>   "icons": {
>>     "16": "icons/icon16.png",
>>     "48": "icons/icon48.png",
>>     "128": "icons/icon128.png"
>>   },
>>   "web_accessible_resources": [
>>     {
>>       "resources": ["injected.js"],
>>       "matches": [
>>         "https://claude.ai/*",
>>         "https://chat.openai.com/*",
>>         "https://chatgpt.com/*"
>>       ]
>>     }
>>   ]
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\manifest.json"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # 4) manifest.firefox.json (Firefox)
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "manifest_version": 3,
>>   "name": "AIXORD Enforcement Platform",
>>   "version": "1.0.0",
>>   "description": "Application-layer governance enforcement for LLM interactions",
>>   "permissions": ["storage", "activeTab"],
>>   "host_permissions": [
>>     "https://claude.ai/*",
>>     "https://chat.openai.com/*",
>>     "https://chatgpt.com/*",
>>     "https://gemini.google.com/*"
>>   ],
>>   "background": {
>>     "scripts": ["background.js"],
>>     "type": "module"
>>   },
>>   "content_scripts": [
>>     {
>>       "matches": [
>>         "https://claude.ai/*",
>>         "https://chat.openai.com/*",
>>         "https://chatgpt.com/*",
>>         "https://gemini.google.com/*"
>>       ],
>>       "js": ["content.js"],
>>       "css": ["content.css"],
>>       "run_at": "document_idle"
>>     }
>>   ],
>>   "action": {
>>     "default_popup": "popup.html",
>>     "default_icon": {
>>       "16": "icons/icon16.png",
>>       "48": "icons/icon48.png",
>>       "128": "icons/icon128.png"
>>     }
>>   },
>>   "icons": {
>>     "16": "icons/icon16.png",
>>     "48": "icons/icon48.png",
>>     "128": "icons/icon128.png"
>>   }
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\manifest.firefox.json"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # 5) practical folder for icons referenced by manifest
PS C:\DEV\PMERIT\pmerit-ai-platform> New-Item -ItemType Directory -Force -Path "$root\icons" | Out-Null
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   5:52 PM                build
d-----         1/22/2026   5:52 PM                docs
d-----         1/22/2026   5:58 PM                icons
d-----         1/22/2026   5:52 PM                src
d-----         1/22/2026   5:52 PM                tests
-a----         1/22/2026   5:58 PM           1035 manifest.firefox.json
-a----         1/22/2026   5:58 PM           1252 manifest.json
-a----         1/22/2026   5:58 PM            288 package.json
-a----         1/22/2026   5:58 PM            276 tsconfig.json


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/background/messaging.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> export type MessageRequest =
>>   | { type: "PING"; payload?: unknown }
>>   | { type: "AUTH_GET_TOKEN" }
>>   | { type: "AUTH_SET_TOKEN"; token: string }
>>   | { type: "AUTH_CLEAR_TOKEN" };
>>
>> export type MessageResponse =
>>   | { ok: true; data?: unknown }
>>   | { ok: false; error: string };
>>
>> const TOKEN_KEY = "aixord_auth_token";
>>
>> /**
>>  * Storage helpers (MV3 service worker safe).
>>  */
>> export async function getToken(): Promise<string | null> {
>>   const result = await chrome.storage.local.get([TOKEN_KEY]);
>>   return (result[TOKEN_KEY] as string) ?? null;
>> }
>>
>> export async function setToken(token: string): Promise<void> {
>>   await chrome.storage.local.set({ [TOKEN_KEY]: token });
>> }
>>
>> export async function clearToken(): Promise<void> {
>>   await chrome.storage.local.remove([TOKEN_KEY]);
>> }
>>
>> /**
>>  * Main message router for background.
>>  */
>> export async function handleMessage(
>>   req: MessageRequest
>> ): Promise<MessageResponse> {
>>   try {
>>     switch (req.type) {
>>       case "PING":
>>         return { ok: true, data: { pong: true } };
>>
>>       case "AUTH_GET_TOKEN": {
>>         const token = await getToken();
>>         return { ok: true, data: { token } };
>>       }
>>
>>       case "AUTH_SET_TOKEN": {
>>         if (!req.token || typeof req.token !== "string") {
>>           return { ok: false, error: "Missing token" };
>>         }
>>         await setToken(req.token);
>>         return { ok: true };
>>       }
>>
>>       case "AUTH_CLEAR_TOKEN":
>>         await clearToken();
>>         return { ok: true };
>>
>>       default:
>>         return { ok: false, error: "Unknown message type" };
>>     }
>>   } catch (e) {
>>     const msg = e instanceof Error ? e.message : "Unknown error";
>>     return { ok: false, error: msg };
>>   }
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\background\messaging.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/background/auth.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import { getToken } from "./messaging";
>>
>> /**
>>  * Placeholder for extension ↔ webapp auth handshake.
>>  * Claude blueprint calls this out in D2.S6; for now we define the
>>  * minimal surfaces so the codebase has stable import paths.
>>  */
>>
>> export interface AuthStatus {
>>   isAuthenticated: boolean;
>>   token: string | null;
>> }
>>
>> export async function getAuthStatus(): Promise<AuthStatus> {
>>   const token = await getToken();
>>   return { isAuthenticated: Boolean(token), token };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\background\auth.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/background/index.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import { handleMessage } from "./messaging";
>>
>> // MV3 Service Worker entry point.
>> // Routes messages from content scripts/popup to the background layer.
>> chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
>>   // We return true to keep the message channel open for async responses.
>>   (async () => {
>>     const res = await handleMessage(message);
>>     sendResponse(res);
>>   })();
>>
>>   return true;
>> });
>>
>> // Optional: basic install hook for future migrations
>> chrome.runtime.onInstalled.addListener(() => {
>>   console.log("[AIXORD] Background service worker installed");
>> });
>> '@ | Set-Content -Encoding UTF8 "$root\src\background\index.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\src\background


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\src\background


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/22/2026   6:03 PM            473 auth.ts
-a----         1/22/2026   6:03 PM            588 index.ts
-a----         1/22/2026   6:03 PM           1669 messaging.ts


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/content/injector.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> /**
>>  * Inject a JS file into the page context (not the extension isolated world).
>>  * This is useful when the provider UI uses frameworks that block direct hooking.
>>  *
>>  * NOTE: Claude blueprint references injected.js in manifest.web_accessible_resources.
>>  * We'll later configure the build to emit injected.js from TS (or ship a static file).
>>  */
>> export function injectScript(scriptPath: string): void {
>>   try {
>>     const s = document.createElement("script");
>>     s.src = chrome.runtime.getURL(scriptPath);
>>     s.type = "text/javascript";
>>     s.onload = () => s.remove();
>>     (document.head || document.documentElement).appendChild(s);
>>   } catch (e) {
>>     console.warn("[AIXORD] injector failed", e);
>>   }
>> }
>>
>> /**
>>  * Inject CSS into the page (content.css referenced by manifest).
>>  * For now this is a placeholder; later the build can emit content.css or
>>  * we can attach a style tag.
>>  */
>> export function injectStyleTag(cssText: string): void {
>>   const style = document.createElement("style");
>>   style.setAttribute("data-aixord-style", "true");
>>   style.textContent = cssText;
>>   document.head.appendChild(style);
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\content\injector.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/content/observer.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> /**
>>  * Observe DOM changes for provider pages that render dynamically.
>>  * We use this to detect when the send button / input appears, then attach hooks.
>>  */
>> export function observeDom(
>>   onChange: () => void,
>>   options: MutationObserverInit = { childList: true, subtree: true }
>> ): MutationObserver {
>>   const obs = new MutationObserver(() => {
>>     onChange();
>>   });
>>
>>   obs.observe(document.documentElement, options);
>>   return obs;
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\content\observer.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/content/index.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import { observeDom } from "./observer";
>> import { injectScript } from "./injector";
>>
>> /**
>>  * Content script entry point.
>>  * This runs in the extension "isolated world".
>>  * We will later:
>>  * - detect provider (Claude/ChatGPT/Gemini)
>>  * - attach enforcement engine + adapter hooks
>>  * - block send button if gates fail
>>  */
>>
>> function boot(): void {
>>   console.log("[AIXORD] content script loaded");
>>
>>   // If we ever need page-context hooks, injected.js is the placeholder.
>>   // (Manifest lists it as web_accessible_resources for some domains)
>>   // injectScript("injected.js");
>>
>>   // Observe for dynamic UI changes and re-run attach logic.
>>   observeDom(() => {
>>     // Placeholder for adapter attach / re-attach logic.
>>     // console.log("[AIXORD] DOM changed - recheck provider UI elements");
>>   });
>> }
>>
>> boot();
>> '@ | Set-Content -Encoding UTF8 "$root\src\content\index.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\src\content


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\src\content


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/22/2026   6:04 PM            807 index.ts
-a----         1/22/2026   6:04 PM           1114 injector.ts
-a----         1/22/2026   6:04 PM            436 observer.ts


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/popup/index.tsx
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import { createRoot } from "react-dom/client";
>> import React from "react";
>> import { App } from "./App";
>>
>> const el = document.getElementById("root");
>> if (!el) {
>>   throw new Error("Popup root element not found");
>> }
>>
>> createRoot(el).render(
>>   <React.StrictMode>
>>     <App />
>>   </React.StrictMode>
>> );
>> '@ | Set-Content -Encoding UTF8 "$root\src\popup\index.tsx"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/popup/App.tsx
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import React, { useEffect, useState } from "react";
>>
>> type AuthStatus = { isAuthenticated: boolean; token: string | null };
>>
>> async function bg<TReq, TRes>(msg: TReq): Promise<TRes> {
>>   return new Promise((resolve, reject) => {
>>     chrome.runtime.sendMessage(msg, (res) => {
>>       const err = chrome.runtime.lastError;
>>       if (err) return reject(err);
>>       resolve(res);
>>     });
>>   });
>> }
>>
>> export function App() {
>>   const [status, setStatus] = useState<AuthStatus>({ isAuthenticated: false, token: null });
>>
>>   useEffect(() => {
>>     (async () => {
>>       const res = await bg<{ type: "AUTH_GET_TOKEN" }, { ok: boolean; data?: any; error?: string }>({ type: "AUTH_GET_TOKEN" });
>>       if (res.ok) setStatus({ isAuthenticated: Boolean(res.data?.token), token: res.data?.token ?? null });
>>     })();
>>   }, []);
>>
>>   return (
>>     <div style={{ width: 340, padding: 12, fontFamily: "system-ui, sans-serif" }}>
>>       <h1 style={{ margin: 0, fontSize: 14 }}>AIXORD Enforcement Platform</h1>
>>       <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
>>         Status: {status.isAuthenticated ? "Authenticated" : "Not authenticated"}
>>       </p>
>>
>>       <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
>>         <button
>>           onClick={async () => {
>>             await bg({ type: "PING" });
>>             alert("pong");
>>           }}
>>         >
>>           Ping
>>         </button>
>>
>>         <button
>>           onClick={async () => {
>>             await bg({ type: "AUTH_CLEAR_TOKEN" });
>>             setStatus({ isAuthenticated: false, token: null });
>>           }}
>>         >
>>           Clear Token
>>         </button>
>>       </div>
>>
>>       <hr style={{ margin: "12px 0" }} />
>>
>>       <div style={{ fontSize: 12 }}>
>>         <div><b>Next:</b> hook adapters + enforcement engine.</div>
>>       </div>
>>     </div>
>>   );
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\popup\App.tsx"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/popup/components/README.md (placeholder to keep folder intentional)
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> Popup components live here.
>> '@ | Set-Content -Encoding UTF8 "$root\src\popup\components\README.md"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> <!doctype html>
>> <html>
>>   <head>
>>     <meta charset="utf-8" />
>>     <meta name="viewport" content="width=device-width,initial-scale=1" />
>>     <title>AIXORD</title>
>>   </head>
>>   <body>
>>     <div id="root"></div>
>>     <!-- Build pipeline will output popup.js and wire it here -->
>>     <script type="module" src="popup.js"></script>
>>   </body>
>> </html>
>> '@ | Set-Content -Encoding UTF8 "$root\popup.html"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\src\popup


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\src\popup


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   5:52 PM                components
-a----         1/22/2026   6:06 PM           1794 App.tsx
-a----         1/22/2026   6:06 PM            298 index.tsx


PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   5:52 PM                build
d-----         1/22/2026   5:52 PM                docs
d-----         1/22/2026   5:58 PM                icons
d-----         1/22/2026   5:52 PM                src
d-----         1/22/2026   5:52 PM                tests
-a----         1/22/2026   5:58 PM           1035 manifest.firefox.json
-a----         1/22/2026   5:58 PM           1252 manifest.json
-a----         1/22/2026   5:58 PM            288 package.json
-a----         1/22/2026   6:07 PM            345 popup.html
-a----         1/22/2026   5:58 PM            276 tsconfig.json


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/violations.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> export type ViolationSeverity = "INFO" | "WARN" | "BLOCK";
>>
>> export interface Violation {
>>   code: string;               // e.g. "GATE_LIC"
>>   severity: ViolationSeverity;
>>   message: string;
>>   detail?: Record<string, unknown>;
>> }
>>
>> export function block(code: string, message: string, detail?: Record<string, unknown>): Violation {
>>   return { code, severity: "BLOCK", message, detail };
>> }
>>
>> export function warn(code: string, message: string, detail?: Record<string, unknown>): Violation {
>>   return { code, severity: "WARN", message, detail };
>> }
>>
>> export function info(code: string, message: string, detail?: Record<string, unknown>): Violation {
>>   return { code, severity: "INFO", message, detail };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\violations.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/parser.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> /**
>>  * Placeholder prompt parser.
>>  * Later steps will parse AIXORD command blocks, gates, and handoff markers.
>>  */
>> export interface ParsedPrompt {
>>   raw: string;
>>   commands: string[];
>> }
>>
>> export function parsePrompt(raw: string): ParsedPrompt {
>>   const commands: string[] = [];
>>   // Minimal detection: lines that look like COMMANDS
>>   for (const line of raw.split(/\r?\n/)) {
>>     const t = line.trim();
>>     if (!t) continue;
>>     // Rough heuristic: uppercase words with spaces
>>     if (/^[A-Z][A-Z0-9 _:-]{2,}$/.test(t)) commands.push(t);
>>   }
>>   return { raw, commands };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\parser.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/gates.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { Violation } from "./violations";
>> import { block } from "./violations";
>>
>> /**
>>  * Minimal gate status snapshot.
>>  * This mirrors Claude’s concept of "blocking gates" without importing core yet.
>>  */
>> export type GateId = "LIC" | "DIS" | "TIR" | "ENV" | "FLD" | "CIT" | "CON" | "OBJ" | "RA" | "FX" | "PD" | "PR" | "BP" | "MS" | "VA" | "HO";
>>
>> export interface GateState {
>>   [key: string]: 0 | 1;
>> }
>>
>> export interface GateCheckResult {
>>   ok: boolean;
>>   violations: Violation[];
>>   state: GateState;
>> }
>>
>> /**
>>  * Placeholder: until we integrate @aixord/core, we enforce only a simple minimum:
>>  * - LIC and DIS must be passed (1) before proceeding.
>>  */
>> export function checkMinimumGates(state: GateState): GateCheckResult {
>>   const violations: Violation[] = [];
>>   const lic = state["LIC"] ?? 0;
>>   const dis = state["DIS"] ?? 0;
>>
>>   if (lic !== 1) violations.push(block("GATE_LIC", "License gate not passed"));
>>   if (dis !== 1) violations.push(block("GATE_DIS", "Disclaimer gate not accepted"));
>>
>>   return {
>>     ok: violations.filter(v => v.severity === "BLOCK").length === 0,
>>     violations,
>>     state
>>   };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\gates.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/prompt.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { ParsedPrompt } from "./parser";
>> import type { Violation } from "./violations";
>> import { parsePrompt } from "./parser";
>>
>> /**
>>  * Build a structured prompt for the provider, later.
>>  * For now: passthrough with parsed metadata.
>>  */
>> export interface PromptBuildResult {
>>   parsed: ParsedPrompt;
>>   outbound: string;
>>   violations: Violation[];
>> }
>>
>> export function buildPrompt(rawUserInput: string): PromptBuildResult {
>>   const parsed = parsePrompt(rawUserInput);
>>   return {
>>     parsed,
>>     outbound: rawUserInput,
>>     violations: []
>>   };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\prompt.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/blocker.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { Violation } from "./violations";
>>
>> /**
>>  * UI-level decision helper: should we block the send action?
>>  */
>> export function shouldBlock(violations: Violation[]): boolean {
>>   return violations.some(v => v.severity === "BLOCK");
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\blocker.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/setup.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> /**
>>  * Local extension configuration and defaults.
>>  * Later this will load user settings from storage and sync with webapp.
>>  */
>> export interface ExtensionConfig {
>>   strictMode: boolean;
>> }
>>
>> export const DEFAULT_CONFIG: ExtensionConfig = {
>>   strictMode: true
>> };
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\setup.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/counter.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> /**
>>  * Minimal usage counter placeholder (for future telemetry / rate limiting).
>>  * No network calls; storage only.
>>  */
>> const KEY = "aixord_usage_counter";
>>
>> export async function incrementCounter(): Promise<number> {
>>   const res = await chrome.storage.local.get([KEY]);
>>   const n = (res[KEY] as number) ?? 0;
>>   const next = n + 1;
>>   await chrome.storage.local.set({ [KEY]: next });
>>   return next;
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\counter.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/enforcement/engine.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { GateState } from "./gates";
>> import type { Violation } from "./violations";
>> import { checkMinimumGates } from "./gates";
>> import { buildPrompt } from "./prompt";
>>
>> export interface EnforcementInput {
>>   userText: string;
>>   gateState: GateState;
>> }
>>
>> export interface EnforcementOutput {
>>   outboundPrompt: string;
>>   violations: Violation[];
>> }
>>
>> /**
>>  * Core enforcement orchestrator (placeholder).
>>  * Later: integrate @aixord/core formula + full gate chain.
>>  */
>> export function enforce(input: EnforcementInput): EnforcementOutput {
>>   const gateCheck = checkMinimumGates(input.gateState);
>>   const promptBuild = buildPrompt(input.userText);
>>
>>   const violations = [...gateCheck.violations, ...promptBuild.violations];
>>
>>   return {
>>     outboundPrompt: promptBuild.outbound,
>>     violations
>>   };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\enforcement\engine.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\src\enforcement


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\src\enforcement


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/22/2026   6:08 PM            243 blocker.ts
-a----         1/22/2026   6:08 PM            403 counter.ts
-a----         1/22/2026   6:08 PM            800 engine.ts
-a----         1/22/2026   6:08 PM           1112 gates.ts
-a----         1/22/2026   6:08 PM            574 parser.ts
-a----         1/22/2026   6:08 PM            549 prompt.ts
-a----         1/22/2026   6:08 PM            264 setup.ts
-a----         1/22/2026   6:08 PM            700 violations.ts


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/adapters/interface.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> export type ProviderId = "claude" | "chatgpt" | "gemini" | "unknown";
>>
>> export interface ProviderContext {
>>   provider: ProviderId;
>>   url: string;
>> }
>>
>> export interface UiHandles {
>>   /** Text input element (textarea or contenteditable root) */
>>   input: HTMLElement | null;
>>   /** Send/submit button element */
>>   sendButton: HTMLElement | null;
>> }
>>
>> export interface ProviderAdapter {
>>   id: ProviderId;
>>
>>   /** Returns true if the current page appears to match this provider */
>>   matches(location: Location): boolean;
>>
>>   /** Find key UI elements (input + send). Called repeatedly due to dynamic UIs. */
>>   findUi(): UiHandles;
>>
>>   /** Optional: attempt to write text into the provider input */
>>   setInputText?(text: string, handles: UiHandles): void;
>>
>>   /** Optional: attempt to click the send button */
>>   clickSend?(handles: UiHandles): void;
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\adapters\interface.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/adapters/detector.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { ProviderAdapter, ProviderId } from "./interface";
>> import { claudeAdapter } from "./claude";
>> import { chatgptAdapter } from "./chatgpt";
>> import { geminiAdapter } from "./gemini";
>>
>> const adapters: ProviderAdapter[] = [claudeAdapter, chatgptAdapter, geminiAdapter];
>>
>> export function detectProvider(location: Location = window.location): ProviderAdapter {
>>   for (const a of adapters) {
>>     if (a.matches(location)) return a;
>>   }
>>   return {
>>     id: "unknown" as ProviderId,
>>     matches: () => false,
>>     findUi: () => ({ input: null, sendButton: null })
>>   };
>> }
>> '@ | Set-Content -Encoding UTF8 "$root\src\adapters\detector.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/adapters/claude.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { ProviderAdapter, UiHandles } from "./interface";
>>
>> function q<T extends Element = Element>(sel: string): T | null {
>>   return document.querySelector(sel) as T | null;
>> }
>>
>> /**
>>  * Claude selectors may change; these are placeholders for wiring.
>>  * We'll harden these later with robust heuristics.
>>  */
>> export const claudeAdapter: ProviderAdapter = {
>>   id: "claude",
>>
>>   matches(location) {
>>     return location.host === "claude.ai";
>>   },
>>
>>   findUi(): UiHandles {
>>     // Claude commonly uses a textarea in the composer area.
>>     const input =
>>       q<HTMLTextAreaElement>('textarea') ??
>>       q<HTMLElement>('[contenteditable="true"]');
>>
>>     // Send button is often a button near composer with aria-label.
>>     const sendButton =
>>       q<HTMLButtonElement>('button[aria-label*="Send"]') ??
>>       q<HTMLButtonElement>('button[type="submit"]');
>>
>>     return { input, sendButton };
>>   },
>>
>>   setInputText(text, handles) {
>>     if (!handles.input) return;
>>
>>     if (handles.input instanceof HTMLTextAreaElement) {
>>       handles.input.value = text;
>>       handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>       return;
>>     }
>>
>>     // contenteditable fallback
>>     handles.input.textContent = text;
>>     handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>   },
>>
>>   clickSend(handles) {
>>     handles.sendButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
>>   }
>> };
>> '@ | Set-Content -Encoding UTF8 "$root\src\adapters\claude.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/adapters/chatgpt.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { ProviderAdapter, UiHandles } from "./interface";
>>
>> function q<T extends Element = Element>(sel: string): T | null {
>>   return document.querySelector(sel) as T | null;
>> }
>>
>> /**
>>  * ChatGPT selectors may change; placeholders for wiring.
>>  */
>> export const chatgptAdapter: ProviderAdapter = {
>>   id: "chatgpt",
>>
>>   matches(location) {
>>     return location.host === "chat.openai.com" || location.host === "chatgpt.com";
>>   },
>>
>>   findUi(): UiHandles {
>>     // ChatGPT often uses a textarea with id or data-testid
>>     const input =
>>       q<HTMLTextAreaElement>('textarea') ??
>>       q<HTMLElement>('[contenteditable="true"]');
>>
>>     // Send button often has data-testid or aria-label
>>     const sendButton =
>>       q<HTMLButtonElement>('button[data-testid="send-button"]') ??
>>       q<HTMLButtonElement>('button[aria-label*="Send"]') ??
>>       q<HTMLButtonElement>('button[type="submit"]');
>>
>>     return { input, sendButton };
>>   },
>>
>>   setInputText(text, handles) {
>>     if (!handles.input) return;
>>
>>     if (handles.input instanceof HTMLTextAreaElement) {
>>       handles.input.value = text;
>>       handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>       return;
>>     }
>>
>>     handles.input.textContent = text;
>>     handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>   },
>>
>>   clickSend(handles) {
>>     handles.sendButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
>>   }
>> };
>> '@ | Set-Content -Encoding UTF8 "$root\src\adapters\chatgpt.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # src/adapters/gemini.ts
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import type { ProviderAdapter, UiHandles } from "./interface";
>>
>> function q<T extends Element = Element>(sel: string): T | null {
>>   return document.querySelector(sel) as T | null;
>> }
>>
>> /**
>>  * Gemini selectors may change; placeholders for wiring.
>>  */
>> export const geminiAdapter: ProviderAdapter = {
>>   id: "gemini",
>>
>>   matches(location) {
>>     return location.host === "gemini.google.com";
>>   },
>>
>>   findUi(): UiHandles {
>>     const input =
>>       q<HTMLTextAreaElement>('textarea') ??
>>       q<HTMLElement>('[contenteditable="true"]');
>>
>>     const sendButton =
>>       q<HTMLButtonElement>('button[aria-label*="Send"]') ??
>>       q<HTMLButtonElement>('button[type="submit"]');
>>
>>     return { input, sendButton };
>>   },
>>
>>   setInputText(text, handles) {
>>     if (!handles.input) return;
>>
>>     if (handles.input instanceof HTMLTextAreaElement) {
>>       handles.input.value = text;
>>       handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>       return;
>>     }
>>
>>     handles.input.textContent = text;
>>     handles.input.dispatchEvent(new Event("input", { bubbles: true }));
>>   },
>>
>>   clickSend(handles) {
>>     handles.sendButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
>>   }
>> };
>> '@ | Set-Content -Encoding UTF8 "$root\src\adapters\gemini.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\src\adapters


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\src\adapters


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/22/2026   6:11 PM           1405 chatgpt.ts
-a----         1/22/2026   6:11 PM           1402 claude.ts
-a----         1/22/2026   6:11 PM            574 detector.ts
-a----         1/22/2026   6:11 PM           1187 gemini.ts
-a----         1/22/2026   6:11 PM            839 interface.ts


PS C:\DEV\PMERIT\pmerit-ai-platform> $root = "products\aixord-extension"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> import { observeDom } from "./observer";
>> import { detectProvider } from "../adapters/detector";
>>
>> function logHandles(providerId: string, input: HTMLElement | null, sendButton: HTMLElement | null) {
>>   const hasInput = Boolean(input);
>>   const hasSend = Boolean(sendButton);
>>   console.log(`[AIXORD] provider=${providerId} input=${hasInput} send=${hasSend}`);
>> }
>>
>> function attach(): void {
>>   const adapter = detectProvider(window.location);
>>   const { input, sendButton } = adapter.findUi();
>>
>>   // Lightweight verification only
>>   logHandles(adapter.id, input, sendButton);
>>
>>   // Later: enforcement will wrap send behavior and rewrite prompt.
>>   // For now, we stop here to avoid drift.
>> }
>>
>> function boot(): void {
>>   console.log("[AIXORD] content script loaded");
>>
>>   // Initial attach
>>   attach();
>>
>>   // Re-attach on DOM changes (provider UIs are dynamic)
>>   observeDom(() => {
>>     attach();
>>   });
>> }
>>
>> boot();
>> '@ | Set-Content -Encoding UTF8 "$root\src\content\index.ts"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> type products\aixord-extension\src\content\index.ts
import { observeDom } from "./observer";
import { detectProvider } from "../adapters/detector";

function logHandles(providerId: string, input: HTMLElement | null, sendButton: HTMLElement | null) {
  const hasInput = Boolean(input);
  const hasSend = Boolean(sendButton);
  console.log(`[AIXORD] provider=${providerId} input=${hasInput} send=${hasSend}`);
}

function attach(): void {
  const adapter = detectProvider(window.location);
  const { input, sendButton } = adapter.findUi();

  // Lightweight verification only
  logHandles(adapter.id, input, sendButton);

  // Later: enforcement will wrap send behavior and rewrite prompt.
  // For now, we stop here to avoid drift.
}

function boot(): void {
  console.log("[AIXORD] content script loaded");

  // Initial attach
  attach();

  // Re-attach on DOM changes (provider UIs are dynamic)
  observeDom(() => {
    attach();
  });
}

boot();
PS C:\DEV\PMERIT\pmerit-ai-platform> import { observeDom } from "./observer";
import : The term 'import' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a
path was included, verify that the path is correct and try again.
At line:1 char:1
+ import { observeDom } from "./observer";
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (import:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\DEV\PMERIT\pmerit-ai-platform> import { detectProvider } from "../adapters/detector";
import : The term 'import' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a
path was included, verify that the path is correct and try again.
At line:1 char:1
+ import { detectProvider } from "../adapters/detector";
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (import:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\DEV\PMERIT\pmerit-ai-platform> cd products\aixord-extension
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> pnpm add -D esbuild typescript @types/chrome react react-dom
pnpm : The term 'pnpm' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path
was included, verify that the path is correct and try again.
At line:1 char:1
+ pnpm add -D esbuild typescript @types/chrome react react-dom
+ ~~~~
    + CategoryInfo          : ObjectNotFound: (pnpm:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>

PS C:\DEV\PMERIT\pmerit-ai-platform> # Install pnpm globally
PS C:\DEV\PMERIT\pmerit-ai-platform> npm install -g pnpm

added 1 package in 4s

1 package is looking for funding
  run `npm fund` for details
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Verify
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm -v
10.28.1
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Install dev dependencies
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> pnpm add -D typescript esbuild @types/chrome
Packages: +7
+++++++
Progress: resolved 32, reused 0, downloaded 7, added 7, done

devDependencies:
+ @types/chrome 0.1.36
+ esbuild 0.27.2
+ typescript 5.9.3

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild@0.27.2.                                                   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 2.4s using pnpm v10.28.1
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> pnpm add -D react react-dom @types/react @types/react-dom
Packages: +6
++++++
Progress: resolved 38, reused 7, downloaded 6, added 6, done

devDependencies:
+ @types/react 19.2.9
+ @types/react-dom 19.2.3
+ react 19.2.3
+ react-dom 19.2.3

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild@0.27.2.                                                   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 1.6s using pnpm v10.28.1
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Should show node_modules folder
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> dir


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   5:52 PM                build
d-----         1/22/2026   5:52 PM                docs
d-----         1/22/2026   5:58 PM                icons
d-----         1/22/2026   7:45 PM                node_modules
d-----         1/22/2026   5:52 PM                src
d-----         1/22/2026   5:52 PM                tests
-a----         1/22/2026   5:58 PM           1035 manifest.firefox.json
-a----         1/22/2026   5:58 PM           1252 manifest.json
-a----         1/22/2026   7:45 PM            515 package.json
-a----         1/22/2026   7:45 PM          11438 pnpm-lock.yaml
-a----         1/22/2026   6:07 PM            345 popup.html
-a----         1/22/2026   5:58 PM            276 tsconfig.json


PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Check package.json has dependencies listed
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> type package.json
{
  "name": "@aixord/extension",
  "private": true,
  "version": "1.0.0",
  "description": "Application-layer governance enforcement for LLM interactions",
  "type": "module",
  "scripts": {
    "build": "echo \"TODO: build pipeline\"",
    "dev": "echo \"TODO: dev pipeline\""
  },
  "devDependencies": {
    "@types/chrome": "^0.1.36",
    "@types/react": "^19.2.9",
    "@types/react-dom": "^19.2.3",
    "esbuild": "^0.27.2",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "typescript": "^5.9.3"
  }
}
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> pnpm approve-builds
√ Choose which packages to build (Press <space> to select, <a> to toggle all, <i> to invert selection) · No items were selected
All packages were added to ignoredBuiltDependencies.
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Go to monorepo root
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Check if workspace files exist
PS C:\DEV\PMERIT\pmerit-ai-platform> dir package.json


    Directory: C:\DEV\PMERIT\pmerit-ai-platform


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        11/23/2025  12:00 PM            208 package.json


PS C:\DEV\PMERIT\pmerit-ai-platform> dir pnpm-workspace.yaml
dir : Cannot find path 'C:\DEV\PMERIT\pmerit-ai-platform\pnpm-workspace.yaml' because it does not exist.
At line:1 char:1
+ dir pnpm-workspace.yaml
+ ~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (C:\DEV\PMERIT\p...-workspace.yaml:String) [Get-ChildItem], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand

PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-webApp
dir : Cannot find path 'C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-webApp' because it does not exist.
At line:1 char:1
+ dir products\aixord-webApp
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (C:\DEV\PMERIT\p...s\aixord-webApp:String) [Get-ChildItem], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand

PS C:\DEV\PMERIT\pmerit-ai-platform> # Show root package.json contents
PS C:\DEV\PMERIT\pmerit-ai-platform> type package.json
{
    "dependencies": {
        "@neondatabase/serverless": "^1.0.2",
        "drizzle-orm": "^0.44.7"
    },
    "type": "module",
    "devDependencies": {
        "drizzle-kit": "^0.31.7"
    }
}
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # List what's in products folder
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:48 PM                aixord-extension


PS C:\DEV\PMERIT\pmerit-ai-platform> # Create pnpm workspace file
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> packages:
>>   - "products/*"
>>   - "packages/*"
>> '@ | Set-Content -Encoding UTF8 "pnpm-workspace.yaml"
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Create packages folder for shared code (D1 core will go here)
PS C:\DEV\PMERIT\pmerit-ai-platform> New-Item -ItemType Directory -Force -Path "packages"


    Directory: C:\DEV\PMERIT\pmerit-ai-platform


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:50 PM                packages


PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Create webApp folder
PS C:\DEV\PMERIT\pmerit-ai-platform> New-Item -ItemType Directory -Force -Path "products\aixord-webApp"


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:50 PM                aixord-webApp


PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Verify
PS C:\DEV\PMERIT\pmerit-ai-platform> dir


    Directory: C:\DEV\PMERIT\pmerit-ai-platform


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   3:36 PM                .claude
d-----        12/21/2025   3:53 PM                .copilot
d-----        12/21/2025   3:53 PM                .github
d-----        12/21/2025   3:53 PM                .wrangler
d-----         1/10/2026  10:07 AM                admin
d-----        12/21/2025   3:53 PM                assets
d-----         1/22/2026   3:36 PM                docs
d-----        12/21/2025   3:53 PM                functions
d-----        12/21/2025   3:53 PM                node_modules
d-----         1/22/2026   7:50 PM                packages
d-----         1/10/2026   5:12 PM                partials
d-----         1/22/2026   3:36 PM                portal
d-----         1/22/2026   5:52 PM                products
d-----        11/24/2025   9:06 PM                public
d-----        12/21/2025   3:53 PM                scripts
-a----        11/30/2025   7:34 AM           1738 .env.example
-a----        10/15/2025   6:35 PM           1833 .eslintrc.json
-a----         1/11/2026   7:30 PM            609 .gitignore
-a----        10/15/2025   6:35 PM            651 .htmlhintrc
-a----        10/15/2025   6:35 PM           1795 .stylelintrc.json
-a----         1/11/2026   7:23 PM          21161 about-us.html
-a----        11/21/2025   7:55 PM           5243 ACCESSIBILITY.md
-a----         1/10/2026  10:07 AM          11790 account.html
-a----         1/11/2026   6:37 AM          31180 admin-courses.html
-a----        11/21/2025   7:55 PM           9833 AI_SETUP_REQUIREMENTS.md
-a----        11/27/2025   4:54 PM          13612 assessment-entry.html
-a----        12/11/2025   9:38 PM           6075 assessment-processing.html
-a----        12/11/2025   9:38 PM           8581 assessment-questions.html
-a----        12/11/2025   9:38 PM          49645 assessment-results.html
-a----         1/10/2026  10:07 AM           2761 classroom.html
-a----         12/5/2025   6:59 PM           2466 CLAUDE.md
-a----        10/15/2025   6:35 PM             10 CNAME
-a----         1/10/2026   5:10 PM           5432 community.html
-a----        12/27/2025   3:30 AM           3193 contact.html
-a----         1/10/2026  10:07 AM           4101 COPYRIGHT
-a----         1/10/2026  10:07 AM          28782 course.html
-a----         1/10/2026   5:08 PM          37232 courses.html
-a----         1/18/2026   7:16 PM          46126 dashboard.html
-a----         12/4/2025   8:43 PM           8061 DEPLOYMENT_CHECKLIST.md
-a----         1/11/2026   7:23 PM          29462 donate.html
-a----         1/22/2026   7:12 PM          14940 find-account.html
-a----         1/22/2026   7:11 PM          18999 forgot-password.html
-a----        11/27/2025   2:09 PM           4508 impact.html
-a----         1/18/2026   2:37 PM          30804 index.html
-a----         1/10/2026  10:07 AM           3110 LICENSE
-a----        11/23/2025  12:04 PM          49997 package-lock.json
-a----        11/23/2025  12:00 PM            208 package.json
-a----        12/27/2025   3:31 AM           3763 partnerships.html
-a----         1/10/2026   5:09 PM          64594 pathways.html
-a----         12/5/2025   6:40 PM           8624 pmerit.code-workspace
-a----         12/4/2025   8:43 PM           8606 pmerit.code-workspace.backup
-a----         1/22/2026   7:50 PM             48 pnpm-workspace.yaml
-a----         1/11/2026   7:22 PM          25616 pricing.html
-a----        12/27/2025   3:31 AM           3891 privacy.html
-a----         1/11/2026   7:22 PM          29663 products.html
-a----         12/6/2025  11:29 AM           5411 profile.html
-a----         1/10/2026   5:10 PM           5434 progress.html
-a----         12/4/2025   8:43 PM          13342 PROJECT_OVERVIEW.md
-a----         12/5/2025   6:40 PM           8429 README.md
-a----         12/6/2025  11:30 AM           5443 reports.html
-a----        11/21/2025   7:55 PM           8908 SECURITY_SUMMARY.md
-a----        11/27/2025   2:09 PM          12395 settings.html
-a----         1/18/2026   2:34 PM          10431 signin.html
-a----        12/23/2025   6:54 AM           1888 Start-PmeritSession.ps1
-a----         1/10/2026   5:10 PM          12295 support.html
-a----         1/17/2026   7:48 PM             33 tmpclaude-3c77-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-3e46-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-4075-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-457d-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-50a7-cwd
-a----         1/17/2026   7:48 PM             33 tmpclaude-578b-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-9e96-cwd
-a----         1/17/2026   7:56 PM             33 tmpclaude-ee42-cwd
-a----         1/17/2026   7:50 PM             33 tmpclaude-f56a-cwd
-a----        11/30/2025   7:31 AM            526 wrangler.toml
-a----        12/23/2025   2:35 PM           2207 _headers
-a----        12/18/2025   9:37 AM           2702 _redirects


PS C:\DEV\PMERIT\pmerit-ai-platform> dir products


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\products


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:48 PM                aixord-extension
d-----         1/22/2026   7:50 PM                aixord-webApp


PS C:\DEV\PMERIT\pmerit-ai-platform>