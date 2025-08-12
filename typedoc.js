// --exclude **/*.spec.ts --target ES6 --mode file
module.exports = {
  mode: 'file',
  target: 'ES6',
  exclude: [
    '**/*.spec.ts',
    'src/lib/number/**/*'
  ]
}
