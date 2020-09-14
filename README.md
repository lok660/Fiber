React 的核心点

- 组件(Componet)
- Virual Dom
- JSX
- Poprs & State

```js
ReactDOM.render(element, container) //	核心渲染API
```

JSX

```js
//	babel-transform-react-jsx	转换jsx
{
    type: "", // 类型，可以为Dom元素，或Component类型，如Button
    props: {
        children:[ // element类型的children
        ],
        xxx: xxx  // 此element的属性列表
    }
}
```

```jsx
const element = {
  type: "div",
  props: {
    id: "container",
    children: [
      { type: "input", props: { value: "foo", type: "text" } },
      { type: "a", props: { href: "/bar" } },
      { type: "span", props: {} }
    ]
  }
};
//	-----------------------------------------------------------------------
<div id="container">
  <input value="foo" type="text">
  <a href="/bar"></a>
  <span></span>
</div>
```

![img](https://handsomeliuyang.github.io/2018/08/07/DiyReact%E5%AD%A6%E4%B9%A0%E4%B9%8B%E8%B7%AF/JSX-element-dom.png)

```js
//	instance
{
    tag:HOST_COMPONENT|CLASS_COMPONENT,
    type:"div"|Component,
    // 构建一个树型链表结构
    parent: parentFiber,
    child: childFiber,
    sibling:null,
    // 关联第二颗树
    alternate: other fiber tree,
    stateNode:dom|component,
    props: element.props,
    partialState: component changed state,
    // 记录真正变动的节点fiber
    effectTag:PLACEMENT,
    effects: []
};
```

Fiber 运行

```js
//	fiber结构
|- tag type对应的标记
|- key  component的key
|- type  fiber类型
|- stateNode component实例对象
|- return 父fiber，fiber tree中的位置
|- child  第一个子fiber，fiber tree中的位置
|- slibing 兄fiber，fiber tree中的位置
|- ref component的ref
|- index 当前在父fiber中的index
|- pendingProps component的newProps
|- memorizedProps component的oldProps
|- memorizedState component的state
|- updateQueue setState后的待更新状态
|- internalContextTag async更新标记位
|- effectTag 二进制tag，不同的位数代表不同的值
|- nextEffect effect tree中的位置
|- firstEffect effect tree中的位置
|- lastEffect effect tree中的位置
|- pendingWorkPriority update的待更新等级
|- alternate 当前fiber的备份
|- _debug_xxxx 调试参数 
```

```js
//	fiber类型(根据component类型生成对应的fiber类型)
HostRoot 生成根fiber，相当于container元素生成的component
IndeterminateComponent type为function，非react对象，相当于render函数，没有react生命周期
FunctionalComponent IndeterminateComponent中没有render方法的对象
ClassComponent react.element或者IndeterminateComponent含有render方法的对象
HostComponent type为string普通component，如div，span
HostText type为string的普通component，且是anoymouns element
CoroutineHandlerPhase
CoroutineComponent react.coroutine
YieldComponent react.yield
HostPortal react.portal
Fragment
```





> React在16.x.x的解决方案是：把上述的执行过程拆分为很多的工作单元（UnitOfWork），这些很小的工作单元都能在很短的时间内执行完成，同时每两个执工作单元之间可以被中断，让main thread执行更高优先级的任务，如animation，ui responsive。



[简述]: https://handsomeliuyang.github.io/2018/08/07/DiyReact%E5%AD%A6%E4%B9%A0%E4%B9%8B%E8%B7%AF/#

[update过程]: https://github.com/yoution/fiber-source/blob/master/update.md
[render过程]: https://github.com/yoution/fiber-source/blob/master/render.md

[didact文档]: https://github.com/chinanf-boy/didact-explain/blob/master/5.Fibre.readme.md

[司徒正美]: https://zhuanlan.zhihu.com/p/37095662

