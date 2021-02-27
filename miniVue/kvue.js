function getData(data, vm) {
    return data.call(vm, vm)
  }
  // 多层对象时获取对象的值
  function parsePath (path) {
    const segments = path.split('.');
    return function (obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]]
      }
      return obj
    }
  }
  function initMethods(vm, methods) {
    for(let key in methods) {
      vm[key] = typeof methods[key] !== 'function' ? function(){} : methods[key].bind(vm)
    }
  }
   
  function initWatch(vm, watch) {
    for(let key in watch) {
      new Watcher(vm, key, watch[key])
    }
  }
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/
  class Kvue{
    constructor(option) {
      // 初始化data
      let data = option.data
      data = this.$data = typeof data === 'function'
      ? getData(data, this)
      : data || {}
      const keys = Object.keys(data)
      var i = keys.length
      while(i--) {
        this.proxyData(keys[i])
      }
      this.observe(this.$data)
      // 初始化watch
      initWatch(this, option.watch)
      // 初始化methods
      initMethods(this, option.methods)
      // 模板编译-
      new Compile(this,option.el)
      // 生命周期
      if(option.created){
        option.created.call(this)
      }
    }
    // 观察者
    observe(obj) {
      // 判断是否符合标准，有值并且是个对象，如果不是对象则不进行遍历操作
      if(!obj || Object.prototype.toString.call(obj) !== '[object Object]') return
      // 遍历obj对象的属性，获取属性值后执行数据响应化处理
      Object.keys(obj).forEach((key) => {
        // 响应化处理
        this.defineProperty(obj, key, obj[key])
      })
    }
    defineProperty(obj,key,val) {
      // 调用观察者，如果val是对象会再执行遍历对象属性值的操作
      this.observe(val)
      // 对象的每个属性都会执行defineProperty方法，也意味着每个属性都有一个dep实例，
      // 用addDep来收集这个属性在使用的时候的Dep.tergat（前提是Dep.tergat有值）
      // 使用数组是因为一个属性在模板中可能有多个地方都在用
      const dep = new Dep()
      Object.defineProperty(obj, key, {
        get(){
          // 依赖收集-收集 Watcher
          Dep.tergat&&dep.addDep(Dep.tergat)
          return val
        },
        set(newVal) {
          if(newVal === val) {
            return
          }
          val = newVal
          // 当数据发生变化时执行
          dep.notify()
        }
      })
    }
    // 代理函数-一次赋值就可以影响this[key]和this.$data[key]，也不会影响this.$data绑定的依赖
    proxyData(key) {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key]
        },
        set(newVal) {
          this.$data[key] = newVal
        }
      })
    }
  }
  class Dep {
    constructor() {
      // deps用来储存watcher
      this.deps = []
    }
    addDep(dep) {
      this.deps.push(dep)
    }
    notify() {
      // 更新watcher方法
      this.deps.forEach((watcher) => {
        watcher&&watcher.update()
      })
    }
  }
   
  // 模板编译的时候会获取watcher
  class Watcher {
    constructor(vm,key,cb) {
      this.vm = vm
      this.key = key
      // 将Dep.tergat绑定上watcher
      Dep.tergat = this
      // 获取this.vm[key]的时候会执行key的get方法，从而将Watcher收集到deps
      parsePath(this.key)(this.vm)
      // 回调方法用来更新模板内容
      this.cb = cb
      // 初始化更新
      this.update()
    }
    update() {
      this.cb.call(this.vm, parsePath(this.key)(this.vm))
    }
  }
   
  class Compile {
    // vm是指vue的this，el用来获取html数据
    constructor(vm, el) {
      this.$vm = vm
      this.$el = document.getElementById(el)
      // 如果存在$el节点
      if(this.$el) {
        this.$fragment = this.nodeFragment(this.$el)
        // 执行编译
        this.compile(this.$fragment)
        // 将编译后的元素添加到el
        this.$el.appendChild(this.$fragment)
      }
    }
    nodeFragment(el) {
      // DocumentFragment节点不属于文档树，继承的parentNode属性总是null。
      // 它有一个很实用的特点，当请求把一个DocumentFragment节点插入文档树时，插入的不是DocumentFragment自身，而是它的所有子孙节点，即插入的是括号里的节点。
      // 这个特性使得DocumentFragment成了占位符，暂时存放那些一次插入文档的节点。它还有利于实现文档的剪切、复制和粘贴操作。
      // 另外，当需要添加多个dom元素时，如果先将这些元素添加到DocumentFragment中，再统一将DocumentFragment添加到页面，会减少页面渲染dom的次数，效率会明显提升。
      // 如果使用appendChid方法将原dom树中的节点添加到DocumentFragment中时，会删除原来的节点
   
      // 创建一个虚拟的节点对象
      const frag = document.createDocumentFragment()
      // 将el的子元素添加到createDocumentFragment节点
      let child
      while (child = el.firstChild) {
        // 使用appendChid方法在向frag添加子元素的同时删除了el的子元素
        frag.appendChild(child)
      }
      return frag
    }
    compile(frag) {
      const nodes = frag.childNodes || []
      // Array.from将nodelist转为可以循环的数组
      Array.from(nodes).forEach((node, index) => {
        // html文档中的回车空格等也是一个node节点（#text）
        // console.log(frag,node,node.nodeType)
        if(this.isElement(node)) {
          // 如果是一个元素节点则获取它的attributes，根据attributes来获取指令和方法绑定等
          const attributes = node.attributes
          Array.from(attributes).forEach((attr) => {
            const name = attr.name
            const value = attr.value
            if(this.isDirective(name)){
              // 获取指令名称
              const directive = name.substring(2)
              // 如果存在这个指令，则执行这个指令
              this[directive] && this[directive](node, this.$vm, value)
            }
            if(this.isEvent(name)) {
              // 指定事件名。
              const event = name.substring(1)
              this.eventHandler(node, this.$vm, event, value)
            }
          })
        }
        if(this.isTextNode(node)) {
          this.textNode(node, this.$vm)
        }
   
        if(node.childNodes){
          // 递归
          this.compile(node)
        }
      })
    }
    update(node, vm, exp, type) {
      const updateFn = this[`update${type}`]
      // 依赖绑定
      new Watcher(vm,exp,function(value){
        updateFn&&updateFn(node,value)
      })
    }
    // nodeType 属性返回以数字值返回指定节点的节点类型
    // Node.ELEMENT_NODE  1   一个 元素 节点，例如 <p> 和 <div>。
    // Node.TEXT_NODE 3   Element 或者 Attr 中实际的  文字
    // Node.CDATA_SECTION_NODE    4   一个 CDATASection，例如 <!CDATA[[ … ]]>。
    // Node.PROCESSING_INSTRUCTION_NODE   7   一个用于XML文档的 ProcessingInstruction ，例如 <?xml-stylesheet ... ?> 声明。
    // Node.COMMENT_NODE  8   一个 Comment 节点。
    // Node.DOCUMENT_NODE 9   一个 Document 节点。
    // Node.DOCUMENT_TYPE_NODE    10  描述文档类型的 DocumentType 节点。例如 <!DOCTYPE html>  就是用于 HTML5 的。
    // Node.DOCUMENT_FRAGMENT_NODE    11  一个 DocumentFragment 节点
   
    // 是否是元素节点
    isElement(node) {
      return node.nodeType === 1
    }
    isTextNode(node) {
      return node.nodeType === 3
    }
    // 是否是指令，以k-开头
    isDirective(attrName) {
      return attrName.startsWith('k-')
    }
    // 是否是方法
    isEvent(attrName) {
      return attrName.startsWith('@')
    }
    /*
    * @作用: text指令函数
    * @params: node 操作的节点
    * @params: vm   kvue的实例
    * @params: exp 节点的属性value值（以此来绑定对应的kvue的data）
    */
    text(node, vm, exp) {
      // 绑定更新方法
      this.update(node, vm, exp, 'Text')
    }
    textNode(node, vm) {
      const execs = defaultTagRE.exec(node.textContent)
      if(execs){
          const exp = execs[1].trimStart().trimEnd()
          console.log(' exp ', exp);
          this.update(node, vm, exp, 'TextNode')
          // 有多个{{}}时需要进行递归修改
          this.textNode(node, vm)
      }
    }
    // 文本指令更新方法
    updateText(node, value) {
      node.textContent = value
    }
     // 更新文本节点信息
    updateTextNode(node, value) {
      const textContent = node.textContent
      if(textContent) {
        node.textContent = textContent.replace(defaultTagRE, value)
      }
    }
    // 绑定方法
    eventHandler(node, vm, event, exp) {
      const fn =  vm[exp]
      node.addEventListener(event,fn)
    }
  }