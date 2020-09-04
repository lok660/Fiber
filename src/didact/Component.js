import { updateInstance } from './render'

//  组件构造方法
export class Component {

  constructor(props) {
    this.props = props;
    this.state = this.state || {};
  }

  setState (partialState) {
    this.state = Object.assign({}, this.state, partialState);
    updateInstance(this.__internalInstance);
  }

}