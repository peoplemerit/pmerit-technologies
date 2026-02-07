PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check what's around line 82 in variants.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Get-Content variants.ts | Select-Object -Index (75..95)
// VARIANT CONFIGURATION
// ============================================================================

/**
 * Complete variant configuration
 */
export interface VariantConfig {
  /** Variant identifier */
  id: string;

  /** Provider ID */
  provider: ProviderID;

  /** Variant version */
  version: string;

  /** Display name */
  name: string;

  /** Description */
  description?: string;
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Revert to simple re-exports
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> @'
>> /**
>>  * AIXORD Core Types
>>  *
>>  * Re-exports all type definitions.
>>  *
>>  * @module @aixord/core/types
>>  */
>>
>> // State types
>> export * from './state';
>>
>> // Governance types
>> export * from './governance';
>>
>> // Entity types
>> export * from './entities';
>>
>> // Variant types (excluding VariantConfig which is in entities)
>> export {
>>   VariantWeakness,
>>   WeaknessSeverity,
>>   VariantConstraint,
>>   ConstraintDomain,
>>   VariantEnforcement,
>>   VariantInstance,
>>   VariantBuilder,
>>   VariantLoader
>> } from './variants';
>> '@ | Out-File -FilePath "index.ts" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # List all exports from variants.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "variants.ts" -Pattern "^export"

variants.ts:16:export type ProviderID = 'claude' | 'chatgpt' | 'gemini' | 'custom';
variants.ts:21:export interface ProviderTier {
variants.ts:41:export interface MessageThresholds {
variants.ts:58:export interface TierFeatures {
variants.ts:82:export interface VariantConfig {
variants.ts:120:export interface VariantPrompts {
variants.ts:140:export interface VariantRule {
variants.ts:160:export interface ProviderSelectors {
variants.ts:186:export interface VariantAdaptations {
variants.ts:237:export interface VariantMetadata {
variants.ts:270:export const DEFAULT_THRESHOLDS: Record<ProviderID, MessageThresholds> = {
variants.ts:299:export const DEFAULT_HEADER_TEMPLATE =
variants.ts:305:export function getProviderDisplayName(provider: ProviderID): string {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm --filter @aixord/core build

> @aixord/core@1.0.0 build C:\dev\pmerit\pmerit-ai-platform\packages\core
> tsup

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:13:6:
      13 │       "types": "./dist/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:11:6:
      11 │       "import": "./dist/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:12:6:
      12 │       "require": "./dist/index.js",
         ╵       ~~~~~~~~~

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:18:6:
      18 │       "types": "./dist/types/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:16:6:
      16 │       "import": "./dist/types/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:17:6:
      17 │       "require": "./dist/types/index.js",
         ╵       ~~~~~~~~~

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:23:6:
      23 │       "types": "./dist/validation/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:21:6:
      21 │       "import": "./dist/validation/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:22:6:
      22 │       "require": "./dist/validation/index.js",
         ╵       ~~~~~~~~~

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:28:6:
      28 │       "types": "./dist/gates/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:26:6:
      26 │       "import": "./dist/gates/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:27:6:
      27 │       "require": "./dist/gates/index.js",
         ╵       ~~~~~~~~~

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:33:6:
      33 │       "types": "./dist/formula/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:31:6:
      31 │       "import": "./dist/formula/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:32:6:
      32 │       "require": "./dist/formula/index.js",
         ╵       ~~~~~~~~~

▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]

    package.json:38:6:
      38 │       "types": "./dist/variants/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:36:6:
      36 │       "import": "./dist/variants/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:37:6:
      37 │       "require": "./dist/variants/index.js",
         ╵       ~~~~~~~~~

CLI Building entry: {"index":"src/index.ts","types/index":"src/types/index.ts","validation/index":"src/validation/index.ts","gates/index":"src/gates/index.ts","formula/index":"src/formula/index.ts","variants/index":"src/variants/index.ts"}
CLI Using tsconfig: tsconfig.json
CLI tsup v8.5.1
CLI Using tsup config: C:\dev\pmerit\pmerit-ai-platform\packages\core\tsup.config.ts
CLI Target: es2022
CLI Cleaning output folder
CJS Build start
ESM Build start

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:13:6:
      13 │       "types": "./dist/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:11:6:
      11 │       "import": "./dist/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:12:6:
      12 │       "require": "./dist/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:18:6:
      18 │       "types": "./dist/types/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:16:6:
      16 │       "import": "./dist/types/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:17:6:
      17 │       "require": "./dist/types/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:23:6:
      23 │       "types": "./dist/validation/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:21:6:
      21 │       "import": "./dist/validation/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:22:6:
      22 │       "require": "./dist/validation/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:28:6:
      28 │       "types": "./dist/gates/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:26:6:
      26 │       "import": "./dist/gates/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:27:6:
      27 │       "require": "./dist/gates/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:33:6:
      33 │       "types": "./dist/formula/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:31:6:
      31 │       "import": "./dist/formula/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:32:6:
      32 │       "require": "./dist/formula/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:38:6:
      38 │       "types": "./dist/variants/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:36:6:
      36 │       "import": "./dist/variants/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:37:6:
      37 │       "require": "./dist/variants/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:13:6:
      13 │       "types": "./dist/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:11:6:
      11 │       "import": "./dist/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:12:6:
      12 │       "require": "./dist/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:18:6:
      18 │       "types": "./dist/types/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:16:6:
      16 │       "import": "./dist/types/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:17:6:
      17 │       "require": "./dist/types/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:23:6:
      23 │       "types": "./dist/validation/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:21:6:
      21 │       "import": "./dist/validation/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:22:6:
      22 │       "require": "./dist/validation/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:28:6:
      28 │       "types": "./dist/gates/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:26:6:
      26 │       "import": "./dist/gates/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:27:6:
      27 │       "require": "./dist/gates/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:33:6:
      33 │       "types": "./dist/formula/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:31:6:
      31 │       "import": "./dist/formula/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:32:6:
      32 │       "require": "./dist/formula/index.js",
         ╵       ~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:11:03 PM

    package.json:38:6:
      38 │       "types": "./dist/variants/index.d.ts"
         ╵       ~~~~~~~

  The "import" condition comes earlier and will be used for all "import" statements:

    package.json:36:6:
      36 │       "import": "./dist/variants/index.mjs",
         ╵       ~~~~~~~~

  The "require" condition comes earlier and will be used for all "require" calls:

    package.json:37:6:
      37 │       "require": "./dist/variants/index.js",
         ╵       ~~~~~~~~~



DTS Build start
ESM dist\gates\index.mjs          23.69 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\types\index.mjs          13.90 KB
ESM dist\index.mjs                73.10 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\index.mjs.map            202.16 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM ⚡️ Build success in 789ms
CJS dist\types\index.js          14.69 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\index.js                76.78 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\variants\index.js.map   38.87 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\formula\index.js.map    38.09 KB
CJS dist\index.js.map            202.23 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\gates\index.js.map      69.76 KB
CJS ⚡️ Build success in 796ms
src/index.ts(26,1): error TS2308: Module './types' has already exported a member named 'VariantBuilder'. Consider explicitly re-exporting to resolve the ambiguity.
src/index.ts(26,1): error TS2308: Module './types' has already exported a member named 'VariantConfig'. Consider explicitly re-exporting to resolve the ambiguity.
src/index.ts(26,1): error TS2308: Module './types' has already exported a member named 'VariantInstance'. Consider explicitly re-exporting to resolve the ambiguity.
src/index.ts(26,1): error TS2308: Module './types' has already exported a member named 'VariantLoader'. Consider explicitly re-exporting to resolve the ambiguity.

Error: error occurred in dts build
    at Worker.<anonymous> (C:\dev\pmerit\pmerit-ai-platform\node_modules\.pnpm\tsup@8.5.1_postcss@8.5.6_typescript@5.9.3\node_modules\tsup\dist\index.js:1545:26)
    at Worker.emit (node:events:518:28)
    at MessagePort.<anonymous> (node:internal/worker:263:53)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:820:20)
    at MessagePort.<anonymous> (node:internal/per_context/messageport:23:28)
DTS Build error
C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 build: `tsup`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform>