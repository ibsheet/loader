module.exports = {
  parser: '@typescript-eslint/parser', // TypeScript용 파서
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // TypeScript 추천 규칙
    'prettier', // Prettier 설정과 충돌 없게 함
    'plugin:prettier/recommended' // prettier 플러그인 활성화
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error', // prettier 포매팅 에러를 ESLint 에러로 처리
    // 필요에 따라 추가 규칙 작성
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/no-empty-object-type": "error",
    /*
    '@typescript-eslint/no-empty-interface': ['error', {
      allowSingleExtends: true,
      allowInterfaces: true // 또는 allowInterfaces: true (룰에 따라 다름)
    }],
    */
  }
}