import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20,background:'#ff0000',color:'#fff',fontSize:14,fontFamily:'monospace'}}>
          <strong>CRASH:</strong> {this.state.error.message}
          <pre style={{fontSize:10,marginTop:8,whiteSpace:'pre-wrap'}}>{this.state.error.stack?.slice(0,500)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
