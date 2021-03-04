// 剑指 Offer 49. 丑数
// 我们把只包含质因子 2、3 和 5 的数称作丑数（Ugly Number）。求按从小到大的顺序的第 n 个丑数。
// 示例:
// 输入: n = 10
// 输出: 12
// 解释: 1, 2, 3, 4, 5, 6, 8, 9, 10, 12 是前 10 个丑数。
// 说明:  
// 1 是丑数。
// n 不超过1690。

// 动态规划
/**
 * @param {number} n
 * @return {number}
 */
var nthUglyNumber = function(n) {
    const res = new Array(n);
    res[0] = 1;

    let ptr2 = 0, // 下个数字永远 * 2
        ptr3 = 0, // 下个数字永远 * 3
        ptr5 = 0; // 下个数字永远 * 5

    for (let i = 1; i < n; ++i) {
        res[i] = Math.min(res[ptr2] * 2, res[ptr3] * 3, res[ptr5] * 5);
        // 说明前ptr2个丑数*2也不可能产生比i更大的丑数了
        // 所以移动ptr2
        if (res[i] === res[ptr2] * 2) {
            ++ptr2;
        }
        if (res[i] === res[ptr3] * 3) {
            ++ptr3;
        }
        if (res[i] === res[ptr5] * 5) {
            ++ptr5;
        }
    }

    return res[n - 1];
};

// 最小堆
const defaultCmp = (x, y) => x > y;
const swap = (arr, i, j) => ([arr[i], arr[j]] = [arr[j], arr[i]]);
class Heap {
    /**
     * 默认是最大堆
     * @param {Function} cmp
     */
    constructor(cmp = defaultCmp) {
        this.container = [];
        this.cmp = cmp;
    }

    insert(data) {
        const { container, cmp } = this;

        container.push(data);
        let index = container.length - 1;
        while (index) {
            let parent = Math.floor((index - 1) / 2);
            if (!cmp(container[index], container[parent])) {
                return;
            }
            swap(container, index, parent);
            index = parent;
        }
    }

    extract() {
        const { container, cmp } = this;
        if (!container.length) {
            return null;
        }

        swap(container, 0, container.length - 1);
        const res = container.pop();
        const length = container.length;
        let index = 0,
            exchange = index * 2 + 1;

        while (exchange < length) {
            // 如果有右节点，并且右节点的值大于左节点的值
            let right = index * 2 + 2;
            if (right < length && cmp(container[right], container[exchange])) {
                exchange = right;
            }
            if (!cmp(container[exchange], container[index])) {
                break;
            }
            swap(container, exchange, index);
            index = exchange;
            exchange = index * 2 + 1;
        }

        return res;
    }

    top() {
        if (this.container.length) return this.container[0];
        return null;
    }
}

/**
 * @param {number} n
 * @return {number}
 */
var nthUglyNumber2 = function(n) {
    const heap = new Heap((x, y) => x < y);
    const res = new Array(n);
    const map = {};
    const primes = [2, 3, 5];

    heap.insert(1);
    map[1] = true;
    for (let i = 0; i < n; ++i) {
        res[i] = heap.extract();

        for (const prime of primes) {
            let tmp = res[i] * prime;
            if (!map[tmp]) {
                heap.insert(tmp);
                map[tmp] = true;
            }
        }
    }
    return res[n - 1];
};