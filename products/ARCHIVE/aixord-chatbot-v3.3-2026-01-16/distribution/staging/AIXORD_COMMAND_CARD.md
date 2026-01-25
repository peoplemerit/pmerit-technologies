# AIXORD — COMMAND CARD

+-----------------------------------------------------------------------------+
|                          AIXORD DRIVER'S PANEL                              |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  STEERING — Where to Go                                                     |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [PROJECT] CONTINUE         -> Resume work in your project                  |
|                                                                             |
|  SCOPE: [name]              -> Load specific SCOPE                          |
|  SCOPE: MASTER              -> Load full project vision                     |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  GEARS — Operating Modes                                                    |
+-----------------------------------------------------------------------------+
|                                                                             |
|  ENTER DECISION MODE        -> Open discussion, brainstorm, spec writing    |
|                               (Claude Web = Architect)                      |
|                                                                             |
|  ENTER EXECUTION MODE       -> Frozen decisions, implement specs            |
|                               (Claude Code = Commander)                     |
|                               ! Requires approved HANDOFF                   |
|                                                                             |
|  ENTER AUDIT MODE           -> Read-only investigation, no changes          |
|  AUDIT SCOPE: [name]        -> Audit specific SCOPE against reality         |
|                                                                             |
|  VISUAL AUDIT: [name]       -> Screenshot verification (UI SCOPEs)          |
|                                                                             |
|  STATUS                     -> Report current state (no work)               |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  BRAKES — Stop & Control                                                    |
+-----------------------------------------------------------------------------+
|                                                                             |
|  HALT                       -> STOP everything, return to DECISION          |
|                               (Use anytime, no questions asked)             |
|                                                                             |
|  UNLOCK: [file]             -> Allow modification of locked file            |
|  RELOCK: [file]             -> Re-protect file after changes                |
|                                                                             |
|  EXTEND ATTEMPTS: [task]    -> Allow 5 attempts instead of 3                |
|                                                                             |
|  APPROVED / PROCEED / YES   -> Explicit approval to continue                |
|  REJECTED / NO / STOP       -> Reject proposal, do not proceed              |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  DASHBOARD — Quick Status Indicators                                        |
+-----------------------------------------------------------------------------+
|                                                                             |
|  Mode Indicator:                                                            |
|    🟢 [D] DECISION    — Open discussion, safe to brainstorm                 |
|    🟡 [E] EXECUTION   — Implementing, decisions frozen                      |
|    🔵 [A] AUDIT       — Read-only, investigating                            |
|    🟣 [V] VISUAL_AUDIT— Reviewing screenshots                               |
|    🔴 [H] HALTED      — Stopped, awaiting direction                         |
|                                                                             |
|  SCOPE States:                                                              |
|    EMPTY       — File created, no content                                   |
|    AUDITED     — Reality documented                                         |
|    SPECIFIED   — HANDOFF written                                            |
|    IN_PROGRESS — Execution active                                           |
|    VISUAL_AUDIT— UI verification                                            |
|    COMPLETE    — All verified                                               |
|    LOCKED      — Protected, needs UNLOCK                                    |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  AUTOMATIC HALT TRIGGERS (AI will stop and ask)                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  * Ambiguous requirement          * Locked file touched                     |
|  * Missing specification          * 3 consecutive failures                  |
|  * Prerequisite not met           * Scope creep detected                    |
|  * Cross-repo conflict            * Visual discrepancy unresolved           |
|                                                                             |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
|  QUICK RECIPES                                                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  Start Work:                                                                |
|    -> "[PROJECT] CONTINUE"                                                  |
|                                                                             |
|  Fix Something in Locked File:                                              |
|    -> "UNLOCK: path/to/file.ts"                                             |
|    -> [make changes]                                                        |
|    -> "RELOCK: path/to/file.ts"                                             |
|                                                                             |
|  Emergency Stop:                                                            |
|    -> "HALT"                                                                |
|                                                                             |
|  Approve and Execute:                                                       |
|    -> "APPROVED. ENTER EXECUTION MODE"                                      |
|                                                                             |
+-----------------------------------------------------------------------------+

                        AIXORD — Authority. Execution. Confirmation.
