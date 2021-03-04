// 剑指 Offer 50. 第一个只出现一次的字符
// 在字符串 s 中找出第一个只出现一次的字符。如果没有，返回一个单空格。 s 只包含小写字母。
// 示例:
// s = "abaccdeff"
// 返回 "b"
// s = "" 
// 返回 " "
// 限制：
// 0 <= s 的长度 <= 50000
/**
 * @param {string} s
 * @return {character}
 */
var firstUniqChar1 = function(s) {
    for(let x of s){
        if(s.indexOf(x) === s.lastIndexOf(x)) return x
    }
    return ' '
};
// indexOf O(n), lastIndexOf O(n)

var firstUniqChar2 = function(s) {
    for (let char of new Set(s)) {
        if (s.match(new RegExp(char, 'g')).length === 1) {
          return char;
        }
      }
      return ' ';
};

var firstUniqChar3 = function(s) {
    if(!s) return " "
    let map = new Map()
    for(let c of s) {
        if(map.has(c)) {
            map.set(c, map.get(c) + 1)
        } else {
            map.set(c, 1)
        }
    }
    for(let c of map.keys()) {
        if(map.get(c) === 1) {
            return c
        }
    }
    return  ' '
};
// 时间复杂度：O(n)
// 空间复杂度：O(1)
var firstUniqChar4 = function(s) {
    let arr = new Array(26).fill(0);

    for (let c of s) {
        arr[c.charCodeAt() - 97] += 1;
    }

    for (let c of s) {
        if (arr[c.charCodeAt() - 97] == 1) {
            return c;
        }
    }
    return ' ';
};