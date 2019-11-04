// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackInlineStylePlugin = require('html-webpack-inline-style-plugin');
const path = require('path');
const webpack = require('webpack');

const configFactory = require('react-scripts/config/webpack.config');
const webpackConfig = configFactory('production');

const config = {
	...webpackConfig,
	output: {
		...webpackConfig.output,
		path: path.resolve('pf-build'),
		publicPath: '/',
		filename: 'bundle.js',
	},
	module: {
		...webpackConfig.module,
		rules: [
			...webpackConfig.module.rules,
// 			{
// 				test: /\.link\.css$/i,
// 				use: [
// 					{ loader: 'style-loader', options: { injectType: 'linkTag' } },
// 					{ loader: 'file-loader' },
// 				],
// 			},
// 			{
// 				test: /\.ejs$/,
// 				loader: 'ejs-loader',
// 				query: {
// 					interpolate: /<\$=([\s\S]+?)\$>/g,
// 					evaluate: /<\$([\s\S]+?)\$>/g,
// 				}
// 			},
// 			{
// 				test: /\.css$/i,
// 				use: [{
// 					loader: 'style-loader',
// 					options: { injectType: 'singletonStyleTag' },
// 				},
// 				'css-loader',
// 				],
// 			},
		]
	},

	plugins: [
		...webpackConfig.plugins,
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			title: 'PairURL',
			template: path.resolve('public', 'index.ejs'),
//// 			inlineSource: '.(js|css)$', // embed all javascript and css inline
			inlineSource: '.css$', // embed all javascript and css inline
		}),
// 		new HtmlWebpackPlugin(),
		new HtmlWebpackInlineSourcePlugin(),
		new HtmlWebpackInlineStylePlugin(),
//// 		new HtmlWebpackInlineStylePlugin({
//// 			juiceOptions: {
//// 				removeStyleTags: false
//// 			}
//// 		}),
	],
};

webpack(config).run(function(err, stats) {
	if (err !== null) {
		console.log('Done!');
	} else {
		console.log(err);
	}
});
