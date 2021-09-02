module.exports = {
  extends: [
    'eslint-config-standard',
    'plugin:node/recommended',
    'plugin:promise/recommended'
  ],
  rules: {
    'arrow-parens': ['error', 'as-needed']
  }
}
