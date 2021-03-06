export default {
	'/hello': {
		meta: {
			title: 'Hello World',
			keywords: '淘宝,掏宝,网上购物,C2C,在线交易,交易市场,网上交易,交易市场,网上买,网上卖,购物网站,团购,网上贸易,安全购物,电子商务,放心买,供应,买卖信息,网店,一口价,拍卖,网上开店,网络购物,打折,免费开店,网购,频道,店铺',
			description: '淘宝网 - 亚洲较大的网上交易平台，提供各类服饰、美容、家居、数码、话费/点卡充值… 数亿优质商品，同时提供担保交易(先收货后付款)等安全交易保障服务，并由商家提供退货承诺、破损补寄等消费者保障服务，让你安心享受网上购物乐趣！'
		},
		component: () => import('pages/hello')
	},
	'/welcome': {
		meta: {
			title: 'Welcome',
			keywords: 'Welcome',
			description: 'Welcome'
		},
		component: () => import('pages/welcome')
	}
}