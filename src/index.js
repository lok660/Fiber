/** @jsx Didact.createElement */
import Didact from 'didact';

class HelloMessage extends Didact.Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 1
    };
  }

  handleClick () {
    this.setState({
      count: this.state.count + 1
    });
  }

  render () {
    const name = this.props.name;
    const times = this.state.count;
    return (
      <div onClick={e => this.handleClick()}>
        Hello {name + "!".repeat(times)}
      </div>
    );
  }
}

Didact.render(
  <HelloMessage name="John" />,
  document.getElementById('container')
)