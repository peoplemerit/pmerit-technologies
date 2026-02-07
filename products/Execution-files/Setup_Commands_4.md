PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> # Replace with correct exports
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> @'
>> /**
>>  * AIXORD Core
>>  *
>>  * Core types, validation, gates, formula, and variant management
>>  * for the AIXORD Enforcement Platform.
>>  *
>>  * @module @aixord/core
>>  */
>>
>> // Version info
>> export const CORE_VERSION = '1.0.0';
>>
>> // Types
>> export * from './types';
>>
>> // Validation
>> export * from './validation';
>>
>> // Gates
>> export * from './gates';
>>
>> // Formula
>> export * from './formula';
>>
>> // Variants - explicit exports to avoid collision with types
>> export {
>>   DEFAULT_THRESHOLDS,
>>   DEFAULT_HEADER_TEMPLATE,
>>   getProviderDisplayName,
>>   VariantInstance,
>>   VariantBuilder,
>>   VariantLoader,
>>   getVariantLoader,
>>   resetVariantLoader,
>>   loadVariant,
>>   loadDefaultVariant,
>>   getActiveVariant,
>> } from './variants';
>>
>> export type { VariantLoadResult } from './variants';
>> '@ | Out-File -FilePath "index.ts" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> cd C:\DEV\PMERIT\pmerit-ai-platform
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:23:09 PM

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
CJS dist\types\index.js          14.69 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\index.js                79.00 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\index.js.map            204.85 KB
CJS dist\variants\index.js.map   38.87 KB
CJS dist\formula\index.js.map    38.09 KB
CJS ⚡️ Build success in 770ms
ESM dist\types\index.mjs          13.90 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\index.mjs                75.25 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\index.mjs.map            204.79 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM ⚡️ Build success in 770ms
src/types/entities.ts(19,15): error TS2459: Module '"./governance"' declares 'GateID' locally, but it is not exported.

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
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check if GateID is exported from governance.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "governance.ts" -Pattern "GateID"

governance.ts:10:import type { GateID, Phase, Kingdom, ExecutionMode } from './state';
governance.ts:19:export const GATE_ORDER: GateID[] = [
governance.ts:27:export const BLOCKING_GATES: GateID[] = [
governance.ts:34:export const NON_BLOCKING_GATES: GateID[] = [
governance.ts:41:export const SETUP_GATES: GateID[] = [
governance.ts:50:  id: GateID;
governance.ts:74:export const GATE_DEFINITIONS: Record<GateID, GateDefinition> = {
governance.ts:227:  requiredGates: GateID[];
governance.ts:230:  completableGates: GateID[];
governance.ts:689:export function getGateDefinition(gateId: GateID): GateDefinition {
governance.ts:690:  return GATE_DEFINITIONS[gateId];
governance.ts:703:export function isBlockingGate(gateId: GateID): boolean {
governance.ts:704:  return BLOCKING_GATES.includes(gateId);
governance.ts:710:export function isSetupGate(gateId: GateID): boolean {
governance.ts:711:  return SETUP_GATES.includes(gateId);
governance.ts:740:export function getRequiredGatesForPhase(phase: Phase): GateID[] {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Get-Content entities.ts | Select-Object -Index (15..25)
  ExecutionMode,
  LicenseType,
} from './state';
import type { GateID, TaskClass } from './governance';

// ============================================================================
// BASE ENTITY
// ============================================================================

/**
 * Base entity with common fields
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check first few lines of governance.ts to see the import
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Get-Content governance.ts | Select-Object -Index (0..15)
/**
 * AIXORD Governance Types
 *
 * Gate definitions, phase transitions, kingdom mappings,
 * execution modes, and halt conditions.
 *
 * @module @aixord/core/types/governance
 */

import type { GateID, Phase, Kingdom, ExecutionMode } from './state';

// ============================================================================
// GATE DEFINITIONS
// ============================================================================

/**
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Read governance.ts, add re-export after import
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> $content = Get-Content governance.ts -Raw
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> $content = $content -replace "(import type \{ GateID, Phase, Kingdom, ExecutionMode \} from '\./state';)", "`$1`n`n// Re-export for entities.ts`nexport type { GateID, TaskClass };"
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check if TaskClass is defined in governance.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "governance.ts" -Pattern "TaskClass"

governance.ts:577:export type TaskClass = 'TRIVIAL' | 'SIMPLE' | 'STANDARD' | 'COMPLEX';
governance.ts:582:export interface TaskClassDefinition {
governance.ts:584:  id: TaskClass;
governance.ts:602:export const TASK_CLASS_DEFINITIONS: Record<TaskClass, TaskClassDefinition> = {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "governance.ts" -Pattern "^export.*TaskClass"

governance.ts:577:export type TaskClass = 'TRIVIAL' | 'SIMPLE' | 'STANDARD' | 'COMPLEX';
governance.ts:582:export interface TaskClassDefinition {
governance.ts:602:export const TASK_CLASS_DEFINITIONS: Record<TaskClass, TaskClassDefinition> = {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Fix entities.ts import
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> $content = Get-Content entities.ts -Raw
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> $content = $content -replace "import type \{ GateID, TaskClass \} from '\./governance';", "import type { GateID } from './state';`nimport type { TaskClass } from './governance';"
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> $content | Out-File -FilePath "entities.ts" -Encoding ascii
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:29:00 PM

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
ESM dist\index.mjs                75.25 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\types\index.mjs          13.90 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM dist\index.mjs.map            204.79 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM ⚡️ Build success in 767ms
CJS dist\index.js                79.00 KB
CJS dist\types\index.js          14.69 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\index.js.map            204.85 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\variants\index.js.map   38.87 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\formula\index.js.map    38.09 KB
CJS ⚡️ Build success in 773ms
src/variants/interface.ts(110,12): error TS1361: 'DEFAULT_THRESHOLDS' cannot be used as a value because it was imported using 'import type'.
src/variants/interface.ts(110,56): error TS1361: 'DEFAULT_THRESHOLDS' cannot be used as a value because it was imported using 'import type'.
src/variants/interface.ts(128,52): error TS1361: 'DEFAULT_HEADER_TEMPLATE' cannot be used as a value because it was imported using 'import type'.

Error: error occurred in dts build
    at Worker.<anonymous> (C:\dev\pmerit\pmerit-ai-platform\node_modules\.pnpm\tsup@8.5.1_postcss@8.5.6_typescript@5.9.3\node_modules\tsup\dist\index.js:1545:26)
    at Worker.emit (node:events:518:28)
    at MessagePort.<anonymous> (node:internal/worker:263:53)
    at [nodejs.internal.kHybridDispatch] (node:internal/event_target:820:20)
    at MessagePort.<anonymous> (node:internal/per_context/messageport:23:28)
C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 build: `tsup`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> # Check the import in interface.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> Get-Content interface.ts | Select-Object -Index (0..20)
/**
 * AIXORD Variant Interface
 *
 * Runtime interface for interacting with loaded variants.
 *
 * @module @aixord/core/variants/interface
 */

import type { AIXORDState } from '../types/state';
import type {
  VariantConfig,
  ProviderID,
  ProviderTier,
  MessageThresholds,
  VariantPrompts,
  VariantRule,
  DEFAULT_THRESHOLDS,
  DEFAULT_HEADER_TEMPLATE,
} from '../types/variants';

// ============================================================================
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> # Fix interface.ts - split type and value imports
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> $content = Get-Content interface.ts -Raw
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> $content = $content -replace "import type \{`n  VariantConfig,`n  ProviderID,`n  ProviderTier,`n  MessageThresholds,`n  VariantPrompts,`n  VariantRule,`n  DEFAULT_THRESHOLDS,`n  DEFAULT_HEADER_TEMPLATE,`n\} from '\.\./types/variants';", "import type {`n  VariantConfig,`n  ProviderID,`n  ProviderTier,`n  MessageThresholds,`n  VariantPrompts,`n  VariantRule,`n} from '../types/variants';`nimport { DEFAULT_THRESHOLDS, DEFAULT_HEADER_TEMPLATE } from '../types/variants';"
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> $content | Out-File -FilePath "interface.ts" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> # Show lines around the import to get exact format
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> Get-Content interface.ts | Select-Object -Index (8..22)
import type { AIXORDState } from '../types/state';
import type {
  VariantConfig,
  ProviderID,
  ProviderTier,
  MessageThresholds,
  VariantPrompts,
  VariantRule,
} from '../types/variants';
import { DEFAULT_THRESHOLDS, DEFAULT_HEADER_TEMPLATE } from '../types/variants';

// ============================================================================
// VARIANT INSTANCE
// ============================================================================

PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> cd C:\DEV\PMERIT\pmerit-ai-platform
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:32:04 PM

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
CJS dist\index.js                78.99 KB
CJS dist\types\index.js          14.69 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\variants\index.js       15.05 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\index.js.map            204.84 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\formula\index.js.map    38.09 KB
CJS dist\variants\index.js.map   38.86 KB
CJS dist\gates\index.js.map      69.76 KB
CJS ⚡️ Build success in 796ms
ESM dist\types\index.mjs          13.90 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\variants\index.mjs       14.75 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\index.mjs                75.19 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\variants\index.mjs.map   38.85 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM dist\index.mjs.map            204.78 KB
ESM ⚡️ Build success in 802ms
DTS ⚡️ Build success in 5956ms
DTS dist\index.d.ts                4.61 KB
DTS dist\types\index.d.ts          14.40 KB
DTS dist\validation\index.d.ts     64.46 KB
DTS dist\gates\index.d.ts          7.40 KB
DTS dist\formula\index.d.ts        7.34 KB
DTS dist\variants\index.d.ts       12.34 KB
DTS dist\governance-CsxCk4q3.d.ts  5.91 KB
DTS dist\state-D1-PD8HQ.d.ts       7.94 KB
DTS dist\index.d.mts               4.62 KB
DTS dist\types\index.d.mts         14.40 KB
DTS dist\validation\index.d.mts    64.47 KB
DTS dist\gates\index.d.mts         7.41 KB
DTS dist\formula\index.d.mts       7.34 KB
DTS dist\variants\index.d.mts      12.34 KB
DTS dist\governance-C_uU2xO_.d.mts 5.91 KB
DTS dist\state-D1-PD8HQ.d.mts      7.94 KB
PS C:\DEV\PMERIT\pmerit-ai-platform> # Run tests
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm --filter @aixord/core test --run

> @aixord/core@1.0.0 test C:\dev\pmerit\pmerit-ai-platform\packages\core
> vitest "--run"

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 RUN  v1.6.1 C:/dev/pmerit/pmerit-ai-platform/packages/core

 ✓ __tests__/state.test.ts (21)
 ✓ __tests__/formula.test.ts (27)
 ✓ __tests__/validation.test.ts (25)
 ❯ __tests__/gates.test.ts (28)
   ✓ Gate Checking (6)
   ❯ Gate Transitions (5)
     ✓ canPassGate (3)
     ❯ updateGate (2)
       × should update gate and return new state
       ✓ should fail if prerequisites not met
   ✓ Phase Entry (5)
   ✓ License/Disclaimer Transitions (2)
   ✓ Reality Classification (2)
   ✓ Formula Binding (2)
   ✓ Session Management (1)
   ✓ Execution Eligibility (1)
   ✓ Setup Progress (1)
   ✓ Formatting (1)
   ✓ Blocking Gate Detection (2)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  __tests__/gates.test.ts > Gate Transitions > updateGate > should update gate and return new state
TypeError: Cannot read properties of undefined (reading 'LIC')
 ❯ __tests__/gates.test.ts:152:27
    150|
    151|       expect(result.success).toBe(true);
    152|       expect(result.gates.LIC).toBe(1);
       |                           ^
    153|       expect(result.updatedGates).toContain('LIC');
    154|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 100 passed (101)
   Start at  20:33:00
   Duration  960ms (transform 386ms, setup 2ms, collect 1.14s, tests 73ms, environment 1ms, prepare 819ms)

C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 test: `vitest "--run"`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Wire extension to core
PS C:\DEV\PMERIT\pmerit-ai-platform> cd products\aixord-extension
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> pnpm add @aixord/core --workspace
 ERROR  Cannot destructure property 'manifest' of 'manifestsByPath[rootDir]' as it is undefined.

pnpm: Cannot destructure property 'manifest' of 'manifestsByPath[rootDir]' as it is undefined.
    at C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:161441:19
    at async Promise.all (index 0)
    at async recursive (C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:161438:9)
    at async recursiveInstallThenUpdateWorkspaceState (C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:162022:31)
    at async installDeps (C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:161829:11)
    at async C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:195292:23
    at async main (C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:195250:34)
    at async runPnpm (C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:195517:5)
    at async C:\dev\pmerit\.node\node-v20.18.1-win-x64\node_modules\pnpm\dist\pnpm.cjs:195509:7
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>