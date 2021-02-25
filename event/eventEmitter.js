// https://zhuanlan.zhihu.com/p/77876876
// 存放事件监听器函数
// listeners -> {
//     "event1": [f1,f2,f3]，
//     "event2": [f4,f5]，
//     ...
// }
// 构造函数
function EventEmitter() {
    this.listeners = {};
    this.maListener = 10;
}
// on方法
// 判断该事件的监听器数量是否已超限，超限则报警告
// 判断该事件监听器数组是否初始化，若未初始化，则将listeners[event]初始化为数组，并加入监听器cb
// 若监听器数组已经被初始化，则判断数组中是否已存在cb,不存在则添加，已存在则不做操作。
// 指定addListener等于on方法
EventEmitter.prototype.on = function (event, cb) {
    var listeners = this.listeners;
    if (listeners[event] && listeners[event].length >= this.maxListener) {
        throw console.error('监听器的最大数量是10，您已超出限制', this.maxListener);
    }
    if (listeners[event] instanceof Array) {
        if (listeners[event].indexOf(cb) === -1) {
            listeners[event].push(cb);
        }
    } else {
        listeners[event] = [].concat(cb);
    }
}

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

// emit方法
// 通过Array.prototype.slice.call(arguments)取出方法的参数列表args，（因为考虑简单性和兼容性所以采用ES5的冗长编码方式）
// 调用args.shift踢掉数组第一个参数即event，留下来的这些是要传给监听器的
// 遍历监听器,通过apply方法把上面得到的args参数传进去
EventEmitter.prototype.emit = function (event) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    this.listeners[event].forEach(cb => {
        cb.apply(null, args);
    })
}

// once方法
// once方法是on方法和removeListener方法的结合：用on方法监听，在回调结束的最后位置，通过removeListener删掉监听函数自身
EventEmitter.prototype.once = function (event, listener) {
    var self = this;
    function fn() {
        var args = Array.prototype.slice.call(arguments);
        listener.apply(null, args);
        self.removeListener(event, fn);
    }
    this.on(event, fn);
}

// removeAllListener方法
// 清空listeners[event]数组
EventEmitter.prototype.removeListener = function (event) {
    this.listeners[event] = [];
}

// setMaxListeners方法和listeners方法
EventEmitter.prototype.listeners = function (event) {
    return this.listeners[event];
}

EventEmitter.prototype.setMaxListeners = function (num) {
    this.maxListener = num;
}