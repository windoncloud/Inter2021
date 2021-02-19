// 题目：红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次；如何让三个灯不断交替重复亮灯？（用Promse实现）
// https://www.cnblogs.com/dojo-lzz/p/5495671.html
function red() {
    console.log('red');
}

function green() {
    console.log('green');
}

function yellow() {
    console.log('yellow');
}

let lightChange = function(timmer, cb) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            cb();
            resolve();
        }, timmer);
    });
}

let step = function () {
    // let promiseStart = new Promise(function(resolve, reject){resolve();})
    let promiseStart = Promise.resolve();
    promiseStart.then(() => {
        return lightChange(3000, red);
    }).then(() => {
        return lightChange(2000, green);
    }).then(() => {
        return lightChange(1000, yellow);
    }).then(() => {
        step();
    });
}

step();