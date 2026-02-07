PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> # Show root index.ts contents
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> type index.ts
/**
 * AIXORD Core
 *
 * Core types, validation, gates, formula, and variant management
 * for the AIXORD Enforcement Platform.
 *
 * @module @aixord/core
 */

// Version info
export const CORE_VERSION = '1.0.0';

// Types
export * from './types';

// Validation
export * from './validation';

// Gates
export * from './gates';

// Formula
export * from './formula';

// Variants
export * from './variants';
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src> # Replace root index.ts to remove duplicate export
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
>> // Types (includes variant types via re-export)
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
>>   createVariantBuilder,
>>   loadVariant,
>>   getBuiltInVariants,
>>   CLAUDE_VARIANT,
>>   CHATGPT_VARIANT,
>>   GEMINI_VARIANT
>> } from './variants';
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:16:10 PM

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
ESM dist\types\index.mjs          13.90 KB
ESM dist\index.mjs                71.83 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM dist\index.mjs.map            194.56 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM ⚡️ Build success in 819ms
CJS dist\types\index.js          14.69 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\index.js                75.36 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\index.js.map            194.63 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\variants\index.js.map   38.87 KB
CJS dist\formula\index.js.map    38.09 KB
CJS ⚡️ Build success in 823ms
src/types/index.ts(20,3): error TS2305: Module '"./variants"' has no exported member 'VariantWeakness'.
src/types/index.ts(21,3): error TS2305: Module '"./variants"' has no exported member 'WeaknessSeverity'.
src/types/index.ts(22,3): error TS2305: Module '"./variants"' has no exported member 'VariantConstraint'.
src/types/index.ts(23,3): error TS2305: Module '"./variants"' has no exported member 'ConstraintDomain'.
src/types/index.ts(24,3): error TS2305: Module '"./variants"' has no exported member 'VariantEnforcement'.
src/types/index.ts(25,3): error TS2305: Module '"./variants"' has no exported member 'VariantInstance'.
src/types/index.ts(26,3): error TS2724: '"./variants"' has no exported member named 'VariantBuilder'. Did you mean 'VariantRule'?
src/types/index.ts(27,3): error TS2305: Module '"./variants"' has no exported member 'VariantLoader'.

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
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Replace with clean version - no variant imports
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> @'
>> /**
>>  * AIXORD Core Types
>>  * @module @aixord/core/types
>>  */
>>
>> // State types
>> export * from './state';
>>
>> // Governance types
>> export * from './governance';
>>
>> // Entity types (contains VariantConfig)
>> export * from './entities';
>> '@ | Out-File -FilePath "index.ts" -Encoding ascii
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:18:45 PM

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
ESM dist\index.mjs                71.83 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\types\index.mjs          13.90 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\index.mjs.map            194.53 KB
ESM dist\types\index.mjs.map      44.93 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM ⚡️ Build success in 802ms
CJS dist\validation\index.js     20.40 KB
CJS dist\index.js                75.35 KB
CJS dist\types\index.js          14.69 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\index.js.map            194.59 KB
CJS dist\types\index.js.map      44.94 KB
CJS dist\formula\index.js.map    38.09 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\variants\index.js.map   38.87 KB
CJS ⚡️ Build success in 806ms
src/index.ts(27,3): error TS2724: '"./variants"' has no exported member named 'createVariantBuilder'. Did you mean 'VariantBuilder'?
src/index.ts(29,3): error TS2305: Module '"./variants"' has no exported member 'getBuiltInVariants'.
src/index.ts(30,3): error TS2724: '"./variants"' has no exported member named 'CLAUDE_VARIANT'. Did you mean 'loadVariant'?
src/index.ts(31,3): error TS2305: Module '"./variants"' has no exported member 'CHATGPT_VARIANT'.
src/index.ts(32,3): error TS2305: Module '"./variants"' has no exported member 'GEMINI_VARIANT'.

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
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> # List all exports
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> Select-String -Path "index.ts" -Pattern "^export"

index.ts:10:export type {
index.ts:23:export {
index.ts:30:export { VariantInstance, VariantBuilder } from './interface';
index.ts:33:export {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants> type index.ts
/**
 * AIXORD Variants
 *
 * Variant configuration, loading, and management.
 *
 * @module @aixord/core/variants
 */

// Re-export types
export type {
  ProviderID,
  ProviderTier,
  MessageThresholds,
  TierFeatures,
  VariantConfig,
  VariantPrompts,
  VariantRule,
  ProviderSelectors,
  VariantAdaptations,
  VariantMetadata,
} from '../types/variants';

export {
  DEFAULT_THRESHOLDS,
  DEFAULT_HEADER_TEMPLATE,
  getProviderDisplayName,
} from '../types/variants';

// Variant interface
export { VariantInstance, VariantBuilder } from './interface';

// Variant loader
export {
  VariantLoader,
  getVariantLoader,
  resetVariantLoader,
  loadVariant,
  loadDefaultVariant,
  getActiveVariant,
  type VariantLoadResult,
} from './loader';
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\variants>