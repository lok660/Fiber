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
React在16.x.x的解决方案是：把上述的执行过程拆分为很多的工作单元（UnitOfWork），这些很小的工作单元都能在很短的时间内执行完成，同时每两个执工作单元之间可以被中断，让main thread执行更高优先级的任务，如animation，ui responsive。
```

[引用链接]: https://handsomeliuyang.github.io/2018/08/07/DiyReact%E5%AD%A6%E4%B9%A0%E4%B9%8B%E8%B7%AF/#
