import host, {
	marketHost
} from './config.js'
import {
	showModal,
	showLoading,
	showToast,
	getPage1,
	login
} from './index'
// 获取token
export const getToken = async () => {
	const token = wx.getStorageSync('lbtoken')
	return token
}
const request = async (params) => {
	return new Promise(async (resolve, reject) => {
		return wx.request({
			...params,
			success: (res) => {
				resolve(res.data)
			}
		})
	})
}
let netWork = {
	isConnected: true,
	networkType: true
}
// 监听网络状态
wx.onNetworkStatusChange(function(res) {
  console.log(res,'‘网络状态*******************************************')
	netWork = res
})
/**
 * @param {Object} before 请求前的询问
 * @param {Object} loading 请求过程中的loading
 * @param {Object} fn 请求完后执行的回调
 * @param {Object} data 请求的参数
 * @param {Object} modal 请求完后的对话框
 * @param {Object} hint 请求完后的提示框
 */
export default async (params) => {
	let lbhost = host
	if (params.market) lbhost = marketHost
	if (!netWork.isConnected || netWork.networkType === 'none') {
		return showModal({
			content: '没有网络'
		})
	}
	if (params.before) {
		const res = await showModal(params.before, true)
		if (!res.confirm) return
	}
	if (params.method === 'DELETE') {
		const res = await showModal({
			content: '您确认删除吗！'
		}, true)
		if (!res.confirm) return
	}
	let token = await getToken()
	if (params.loading) showLoading(params.loading)
	let res = await request({
		url: `${lbhost}${params.url}`,
		data: params.data,
		method: params.method || 'GET',
		header: {
			'content-type': 'application/json',
			token: token,
			customerId: '',
		}
	})
	if (res.code === -999) login()
	if (res.code === -1 && getPage1(1).route !== 'power/authorize') wx.navigateTo({
		url: '/power/authorize'
	});
	if (res.code === -2 && getPage1(1).route !== 'power/login'){
        getApp().$wepy.$options.globalData.sysState = false;
        wx.navigateTo({
        	url: '/power/login'
        });
    } 
	if (res.code === 0 && !params.market) showModal({
		content: res.msg
	})
	if (params.loading) wx.hideLoading()
	if (params.fn) params.fn(res)
	if (params.hint) await showToast(params.hint, res)
	if (params.modal) showModal(params.modal, res)
	if (params.backloading) showToast(params.backloading, res)
	if (params.fn) params.fn(res)
	if (params.prompt) {

	}
	return new Promise(async (resolve, reject) => {
		if (res.code === 1 || params.market) return resolve(res.data)
		if (res.code === -4 || params.market) return resolve(res.data)
	})
}
