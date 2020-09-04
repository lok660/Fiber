import { updateInstance } from './render'

export class Component {
  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }
  setState (partialState) {
    this.state = { ...this.state, partialState }
    updateInstance(this.__internalInstance)
  }
  render () {
    return null
  }
}