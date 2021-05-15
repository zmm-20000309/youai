function begin() {
    wx.showLoading({
        title: '加载中',
        icon: 'loading',
        mask: true
    });
}
function end() {
    wx.hideLoading();
}

module.exports = {
    begin,
    end
};
