let JSONP = (function () {
    function JSONP (url, options) {
        let callbackName = genCallbackName();
        let callbackMap = JSONP.callbackMap || (JSONP.callbackMap = {});
        callbackMap[callbackName] = options.jsonpCallback;
        let script = document.createElement('script');
        script.src = `${url}?callback=JSONP.callbackMap[${callbackName}]`;
        document.body.appendChild(script);
    }
    
    let genCallbackName = (function () {
        let idx = 0;
        return function genCallbackName () {
            let callbackMap = JSONP.callbackMap || {};
            let name = '__name' + idx++;
            if (callbackMap[name]) {
                return genCallbackName();
            }
            return name;
        }
    })();

    return JSONP;
})()


JSONP('http://localhost:3000/', {
    jsonpCallback (data) {
        console.log(data);
    }
});
