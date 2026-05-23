const fs = require('fs/promises');
const path = require('path');
const { minify: terserMinify } = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');
const CleanCSS = require('clean-css');
const { minify: htmlMinify } = require('html-minifier-terser');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const buildDir = path.join(projectRoot, 'build');

async function getFilesRecursively(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return getFilesRecursively(fullPath);
    return [fullPath];
  }));
  return nested.flat();
}

async function writeBuildFile(relativePath, content) {
  const targetPath = path.join(buildDir, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, content, 'utf8');
}

async function copyBuildFile(relativePath) {
  const sourcePath = path.join(publicDir, relativePath);
  const targetPath = path.join(buildDir, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

async function buildJavaScript(relativePath) {
  const sourcePath = path.join(publicDir, relativePath);
  const sourceCode = await fs.readFile(sourcePath, 'utf8');

  const minified = await terserMinify(sourceCode, {
    compress: true,
    mangle: true,
    format: { comments: false }
  });

  if (!minified.code) {
    throw new Error(`Terser returned empty output for ${relativePath}`);
  }

  const obfuscated = JavaScriptObfuscator.obfuscate(minified.code, {
    compact: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    stringArray: true,
    stringArrayThreshold: 0.75,
    controlFlowFlattening: false,
    deadCodeInjection: false
  });

  await writeBuildFile(relativePath, obfuscated.getObfuscatedCode());
}

async function buildCss(relativePath) {
  const sourcePath = path.join(publicDir, relativePath);
  const sourceCss = await fs.readFile(sourcePath, 'utf8');
  const result = new CleanCSS({ level: 2 }).minify(sourceCss);

  if (result.errors.length) {
    throw new Error(`CleanCSS failed for ${relativePath}: ${result.errors.join('; ')}`);
  }

  await writeBuildFile(relativePath, result.styles);
}

async function buildHtml(relativePath) {
  const sourcePath = path.join(publicDir, relativePath);
  const sourceHtml = await fs.readFile(sourcePath, 'utf8');

  const minifiedHtml = await htmlMinify(sourceHtml, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true
  });

  await writeBuildFile(relativePath, minifiedHtml);
}

async function runBuild() {
  await fs.rm(buildDir, { recursive: true, force: true });
  await fs.mkdir(buildDir, { recursive: true });

  const files = await getFilesRecursively(publicDir);

  let htmlCount = 0;
  let cssCount = 0;
  let jsCount = 0;
  let copiedCount = 0;

  for (const filePath of files) {
    const relativePath = path.relative(publicDir, filePath);
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.js') {
      await buildJavaScript(relativePath);
      jsCount += 1;
      continue;
    }

    if (ext === '.css') {
      await buildCss(relativePath);
      cssCount += 1;
      continue;
    }

    if (ext === '.html') {
      await buildHtml(relativePath);
      htmlCount += 1;
      continue;
    }

    await copyBuildFile(relativePath);
    copiedCount += 1;
  }

  console.log(`Build complete: HTML ${htmlCount}, CSS ${cssCount}, JS ${jsCount}, copied ${copiedCount}.`);
  console.log(`Output directory: ${buildDir}`);
}

runBuild().catch((error) => {
  console.error('Build failed:', error.message);
  process.exit(1);
});
