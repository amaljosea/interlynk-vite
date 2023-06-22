import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import ContextWrapper from 'context/ContextWrapper.js'
import CustomerLayout from './layouts/Customer.js'

const client = new ApolloClient({
  uri: 'http://localhost:3000/lynkapi',
  cache: new InMemoryCache()
})

ReactDOM.render(
  <ContextWrapper>
    <ApolloProvider client={client}>
      <HashRouter>
        <Switch>
          <Route path={`/sbom`} component={SBOMLayout} />
          <Route path={`/auth`} component={AuthLayout} />
          <Route path={`/admin`} component={AdminLayout} />
          <Route path={`/customer`} component={CustomerLayout} />
          <Redirect from={`/`} to='/auth' />
          <Redirect from={`/customer`} to='/customer/sbom' />
        </Switch>
      </HashRouter>
    </ApolloProvider>
  </ContextWrapper>,
  document.getElementById('root')
)
