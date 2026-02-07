import { build, context } from "esbuild";
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const outdir = "dist";
const isWatch = process.argv.includes("--watch");

// Ensure dist and icons directories exist
if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true });
}
if (!existsSync(join(outdir, "icons"))) {
  mkdirSync(join(outdir, "icons"), { recursive: true });
}

const commonConfig = {
  bundle: true,
  target: "es2022",
  platform: "browser",
  sourcemap: isWatch ? "inline" : false,
  minify: !isWatch,
};

async function buildAll() {
  // Build sidepanel React app
  await build({
    ...commonConfig,
    entryPoints: ["src/sidepanel/index.tsx"],
    outfile: `${outdir}/sidepanel.js`,
    format: "esm",
    jsx: "automatic",
  });

  // Build background service worker
  await build({
    ...commonConfig,
    entryPoints: ["src/background/index.ts"],
    outfile: `${outdir}/background.js`,
    format: "esm",
  });

  // Copy static files
  copyFileSync("manifest.json", `${outdir}/manifest.json`);
  copyFileSync("sidepanel.html", `${outdir}/sidepanel.html`);

  // Copy icons if they exist, otherwise create placeholder
  const iconSizes = [16, 32, 48, 128];
  for (const size of iconSizes) {
    const iconPath = `icons/icon${size}.png`;
    if (existsSync(iconPath)) {
      copyFileSync(iconPath, `${outdir}/${iconPath}`);
    }
  }

  console.log("Build complete: dist/");
}

async function watchMode() {
  const sidepanelCtx = await context({
    ...commonConfig,
    entryPoints: ["src/sidepanel/index.tsx"],
    outfile: `${outdir}/sidepanel.js`,
    format: "esm",
    jsx: "automatic",
  });

  const backgroundCtx = await context({
    ...commonConfig,
    entryPoints: ["src/background/index.ts"],
    outfile: `${outdir}/background.js`,
    format: "esm",
  });

  // Initial build and copy
  await buildAll();

  // Start watching
  await sidepanelCtx.watch();
  await backgroundCtx.watch();
  console.log("Watching for changes...");
}

if (isWatch) {
  watchMode();
} else {
  buildAll();
}
