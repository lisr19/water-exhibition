const publicPath = process.env.NODE_ENV === 'production' ? './wm_big_screen/' : './'
module.exports = {
// 基本路径
	publicPath: publicPath,
// 输出文件目录
	outputDir: 'dist',
	// devServer: {
	// 	open: true, //是否自动弹出浏览器页面
	// 	host: "", //表示启动的时候使用的域名，默认可以不写，则是使用localhost和本机IP
	// 	port: '63342', // 设置端口号
	// 	https: false,  //是否使用https协议
	// 	hotOnly: false, //是否开启热更新
	// 	proxy: {
	// 		'/api': {
	// 			target: 'http://yd.msword.top', //API服务器的地址
	// 			ws: true, //代理websockets
	// 			changeOrigin: true, // 是否跨域，虚拟的站点需要更管origin
	// 			pathRewrite: {
	// 				// '^/api5'是一个正则表达式，表示要匹配请求的url中，全部'http://localhost:8081/api5' 转接为 http://localhost:8081/api/
	// 				'^/api5': '/api',
	// 				//重写路径 比如'/api/aaa/ccc'重写为'/aaa/ccc'
	// 				'^/api': '',
	// 			}
	// 		},
	// 		'/foo': {
	// 			target: 'http://yd.abc.top'
	// 		}
	// 	},
	// }
}
