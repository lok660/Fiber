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

