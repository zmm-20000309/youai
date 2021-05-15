import host from './config'
import lbajax from './ajax'

export const dynamic = (data) => {
    if(getApp().$wepy.$options.globalData.clerkId) {
        data.clerkId = getApp().$wepy.$options.globalData.clerkId
    }
    console.log(data,'动态参数')
    lbajax({
        url: 'user/visitInfoSave',
        method: 'POST',
        data: data
    }).then((res) => {

    })
}

export const getCommentList = () => {
    return new Promise((resolve, reject) => {
        lbajax({
            url: 'redis/getPhone',
        }).then((res) => {
            if (res) {
                lbajax({
                    url: 'redis/getCommentList?phone=' + res,
                }).then((res) => {
                    resolve(res)
                })
            }
        })
    })
}
export const showModal = async (params, showCancel) => {
    return new Promise(async (resolve, reject) => {
        return wx.showModal({
            title: params.title || '友情提示',
            content: params.content || '您确认吗？',
            showCancel: params.showCancel || showCancel || false,
            confirmColor: '#3CA5C3',
            success: res => {
                if (res.confirm) {
                    resolve(res)
                } else if (res.cancel) {
                    reject(res)
                }
            }
        })
    })
}
export const showLoading = async (params) => {
    return new Promise(async (resolve, reject) => {
        return wx.showLoading({
            title: params.title || '正在处理',
            icon: params.icon || 'loading',
            mask: true
        })
    })
}
export const showToast = async (params, res) => {
    return new Promise(async (resolve, reject) => {
        return wx.showToast({
            title: params.title || res.msg,
            icon: params.icon || 'loading',
            duration: params.duration || 2000,
            async complete() {
                await sleep()
                resolve()
            }
        })
    })
}
export const getPage = (pageName) => {
    let pages = getCurrentPages()
    return pages.find(function(page) {
        return page.__route__ === pageName
    })
}
export const getPage1 = (num = 1) => {
    if (getCurrentPages().length !== 0) {
        return getCurrentPages()[getCurrentPages().length - num]
    }
}
export function upload(count) {
    return new Promise((r, j) => {
        wx.chooseImage({
            count,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                showLoading({
                    title: '上传中...'
                })
                const tempFilePaths = res.tempFilePaths
                const all = []
                tempFilePaths.forEach(item => {
                    const pro = uploadFile(item)
                    all.push(pro)
                });
                Promise.all(all).then(res => {
                    r(res.flat())
                    wx.hideLoading()
                })
            }
        })
    })
}
export function uploadFile(filePath, url = host + 'file/img/3', name = 'upfiles') {
    return new Promise((r, j) => {
        wx.uploadFile({
            url,
            header: {
                token: wx.getStorageSync('lbtoken'),
                'content-type': 'application/json',
            },
            filePath,
            name,
            formData: {},
            success(res) {
                const data = JSON.parse(res.data).data
                r(data)
            }
        })
    })
}
export function formData(arg, date = new Date()) {
    const arry = arg.split("-")
    const lbDate = new Date(date)
    const lbdate = {
        YYYY: lbDate.getFullYear(),
        mm: lbDate.getMonth() + 1,
        dd: lbDate.getDate()
    }
    let data = ''
    arry.forEach((item, index) => {
        if (index > 0) {
            data += `-${lbdate[item]}`
        } else {
            data += String(lbdate[item])
        }
    })
    return data
}
export function uploadVideo() {
    return new Promise((r, j) => {
        wx.chooseVideo({
            sourceType: ['album', 'camera'],
            compressed: true,
            maxDuration: 60,
            camera: 'back',
            success(res) {
                showLoading({
                    title: '上传中...'
                })
                console.log(res.tempFilePath)
                uploadFile(res.tempFilePath, host + 'file/uploadMedia', "upfile")
                    .then(res => {
                        r(res)
                        wx.hideLoading()
                    })
            }
        })
    })
}

// 防抖
export function debounce(fn, wait = 1000) {
    let timeout = null;
    return function() {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
    }
}
// 节流
export function throttle(fn, gapTime = 1000) {
    if (gapTime == null || gapTime == undefined) {
        gapTime = 2000
    }
    let _lastTime = null
    // 返回新的函数
    return function() {
        let _nowTime = +new Date()
        if (_nowTime - _lastTime > gapTime || !_lastTime) {
            fn.apply(this, arguments)
            _lastTime = _nowTime
        }
    }
}
// 等待
export async function sleep(time = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}

// 生成嗨拓客路径
export function createMarketUrl(item) {
    let url
    switch (item.activityType) {
        case "1":
            url = "/groupBooking";
            break;
        case "3":
            url = "/theregistrationlist";
            break;
        case "4":
            url = "/seefirst";
            break;
        case "5":
            url = "/seckillActivities";
            break;
        case "15":
            url = "/activity";
            break;
        case "16":
            url = "/pushHome";
            break;
        default:
            break;
    }
    return url += `?activityId=${item.activityId}&clerkId=${item.clerkId}&storeId=${item.storeId}`
}

export function login() {
    wx.login({
        success(res) {
            lbajax({
                url: '/wx/login?code=' + res.code,
                method: 'GET'
            }).then(res => {
                console.log(222222222222)
                wx.setStorageSync('lbtoken', res.token);
                const currentPage = getPage1()
                currentPage.$wepy.lbinit()
            });
        }
    });
}
