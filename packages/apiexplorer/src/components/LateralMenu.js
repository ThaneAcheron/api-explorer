import React, { PropTypes, Component } from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import Enumerable from 'linq'
import { OperationsFilter } from '.'

import { Menu, Icon, Label } from 'semantic-ui-react'
import Styled from 'styled-components'

class LateralMenu extends Component {
  state = {
    filter: this.getFilterState('')
  }

  // ----------------------------------------------------------------------------------------
  // Filtering
  // ----------------------------------------------------------------------------------------
  getFilterState (filterText) {
    // Convert filterText into a regex
    // EX: "GET u ent    vi" -> "GETuentvi" -> /G.*E.*T.*u.*e.*n.*t.*v.*i/i
    return {
      text: filterText,
      regex: new RegExp(filterText.replace(/\s/g, '').split('').join('.*'), 'i')
    }
  }

  handleFilterUpdate = (text) => {
    this.setState({ filter: this.getFilterState(text) })
  }

  matchFilterRegex (text) {
    return this.state.filter.regex.test(text)
  }

  isApiVisible (api, operations) {
    if (this.state.filter.text === '') return true
    return operations.some(o => this.isOperationVisible(o))
  }

  isTagVisible (tag, operations) {
    if (this.state.filter.text === '') return true
    if (this.matchFilterRegex(tag)) return true
    return operations.some(o => this.isOperationVisible(o))
  }

  isOperationVisible (operation) {
    if (this.state.filter.text === '') return true
    if (operation.spec.tags.some(tag => this.matchFilterRegex(tag))) return true
    return this.matchFilterRegex(operation.spec.httpMethod + operation.spec.url)
  }

  // ----------------------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------------------
  render () {
    const operationsByApi = this.props.apis.get('byOrder')
                                .map(name => this.props.operations.filter(o => o.apiname === name))
                                .toArray()
    return  (
      <StyledMenu>
        <Menu inverted vertical style={{ width: '100%', backgroundColor: 'transparent' }}>
          <Menu.Item>
            <Link to={APIExplorer.LinkGenerator.toHome()} ><Icon name='home' /> Home</Link>
          </Menu.Item>
          <Menu.Item>
            <OperationsFilter placeholder='e.g. getusersession' onFilter={this.handleFilterUpdate} />
          </Menu.Item>
          {operationsByApi.map(this.renderAPI)}
        </Menu>
      </StyledMenu>
    )
    
  }

  renderAPI = (apiOperations) => {
    if (apiOperations.length === 0 || !this.isApiVisible(apiOperations[0].apiname, apiOperations)) return

    const tags = Enumerable.from(apiOperations).selectMany(o => o.spec.tags).distinct().toArray()
    return (
      <div key={apiOperations[0].apiname} className='api-operations'>
        <Menu.Item header>{apiOperations[0].apiname}</Menu.Item>
        {tags.map(tag => this.renderOperationsWithTag(apiOperations, tag))}
      </div>
    )
  }

  renderOperationsWithTag = (operations, tag) => {
    const visibleOperations = Enumerable.from(operations).where(o => (o.spec.tags).indexOf(tag) !== -1).toArray()

    if (!this.isTagVisible(tag, visibleOperations)) return

    return (
      <Menu.Item key={visibleOperations[0].apiname + tag} className='api-tag-operations'>
        <Menu.Header>{tag}</Menu.Header>
        {visibleOperations.map(this.renderOperation)}
      </Menu.Item>
    )
  }

  renderOperation = (operation) => {
    if (!this.isOperationVisible(operation)) {
      return
    }
    // TODO: HTTPMethod, deprecated, styles, long text for operations, spacing ui ()

    const className = cx('api-operation', `http-${operation.spec.httpMethod.toLowerCase()}`, {
      'api-deprecated': operation.spec.deprecated
    })

    return (
      <Menu.Item key={operation.id} link className={className}
        active={operation.id === this.props.selectedOperationId} title={operation.spec.description}
        as={Link}
        to={APIExplorer.LinkGenerator.toOperation(operation)}>
        <Label>{operation.spec.httpMethod.toUpperCase()}</Label>
        {operation.spec.url}
        {operation.spec.security && <Icon name='lock'
          style={{ width: '1em', display: 'inline-block', opacity: '0.5', margin: '0px 5px', color: 'yellow' }} />}        
      </Menu.Item>
    )
  }

}

LateralMenu.propTypes = {
  operations: PropTypes.array.isRequired,
  apis: PropTypes.object.isRequired,
  selectedOperationId: PropTypes.string
}

export default LateralMenu

const StyledMenu = Styled.div`
  div.api-operations div.header, .api-operations div.api-tag-operations div.header {
    text-transform: uppercase;
  }

  /* OPERATION TAG */
  div.api-operations div.item.api-tag-operations {
    padding-left: 0;
    padding-right: 0;
  }
  div.api-operations div.item.api-tag-operations .header {
    padding-left: 16px;
  }

  /* OPERATION */
  div.api-operations .api-operation {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 20px;
    position: static;
  }

  div.api-operations .api-operation.active {
    background-color: grey !important;
  }

  div.api-operations .api-operation.api-deprecated {
    text-decoration: line-through;
    opacity: .5;
  }


  /* HTTP Labels */
  div.api-operations .api-operation .ui.label {
    color: inherit;
    background-color: transparent;
  }

  div.api-operations .api-operation.active.http-head .ui.label,
  div.api-operations .api-operation.http-head:hover .ui.label     { background-color: #5bc0de; color: white; }
  div.api-operations .api-operation.http-head .ui.label                      { color: #5bc0de; }
                                                              /* border-color: #5bc0de; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-get .ui.label,
  div.api-operations .api-operation.http-get:hover .ui.label      { background-color: #428bca; color: white; }
  div.api-operations .api-operation.http-get .ui.label                       { color: #428bca; }
                                                              /* border-color: #428bca; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-delete .ui.label,
  div.api-operations .api-operation.http-delete:hover .ui.label   { background-color: #d9534f; color: white; }
  div.api-operations .api-operation.http-delete .ui.label                    { color: #d9534f; }
                                                              /* border-color: #d9534f; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-put .ui.label,
  div.api-operations .api-operation.http-put:hover .ui.label      { background-color: #EB961E; color: white; }
  div.api-operations .api-operation.http-put .ui.label                       { color: #EB961E; }
                                                              /* border-color: #EB961E; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-patch .ui.label,
  div.api-operations .api-operation.http-patch:hover .ui.label    { background-color: #F2C769; color: white; }
  div.api-operations .api-operation.http-patch .ui.label                     { color: #F2C769; }
                                                              /* border-color: #F2C769; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-post .ui.label,
  div.api-operations .api-operation.http-post:hover .ui.label     { background-color: #5cb85c; color: white; }
  div.api-operations .api-operation.http-post .ui.label                      { color: #5cb85c; }
                                                              /* border-color: #5cb85c; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-options .ui.label,
  div.api-operations .api-operation.http-options:hover .ui.label  { background-color: #dddddd; color: black; border-color: black; }
  div.api-operations .api-operation.http-options .ui.label                   { color: #dddddd; }
                                                              /* border-color: #dddddd; border-style: solid; border-width: 1px; } */

  div.api-operations .api-operation.active.http-trace .ui.label,
  div.api-operations .api-operation.http-trace:hover .ui.label    { background-color: #aaaaaa; color: black; border-color: black; }
  div.api-operations .api-operation.http-trace .ui.label                     { color: #aaaaaa; }
                                                              /* border-color: #aaaaaa; border-style: solid; border-width: 1px; } */
`

/*
Color schema:
    HEAD    - #5bc0de
    GET     - #428bca

    DELETE  - #d9534f
    PUT     - #EB961E
    PATCH   - #F2C769

    POST    - #5cb85c

    OPTIONS - #dddddd
    TRACE   - #aaaaaa

    Utility site: http://colllor.com/
 */