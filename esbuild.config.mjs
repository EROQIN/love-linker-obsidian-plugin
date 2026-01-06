import esbuild from "esbuild";
import process from "node:process";

const isWatch = process.argv.includes("--watch");
const isProd = process.argv.includes("production");

const context = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian"],
  format: "cjs",
  platform: "browser",
  target: "es2018",
  sourcemap: isProd ? false : "inline",
  minify: isProd,
  outfile: "main.js",
  logLevel: "info"
});

if (isWatch) {
  await context.watch();
  console.log("esbuild is watching...");
} else {
  await context.rebuild();
  await context.dispose();
}
