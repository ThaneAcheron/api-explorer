import 'babel-core/polyfill'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Route } from 'react-router'
import { ReduxRouter } from 'redux-router'

import Router from '../routers/index'

export default class Root extends Component {
  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <Router />
      </Provider>
    )
  }
}
