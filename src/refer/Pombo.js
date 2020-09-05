function importFromBelow () {

  const TEXT_ELEMENT = 'TEXT ELEMENT'
  /*
  type: 元素类型
  config:props
  ...args:childrens
*/
  function createElement (type, config, ...args) {

    const props = { ...config }
    const hasChildren = args.length > 0
    const rawChildren = hasChildren ? [...args] : []

    // props.children能获取所有的children
    props.children = rawChildren

      // 过滤 null和false
      .filter(c => c !== null && c !== false)
      // 如果children 不是 对象 创建一个 文本元素
      .map(c => (c instanceof Object) ? c : createTextElement(c))

    return { type, props }
  }

  // 创建文本元素
  function createTextElement (value) {
    return createElement(TEXT_ELEMENT, { nodeValue: value })
  }

  // 是否为事件(时间开头是on)
  const isEvent = name => name.startsWith('on')
  // 是否为属性
  const isAttribute = name => !isEvent(name) && name != 'children' && name != 'style'
  // 是否为新值
  const isNew = (prev, next) => key => prev[key] !== next[key]
  // 是否不包含
  const isGone = (prev, next) => key => !(key in next)

  // 更新dom
  function updateDomProperties (dom, prevProps, nextProps) {

    // 移除所有事件
    Object.keys(prevProps).filter(isEvent)
      .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2) //  click change
        dom.removeEventListener(eventType, prevProps[name])
      })
    //  移除所有属性
    Object.keys(prevProps).filter(isAttribute)
      .filter(isGone(prevProps, nextProps))
      .forEach(name => {
        dom[name] = null
      })
    //  设置属性
    Object.keys(nextProps)
      .filter(isAttribute)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        dom[name] = nextProps[name]
      })
    //  设置样式
    prevProps.style = prevProps.style || {}
    nextProps.style = nextProps.style || {}
    Object.keys(nextProps.style)
      .filter(isNew(prevProps.style, nextProps.style))
      .forEach(key => {
        dom.style[key] = nextProps.style[key]
      })
    Object.keys(prevProps.style)
      .filter(isGone(prevProps.style, nextProps.style))
      .forEach(key => {
        dom.style[key] = ""
      })
    // 添加事件
    Object.keys(nextProps)
      .filter(isEvent)
      .filter(isNew(prevProps, nextProps))
      .forEach(name => {
        const eventType = name.toLowerCase().substring(2)
        dom.addEventListener(eventType, nextProps[name])
      })

  }

  //  创建DOM对象
  function createDomElement (fiber) {
    // 是否属于文本类型
    const isTextElement = fiber.type === TEXT_ELEMENT
    const dom = isTextElement
      ? document.createTextNode("")
      : document.createElement(fiber.type)

    updateDomProperties(dom, [], fiber.props)
    // 返回一个dom对象
    return dom
  }


  // 组件构造方法
  class Component {
    constructor(props) {
      this.props = props || {}
      this.state = this.state || {}
    }
    setState (partiaState) {
      scheduleUpdate(this, partiaState)
    }
  }
  // 创建实例
  function createInstance (fiber) {
    const instance = new fiber.type(fiber.props)
    instance.__fiber = fiber
    return instance
  }


  // fiber类型
  const HOST_COMPONENT = 'host'
  const CLASS_COMPONENT = 'class'
  const HOST_ROOT = 'root'

  // 影响等级
  const PLACEMENT = 1
  const DELETION = 2
  const UPDATE = 3

  // 更新时间
  const ENOUGH_TIME = 1

  // 全局状态
  const updateQueue = []
  // 下一个任务
  let nextUnitOfWork = null
  // 等待提交
  let pendingCommit = null

  /**
 * 
 * @param {*} elements 要渲染的组件
 * @param {*} containerDom 挂载的dom节点
 */
  function render (elements, containerDom) {
    // 往队列里面添加任务
    updateQueue.push({
      from: HOST_ROOT,
      dom: containerDom,
      newProps: { children: elements }
    })
    // requestIdleCallback  安排工作,WebAPI
    requestIdleCallback(performWork)
  }

  /**
   * 调用class类的setState时会调用该函数
   * @param {*} instance class函数或无状态海曙
   * @param {*} partiaState 新的state
   */
  function scheduleUpdate (instance, partiaState) {
    updateQueue.push({
      from: CLASS_COMPONENT,
      instance: instance,
      partiaState: partiaState
    })
    requestIdleCallback(performWork)
  }

  /**
   * 每次requestIdleCallback调用时执行的函数
   * @param {*} deadline 是否这一帧还有时间留给react
   */
  function performWork (deadline) {
    // 任务循环
    workLoop(deadline)
    // 如果有下一个任务,或者任务队列中还有任务
    // 无限循环任务
    if (nextUnitOfWork || updateQueue.length > 0) {
      requestIdleCallback(performWork)
    }
  }

  /**
   * 一次处理一个,或者多个Fiber,具体多少看每一帧还剩下多少时间
   * 如果一个Fiber消耗太多时间,那么就会等到下一帧在处理下一个Fiber
   * @param {*} deadline 是否这一帧过去
   */
  function workLoop (deadline) {
    //  首次render nextUnitOfWork  是这样
    // {
    //   alternate: undefined
    //   props: { children: {... } }
    //   stateNode: div#root
    //   tag: 'root'
    // }
    // children里有个重要的参数是 type fn App(props)
    if (!nextUnitOfWork) {
      resetNextUnitOfWork()
    }
    while (nextUnitOfWork) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    if (pendingCommit) {
      commitAllWork(pendingCommit)
    }
  }

  /*
    重置下一个任务
  */
  function resetNextUnitOfWork () {
    // 将第一个任务取出,(删除原第一个,返回删除的值,会改变原数组)
    const update = updateQueue.shift()
    if (!update) {
      return
    }

    // 将设置的的参数从 update的payload 复制到 对应的fiber
    if (update.partiaState) {
      update.instance.__fiber.partiaState = update.partiaState
    }

    const root = update.from === HOST_ROOT
      ? update.dom._rootContainerFiber
      : getRoot(update.instance.__fiber)

    nextUnitOfWork = {
      tag: HOST_ROOT,
      stateNode: update.dom || root.stateNode,
      props: update.newProps || root.props,
      alternate: root
    }
  }

  /*
    获取根节点
  */
  function getRoot (fiber) {
    let node = fiber
    // 一直循环找出fiber的最顶级根节点
    while (node.parent) {
      node = node.parent
    }
    return node
  }

  /**
   * 开始遍历所有的fiber节点
   * @param {*} wipFiber 当前的fiber节点
   * @return nextChild
   */
  function performUnitOfWork (wipFiber) {
    // 开始任务
    beginWork(wipFiber)
    if (wipFiber.child) {
      return wipFiber.child
    }
    // 如果没有子节点,就看这个节点有没有sibling(调用completeWork)
    let uow = wipFiber
    while (uow) {
      // 收集当前节点的effect,然后向上传递
      completeWork(uow)
      if (uow.sibling) {
        //  sibling需要已经工作工作
        return uow.sibling
      }
      // 没有sibling,回到这个节点的父亲,看看有没有sibling
      uow = uow.parent
    }
  }

  /**
   *  根据fiber的类型,选择不同的更新fiber策略
   * @param {*} wipFiber 当前fiebr 
   */
  function beginWork (wipFiber) {
    // 如果是类组件,调用更新类组件方法
    if (wipFiber.tag == CLASS_COMPONENT) {
      updateClassComponent(wipFiber)
    } else {
      // 否则调用更新根组件的方法
      updateHostComponent(wipFiber)
    }
  }
  /**
   * 更新host,文字或者原生dom节点
   * @param {*} wipFiber 当前的fiber节点
   */
  function updateHostComponent (wipFiber) {
    // 如果fiber没有节点,那么根据wipFiber创建一个dom对象
    if (!wipFiber.stateNode) {
      wipFiber.stateNode = createDomElement(wipFiber)
    }
    //  当一个fiber对应的stateNode是原生节点,那么它的children就是放在props里
    const newChildElements = wipFiber.props.children
    // 调和children数组
    reconcileChildrenArray(wipFiber, newChildElements)
  }

  /*
  更新类组件
*/
  function updateClassComponent (wipFiber) {
    let instance = wipFiber.stateNode
    if (instance == null) {
      // 如果是mount阶段 构建一个instance
      instance = wipFiber.stateNode = createInstance(wipFiber)
    }
    else if (wipFiber.props == instance.props && !wipFiber.partiaState) {
      // 不需要渲染,直接从上次中克隆children fiber
      cloneChildFibers(wipFiber)
      return
    }
    // 将新的state,props刷给当前的instance
    instance.props = wipFiber.props
    instance.state = Object.assign({}, instance.state, wipFiber.partiaState)
    wipFiber.partiaState = null

    // wipFiber 代表老的,newChildren代表新的
    //  该函数会返回child队列中的第一个
    const newChildElements = wipFiber.stateNode.render()
    reconcileChildrenArray(wipFiber, newChildElements)
  }

  /*
  将数组转化成数组
  */
  function arrify (val) {
    return val == null ? [] : Array.isArray(val) ? val : [val]
  }

  /**
   * 返回currentFiber节点的子节点fiber
   * @param {*} wipFiber 当前fiber节点
   * @param {*} newChildElements 子节点(此时是虚拟dom)
   */
  function reconcileChildrenArray (wipFiber, newChildElements) {
    const elements = arrify(newChildElements)

    let index = 0
    let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null
    let newFiber = null

    while (index < elements.length || oldFiber != null) {
      // 上一个fiber
      const prevFiber = newFiber
      // 取出每个 element
      const element = index < elements.length && elements[index]
      // 相同类型
      const sameType = oldFiber && element && element.type == oldFiber.type

      // 本次element与oldFiber type相同
      if (sameType) {
        newFiber = {
          type: oldFiber.type,
          tag: oldFiber.tag,
          stateNode: oldFiber.stateNode,
          props: element.props,
          parent: wipFiber,
          alternate: oldFiber,
          partiaState: oldFiber.partiaState,
          effectTag: UPDATE
        }
      }
      // type不相同
      if (element && !sameType) {
        newFiber = {
          type: element.type,
          //  对象是否为字符串  如果是就是 hostFiber 否则就是 classFiber
          tag: typeof element === 'string' ? HOST_COMPONENT : CLASS_COMPONENT,
          props: element.props,
          parent: wipFiber,
          effectTag: PLACEMENT
        }
      }
      if (oldFiber && !sameType) {
        oldFiber.effectTag = DELETION,
          wipFiber.effects = wipFiber.effects || []
        wipFiber.effects.push(oldFiber)
      }
      if (oldFiber) {
        oldFiber = oldFiber.sibling
      }
      if (index == 0) {
        wipFiber.child = newFiber
      }
      else if (prevFiber && element) {
        prevFiber.sibling = newFiber
      }
      index++
    }
  }

  /*
    克隆子Fiber
  */
  function cloneChildFibers (parentFiber) {
    const oldFiber = parentFiber.alternate
    if (!oldFiber.child) {
      return
    }

    let oldChild = oldFiber.child
    let prevChild = null
    while (oldChild) {
      const newChild = {
        type: oldChild.type,
        tag: oldChild.tag,
        stateNode: oldChild.stateNode,
        props: oldChild.props,
        partiaState: oldChild.partiaState,
        alternate: oldChild,
        parent: parentFiber
      }
      if (prevChild) {
        prevChild.sibling = newChild
      } else {
        parentFiber = child = newChild
      }
      prevChild = newChild
      oldChild = oldChild.sibling
    }
  }

  /*
    完成任务
  */
  function completeWork (fiber) {
    if (fiber.tag == CLASS_COMPONENT) {
      // 用于回溯最高点的root
      fiber.stateNode.__fiber = fiber
    }
    if (fiber.parent) {
      const childEffects = fiber.effects || []  //  收集当前节点的effect list
      const thisEffect = fiber.effectTag != null ? [fiber] : []
      const parentEffects = fiber.parent.effects || []
    } else {
      //  到达最顶端了
      pendingCommit = fiber
    }
  }

  /*
    提交所有任务
  */
  function commitAllWork (fiber) {
    // 遍历fiber一个个提交任务
    fiber.effects.forEach(f => {
      commitWork(f)
    })
    fiber.stateNode.__rootContainerFiber = fiber
    nextUnitOfWork = null
    pendingCommit = null
  }

  /*
    提交单个任务
  */
  function commitWork (fiber) {
    // 如果是根任务,直接拒绝
    if (fiber.tag = HOST_ROOT) {
      // 代表root节点没什么必要操作
      return
    }
    // 拿到parent的原因是,我们要将元素插入的点,插在父亲下面
    let domParentFiber = fiber.parent
    while (domParentFiber.tag == CLASS_COMPONENT) {
      // 如果是class就直接跳过,因为class类型的fiber.stateNode是本身实例
      domParentFiber = domParentFiber.parent
    }
    // 拿到父亲的真实DOM
    const domParent = domParentFiber.stateNode

    if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
      //  通过 tag 检查是不是真实的节点
      domParent.appendChild(fiber.stateNode)
    }
    else if (fiber.effectTag == UPDATE) {
      // 更新逻辑 
      updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props)
    }
    else if (fiber.effectTag == DELETION) {
      // 删除多余的旧节点
      commitDeletion(fiber, domParent)
    }
  }
  /*
    提交删除任务
  */
  function commitDeletion (fiber, domParent) {
    let node = fiber
    while (true) {
      if (node.tag == CLASS_COMPONENT) {
        node = node.child
        continue
      }
      domParent.removeChild(node.stateNode)
      while (node != fiber && !node.sibling) {
        node = node.parent
      }
      if (node == fiber) {
        return
      }
      node = node.sibling
    }
  }

  return {
    createElement,
    render,
    Component
  }
}
