module.exports = {
	root: true,
	env: {
		node: true,
	},
	plugins: ['prettier'],
	extends: ['plugin:vue/essential', '@vue/standard', 'prettier'],
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
	},
	parserOptions: {
		parser: 'babel-eslint',
	},
};
