// scripts/postbuild.cjs
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const glob = require('glob')

const distRoot = path.resolve('./dist')

// dist 폴더에 package.json 생성
const basePkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const minimalPkg = {
  name: basePkg.name,
  version: basePkg.version,
  description: basePkg.description,
  license: basePkg.license,
  author: basePkg.author,
  homepage: basePkg.homepage,
  browser: "umd/ibsheet-loader.min.js",
  main: "cjs/index.js",           // CJS 엔트리 (require)
  module: "esm/index.js",         // ESM 엔트리 (import)
  exports: {
    ".": {
      browser: "./umd/ibsheet-loader.min.js",
      import: "./esm/index.js",
      require: "./cjs/index.js",
    }
  },
  repository: basePkg.repository,
  bugs: basePkg.bugs,
  homepage: basePkg.homepage,
  dependencies: {
    "@ibsheet/interface": "latest",
  },
  peerDependencies: {
    "@types/node": "latest",
  }
}
fs.writeFileSync(path.join(distRoot, 'package.json'), JSON.stringify(minimalPkg, null, 2))

// README.md 복사
const readmeSrc = path.resolve('./README.md')
const readmeDest = path.join(distRoot, 'README.md')
if (fs.existsSync(readmeSrc)) {
  fs.copyFileSync(readmeSrc, readmeDest)
}

// LICENSE 복사
const licenseSrc = path.resolve('./LICENSE')
const licenseDest = path.join(distRoot, 'LICENSE')
if (fs.existsSync(licenseSrc)) {
  fs.copyFileSync(licenseSrc, licenseDest)
}

// CHANGELOG.md 복사
const changemeSrc = path.resolve('./CHANGELOG.md')
const changemeDest = path.join(distRoot, 'CHANGELOG.md')
if (fs.existsSync(changemeSrc)) {
  fs.copyFileSync(changemeSrc, changemeDest)
}

const formats = ['esm', 'cjs', 'umd']
formats.forEach((format) => {
  const libPath = path.resolve(__dirname, `../dist/${format}/lib`)
  if (fs.existsSync(libPath)) {
    fse.moveSync(libPath, path.resolve(__dirname, '../dist/lib'), { overwrite: true })
    console.log(`📦 Moved ${format}/lib → dist/lib`)
  }
})

/**
 * 경로를 '../lib'으로 재작성
 */
function fixTypeImportPaths(folderPath) {
  const dtsFiles = glob.sync(`${folderPath}/**/*.d.ts`)
  dtsFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf-8')
    content = content.replace(/from\s+['"]\.\/lib(\/[^'"]*)?['"]/g, 'from \'../lib$1\'')
    fs.writeFileSync(file, content)
    console.log(`🔧 Fixed import in ${file}`)
  })
}

// 경로 조정 실행
fixTypeImportPaths(path.resolve(__dirname, '../dist/cjs'))
fixTypeImportPaths(path.resolve(__dirname, '../dist/esm'))
fixTypeImportPaths(path.resolve(__dirname, '../dist/umd'))

// dist/umd/.js파일들에서 경로를 '../lib'으로 재작성
const fixRequirePaths = (folderPath) => {
  const jsFiles = glob.sync(`${folderPath}/**/*.js`)
  jsFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8')
    const updated = content.replace(/require\(["']\.\/lib([^"']*)["']\)/g, 'require("../lib$1")')
    if (content !== updated) {
      fs.writeFileSync(filePath, updated, 'utf-8')
      console.log(`🔧 Patched require path in: ${filePath}`)
    }
  })
}

// UMD 전용 수정
fixRequirePaths(path.resolve(__dirname, '../dist/umd'))