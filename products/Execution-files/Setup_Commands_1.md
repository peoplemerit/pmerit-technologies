PS C:\DEV\PMERIT\pmerit-ai-platform> # Navigate to packages folder
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages
PS C:\DEV\PMERIT\pmerit-ai-platform\packages>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> # Extract the D1 zip (adjust path if your Downloads is different)
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> Expand-Archive -Path "$env:USERPROFILE\Downloads\aixord-platform-d1.zip" -DestinationPath . -Force
PS C:\DEV\PMERIT\pmerit-ai-platform\packages>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> # The zip extracts to aixord-platform/packages/core - move it up
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> Move-Item -Path ".\aixord-platform\packages\core" -Destination ".\core" -Force
PS C:\DEV\PMERIT\pmerit-ai-platform\packages>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> # Clean up empty extracted folder
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> Remove-Item -Path ".\aixord-platform" -Recurse -Force
PS C:\DEV\PMERIT\pmerit-ai-platform\packages>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> # Verify
PS C:\DEV\PMERIT\pmerit-ai-platform\packages> dir


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\packages


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:54 PM                core


PS C:\DEV\PMERIT\pmerit-ai-platform\packages> dir core


    Directory: C:\DEV\PMERIT\pmerit-ai-platform\packages\core


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/22/2026   7:54 PM                src
d-----         1/22/2026   7:54 PM                __tests__
-a----         1/21/2026   2:10 AM           1571 package.json
-a----         1/21/2026   1:59 AM            268 tsconfig.json
-a----         1/21/2026   1:59 AM            452 tsup.config.ts
-a----         1/21/2026   2:10 AM            371 vitest.config.ts


PS C:\DEV\PMERIT\pmerit-ai-platform\packages> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Replace root package.json with proper monorepo config
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "name": "pmerit-ai-platform",
>>   "private": true,
>>   "version": "1.0.0",
>>   "type": "module",
>>   "scripts": {
>>     "build": "pnpm -r build",
>>     "test": "pnpm -r test",
>>     "typecheck": "pnpm -r typecheck",
>>     "dev:extension": "pnpm --filter @aixord/extension dev"
>>   },
>>   "devDependencies": {
>>     "typescript": "^5.9.3"
>>   }
>> }
>> '@ | Set-Content -Encoding UTF8 "package.json"
PS C:\DEV\PMERIT\pmerit-ai-platform> # From root - install all workspace packages
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm install
Scope: all 3 workspace projects
.                                        | +121 ++++++++++++
.                                        | Progress: resolved 192, reused 13, downloaded 108, added 121, done
╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild@0.21.5, esbuild@0.27.2.                                   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 9.1s using pnpm v10.28.1
PS C:\DEV\PMERIT\pmerit-ai-platform> # Check status
PS C:\DEV\PMERIT\pmerit-ai-platform> git status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   assets/js/auth-modal.js
        modified:   package.json
        modified:   products/aixord-extension/package.json

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        packages/
        pnpm-lock.yaml
        pnpm-workspace.yaml
        products/aixord-extension/pnpm-lock.yaml
        products/aixord-extension/pnpm-workspace.yaml

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Stage new files
PS C:\DEV\PMERIT\pmerit-ai-platform> git add .
warning: in the working copy of 'package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'products/aixord-extension/package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/__tests__/formula.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/__tests__/gates.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/__tests__/state.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/__tests__/validation.test.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/package.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/formula/conservation.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/formula/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/formula/validator.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/gates/checker.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/gates/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/gates/transitions.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/types/entities.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/types/governance.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/types/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/types/state.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/types/variants.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/validation/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/validation/schema.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/validation/state.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/variants/index.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/variants/interface.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/src/variants/loader.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/tsconfig.json', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/tsup.config.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'packages/core/vitest.config.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'pnpm-workspace.yaml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'products/aixord-extension/pnpm-lock.yaml', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'products/aixord-extension/pnpm-workspace.yaml', LF will be replaced by CRLF the next time Git touches it
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Commit
PS C:\DEV\PMERIT\pmerit-ai-platform> git commit -m "feat(aixord): Add core package and workspace configuration"
[main 5afe808] feat(aixord): Add core package and workspace configuration
 33 files changed, 9764 insertions(+), 10 deletions(-)
 create mode 100644 packages/core/__tests__/formula.test.ts
 create mode 100644 packages/core/__tests__/gates.test.ts
 create mode 100644 packages/core/__tests__/state.test.ts
 create mode 100644 packages/core/__tests__/validation.test.ts
 create mode 100644 packages/core/package.json
 create mode 100644 packages/core/src/formula/conservation.ts
 create mode 100644 packages/core/src/formula/index.ts
 create mode 100644 packages/core/src/formula/validator.ts
 create mode 100644 packages/core/src/gates/checker.ts
 create mode 100644 packages/core/src/gates/index.ts
 create mode 100644 packages/core/src/gates/transitions.ts
 create mode 100644 packages/core/src/index.ts
 create mode 100644 packages/core/src/types/entities.ts
 create mode 100644 packages/core/src/types/governance.ts
 create mode 100644 packages/core/src/types/index.ts
 create mode 100644 packages/core/src/types/state.ts
 create mode 100644 packages/core/src/types/variants.ts
 create mode 100644 packages/core/src/validation/index.ts
 create mode 100644 packages/core/src/validation/schema.ts
 create mode 100644 packages/core/src/validation/state.ts
 create mode 100644 packages/core/src/variants/index.ts
 create mode 100644 packages/core/src/variants/interface.ts
 create mode 100644 packages/core/src/variants/loader.ts
 create mode 100644 packages/core/tsconfig.json
 create mode 100644 packages/core/tsup.config.ts
 create mode 100644 packages/core/vitest.config.ts
 create mode 100644 pnpm-lock.yaml
 create mode 100644 pnpm-workspace.yaml
 create mode 100644 products/aixord-extension/pnpm-lock.yaml
 create mode 100644 products/aixord-extension/pnpm-workspace.yaml
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Push
PS C:\DEV\PMERIT\pmerit-ai-platform> git push origin main
Enumerating objects: 56, done.
Counting objects: 100% (56/56), done.
Delta compression using up to 22 threads
Compressing objects: 100% (44/44), done.
Writing objects: 100% (48/48), 67.18 KiB | 1.49 MiB/s, done.
Total 48 (delta 4), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
To https://github.com/peoplemerit/pmerit-ai-platform.git
   b2c89de..5afe808  main -> main
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Build core package
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm --filter @aixord/core build

> @aixord/core@1.0.0 build C:\dev\pmerit\pmerit-ai-platform\packages\core
> tsup

▲ [WARNING] Cannot find base config file "../../tsconfig.base.json" [tsconfig.json]

    tsconfig.json:2:13:
      2 │   "extends": "../../tsconfig.base.json",
        ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~

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
CLI Target: node16
CLI Cleaning output folder
CJS Build start
ESM Build start

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] Cannot find base config file "../../tsconfig.base.json" [tsconfig.json]                                                      7:57:05 PM

    tsconfig.json:2:13:
      2 │   "extends": "../../tsconfig.base.json",
        ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   7:57:05 PM

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




 WARN  ▲ [WARNING] Cannot find base config file "../../tsconfig.base.json" [tsconfig.json]                                                      7:57:05 PM

    tsconfig.json:2:13:
      2 │   "extends": "../../tsconfig.base.json",
        ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~



DTS Build start
error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

CJS dist\index.js                79.52 KB
CJS dist\types\index.js          15.64 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\formula\index.js        14.48 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\variants\index.js       15.50 KB
CJS dist\index.js.map            205.12 KB
CJS dist\types\index.js.map      52.42 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\formula\index.js.map    38.19 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\variants\index.js.map   39.37 KB
CJS ⚡️ Build success in 851ms
ESM dist\index.mjs                75.76 KB
ESM dist\types\index.mjs          14.76 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\validation\index.mjs     18.97 KB
ESM dist\formula\index.mjs        14.07 KB
ESM dist\variants\index.mjs       15.25 KB
ESM dist\index.mjs.map            205.06 KB
ESM dist\types\index.mjs.map      52.42 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\formula\index.mjs.map    38.19 KB
ESM dist\variants\index.mjs.map   39.37 KB
ESM ⚡️ Build success in 855ms
error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

error TS5083: Cannot read file 'C:/dev/pmerit/pmerit-ai-platform/tsconfig.base.json'.

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
PS C:\DEV\PMERIT\pmerit-ai-platform> # Run tests
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm --filter @aixord/core test

> @aixord/core@1.0.0 test C:\dev\pmerit\pmerit-ai-platform\packages\core
> vitest

▲ [WARNING] Cannot find base config file "../../tsconfig.base.json" [tsconfig.json]

    tsconfig.json:2:13:
      2 │   "extends": "../../tsconfig.base.json",
        ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 DEV  v1.6.1 C:/dev/pmerit/pmerit-ai-platform/packages/core


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Failed to load PostCSS config: Failed to load PostCSS config (searchPath: C:/dev/pmerit/pmerit-ai-platform/packages/core): [SyntaxError] Unexpected token '﻿', "﻿{
  "name"... is not valid JSON
SyntaxError: Unexpected token '﻿', "﻿{
  "name"... is not valid JSON
    at JSON.parse (<anonymous>)
    at jsonLoader (file:///C:/dev/pmerit/pmerit-ai-platform/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.30/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:25734:41)
    at Object.search (file:///C:/dev/pmerit/pmerit-ai-platform/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.30/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:25895:25)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Failed to load PostCSS config: Failed to load PostCSS config (searchPath: C:/dev/pmerit/pmerit-ai-platform/packages/core): [SyntaxError] Unexpected token '﻿', "﻿{
  "name"... is not valid JSON
SyntaxError: Unexpected token '﻿', "﻿{
  "name"... is not valid JSON
    at JSON.parse (<anonymous>)
    at jsonLoader (file:///C:/dev/pmerit/pmerit-ai-platform/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.30/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:25734:41)
    at Object.search (file:///C:/dev/pmerit/pmerit-ai-platform/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.30/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:25895:25)



C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 test: `vitest`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> cd products\aixord-extension
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Add core as workspace dependency
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
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> cd C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension>
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> # Create build script
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> @'
>> import { build } from "esbuild";
>> import { copyFileSync, mkdirSync, existsSync } from "fs";
>>
>> const outdir = "dist";
>>
>> // Ensure dist exists
>> if (!existsSync(outdir)) {
>>   mkdirSync(outdir, { recursive: true });
>> }
>>
>> // Build background service worker
>> await build({
>>   entryPoints: ["src/background/index.ts"],
>>   bundle: true,
>>   outfile: `${outdir}/background.js`,
>>   format: "esm",
>>   target: "es2022",
>>   platform: "browser",
>> });
>>
>> // Build content script
>> await build({
>>   entryPoints: ["src/content/index.ts"],
>>   bundle: true,
>>   outfile: `${outdir}/content.js`,
>>   format: "iife",
>>   target: "es2022",
>>   platform: "browser",
>> });
>>
>> // Copy static files
>> copyFileSync("manifest.json", `${outdir}/manifest.json`);
>> copyFileSync("popup.html", `${outdir}/popup.html`);
>>
>> console.log("Build complete: dist/");
>> '@ | Set-Content -Encoding UTF8 "build.mjs"
PS C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Create base tsconfig (use ASCII to avoid BOM)
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "compilerOptions": {
>>     "target": "ES2022",
>>     "module": "ESNext",
>>     "moduleResolution": "bundler",
>>     "strict": true,
>>     "skipLibCheck": true,
>>     "esModuleInterop": true,
>>     "resolveJsonModule": true,
>>     "declaration": true,
>>     "declarationMap": true,
>>     "sourceMap": true,
>>     "noEmit": false
>>   }
>> }
>> '@ | Out-File -FilePath "tsconfig.base.json" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform> # Re-write package.json without BOM
PS C:\DEV\PMERIT\pmerit-ai-platform> @'
>> {
>>   "name": "pmerit-ai-platform",
>>   "private": true,
>>   "version": "1.0.0",
>>   "type": "module",
>>   "scripts": {
>>     "build": "pnpm -r build",
>>     "test": "pnpm -r test",
>>     "typecheck": "pnpm -r typecheck",
>>     "dev:extension": "pnpm --filter @aixord/extension dev"
>>   },
>>   "devDependencies": {
>>     "typescript": "^5.9.3"
>>   }
>> }
>> '@ | Out-File -FilePath "package.json" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform> # Remove the workspace file that shouldn't be there
PS C:\DEV\PMERIT\pmerit-ai-platform> Remove-Item -Path "products\aixord-extension\pnpm-workspace.yaml" -Force
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Verify it's gone
PS C:\DEV\PMERIT\pmerit-ai-platform> dir products\aixord-extension\pnpm-workspace.yaml
dir : Cannot find path 'C:\DEV\PMERIT\pmerit-ai-platform\products\aixord-extension\pnpm-workspace.yaml' because it does not exist.
At line:1 char:1
+ dir products\aixord-extension\pnpm-workspace.yaml
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : ObjectNotFound: (C:\DEV\PMERIT\p...-workspace.yaml:String) [Get-ChildItem], ItemNotFoundException
    + FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetChildItemCommand

PS C:\DEV\PMERIT\pmerit-ai-platform> # Clean and reinstall
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm install
Scope: all 3 workspace projects
╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: esbuild@0.21.5, esbuild@0.27.2.                                   │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯
Done in 1.1s using pnpm v10.28.1
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Build core
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:00:30 PM

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
ESM dist\types\index.mjs          14.76 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\index.mjs.map            204.45 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\types\index.mjs.map      52.42 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM ⚡️ Build success in 843ms
CJS dist\types\index.js          15.64 KB
CJS dist\validation\index.js     20.40 KB
CJS dist\index.js                79.00 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\types\index.js.map      52.42 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\index.js.map            204.52 KB
CJS dist\variants\index.js.map   38.87 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\formula\index.js.map    38.09 KB
CJS ⚡️ Build success in 847ms
src/types/index.ts(19,1): error TS2308: Module './entities' has already exported a member named 'VariantConfig'. Consider explicitly re-exporting to resolve the ambiguity.

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
PS C:\DEV\PMERIT\pmerit-ai-platform> # Test core
PS C:\DEV\PMERIT\pmerit-ai-platform> pnpm --filter @aixord/core test

> @aixord/core@1.0.0 test C:\dev\pmerit\pmerit-ai-platform\packages\core
> vitest

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

 DEV  v1.6.1 C:/dev/pmerit/pmerit-ai-platform/packages/core

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
   Start at  20:00:37
   Duration  880ms (transform 387ms, setup 0ms, collect 1.15s, tests 75ms, environment 1ms, prepare 885ms)


 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit


 RERUN  rerun all tests

 ✓ __tests__/formula.test.ts (27)
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
 ✓ __tests__/state.test.ts (21)
 ✓ __tests__/validation.test.ts (25)

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
   Start at  20:03:11
   Duration  176ms


 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit

  Watch Usage
  press a, return to rerun all tests
  press r to rerun current pattern tests
  press f to rerun only failed tests
  press u to update snapshot
  press p to filter by a filename
  press t to filter by a test name regex pattern
  press w to filter by a project name
  press q to quit
C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 test: `vitest`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform> cd C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check what's in index.ts
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> type index.ts
/**
 * AIXORD Core Types
 *
 * Re-exports all type definitions.
 *
 * @module @aixord/core/types
 */

// State types
export * from './state';

// Governance types
export * from './governance';

// Entity types
export * from './entities';

// Variant types
export * from './variants';
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check entities.ts for VariantConfig
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "entities.ts" -Pattern "VariantConfig"

entities.ts:434:  configJson: VariantConfig;
entities.ts:446:export interface VariantConfig {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types>
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Check variants.ts for VariantConfig
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> Select-String -Path "variants.ts" -Pattern "VariantConfig"

variants.ts:82:export interface VariantConfig {


PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> # Replace index.ts with explicit exports to avoid collision
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
>> // Entity types (exclude VariantConfig - it's in variants.ts)
>> export {
>>   User,
>>   UserRole,
>>   UserPreferences,
>>   Project,
>>   ProjectStatus,
>>   Artifact,
>>   ArtifactType,
>>   ArtifactBinding,
>>   BindingMethod,
>>   License,
>>   LicenseType,
>>   Team,
>>   TeamMember,
>>   TeamRole,
>>   AuditLogEntry,
>>   AuditAction,
>>   Variant,
>>   VariantStatus
>> } from './entities';
>>
>> // Variant types (canonical source for VariantConfig)
>> export * from './variants';
>> '@ | Out-File -FilePath "index.ts" -Encoding ascii
PS C:\DEV\PMERIT\pmerit-ai-platform\packages\core\src\types> cd C:\DEV\PMERIT\pmerit-ai-platform
PS C:\DEV\PMERIT\pmerit-ai-platform>
PS C:\DEV\PMERIT\pmerit-ai-platform> # Rebuild
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

 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:13 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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




 WARN  ▲ [WARNING] The condition "types" here will never be used as it comes after both "import" and "require" [package.json]                   8:06:14 PM

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
CJS dist\validation\index.js     20.40 KB
CJS dist\gates\index.js          24.67 KB
CJS dist\index.js                79.00 KB
CJS dist\formula\index.js        14.41 KB
CJS dist\types\index.js          15.64 KB
CJS dist\variants\index.js       15.06 KB
CJS dist\validation\index.js.map 59.57 KB
CJS dist\gates\index.js.map      69.76 KB
CJS dist\index.js.map            204.52 KB
CJS dist\formula\index.js.map    38.09 KB
CJS dist\types\index.js.map      52.42 KB
CJS dist\variants\index.js.map   38.87 KB
CJS ⚡️ Build success in 773ms
ESM dist\validation\index.mjs     18.97 KB
ESM dist\formula\index.mjs        14.00 KB
ESM dist\types\index.mjs          14.76 KB
ESM dist\index.mjs                75.25 KB
ESM dist\variants\index.mjs       14.81 KB
ESM dist\gates\index.mjs          23.69 KB
ESM dist\validation\index.mjs.map 59.51 KB
ESM dist\formula\index.mjs.map    38.09 KB
ESM dist\types\index.mjs.map      52.42 KB
ESM dist\index.mjs.map            204.45 KB
ESM dist\variants\index.mjs.map   38.87 KB
ESM dist\gates\index.mjs.map      69.76 KB
ESM ⚡️ Build success in 782ms
src/types/index.ts(18,3): error TS2305: Module '"./entities"' has no exported member 'UserRole'.
src/types/index.ts(21,3): error TS2724: '"./entities"' has no exported member named 'ProjectStatus'. Did you mean 'ProjectState'?
src/types/index.ts(23,3): error TS2724: '"./entities"' has no exported member named 'ArtifactType'. Did you mean 'Artifact'?
src/types/index.ts(24,3): error TS2724: '"./entities"' has no exported member named 'ArtifactBinding'. Did you mean 'ArtifactWithBinding'?
src/types/index.ts(25,3): error TS2459: Module '"./entities"' declares 'BindingMethod' locally, but it is not exported.
src/types/index.ts(27,3): error TS2459: Module '"./entities"' declares 'LicenseType' locally, but it is not exported.
src/types/index.ts(31,3): error TS2305: Module '"./entities"' has no exported member 'AuditLogEntry'.
src/types/index.ts(32,3): error TS2305: Module '"./entities"' has no exported member 'AuditAction'.
src/types/index.ts(34,3): error TS2305: Module '"./entities"' has no exported member 'VariantStatus'.

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
PS C:\DEV\PMERIT\pmerit-ai-platform> # Test
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
   Start at  20:06:21
   Duration  927ms (transform 352ms, setup 0ms, collect 1.12s, tests 88ms, environment 1ms, prepare 834ms)

C:\dev\pmerit\pmerit-ai-platform\packages\core:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @aixord/core@1.0.0 test: `vitest "--run"`
Exit status 1
PS C:\DEV\PMERIT\pmerit-ai-platform>
