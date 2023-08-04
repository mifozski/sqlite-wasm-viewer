module.exports = {
    extends: [
        'airbnb-base',
        'plugin:prettier/recommended',
        'plugin:json/recommended',
    ],
    plugins: ['prettier', 'json'],
    env: {
        browser: true,
        es6: true,
    },
    rules: {
        'prettier/prettier': 'error',
        'import/prefer-default-export': 'off',
        'import/no-unresolved': 'off',
    },
    ignorePatterns: ['**/*.html'],
};
