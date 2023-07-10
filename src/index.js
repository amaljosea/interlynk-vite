import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import './main.css'

// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import ContextWrapper from 'context/ContextWrapper.js'
import CustomerLayout from './layouts/Customer.js'
import ScrollToTop from 'components/ScrollToTop.js'

ReactDOM.render(
  <ContextWrapper>
    <BrowserRouter>
      <ScrollToTop />
      <Switch>
        {/* <Route path={`/sbom`} component={SBOMLayout} /> */}
        <Route path={`/auth`} component={AuthLayout} />
        <Route path={`/admin`} component={AdminLayout} />
        <Route path={`/customer`} component={CustomerLayout} />
        <Redirect from={`/`} to='/auth' />
        <Redirect from={`/customer`} to='/customer' />
      </Switch>
    </BrowserRouter>
  </ContextWrapper>,
  document.getElementById('root')
)
