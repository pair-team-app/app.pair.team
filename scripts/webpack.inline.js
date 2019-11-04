const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineStylePlugin = require('html-webpack-inline-style-plugin');
const path = require('path');
const webpack = require('webpack');


const config = {
	entry: path.resolve('test', 'index.html'),
	output: {
		path: path.resolve('in-build'),
// 		publicPath: '/',
// 		filename: 'bundle.js',
	},
	plugins: [
		new CleanWebpackPlugin(),
// 		new HtmlWebpackPlugin({
// 			title: 'PairURL',
// 			filename: 'test.html',
// 			template: path.resolve('public', 'index.ejs'),
// 		}),
// 		new HtmlWebpackInlineStylePlugin(),
// 		new HtmlWebpackInlineStylePlugin({
// 			juiceOptions: {
// 				removeStyleTags: false
// 			}
// 		}),
	],
	module: {
		rules : [
			{
				test : path.resolve('test', 'index.html'),
				use  : [
					"file-loader",
					"extract-loader",
					{
						loader  : "html-loader",
						options : {
							attrs : ["img:src", "link:href"]
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: [
					"file-loader",
					"extract-loader",
					{
						loader: "css-loader",
						options: {
							sourceMap: true
						}
					}
				]
			},
		]
	}
};

webpack(config).run(function(err, stats) {
	if (err !== null) {
		console.log('Done!');
	} else {
		console.log('Error', err);
	}
});
