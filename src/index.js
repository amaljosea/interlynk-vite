import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import './main.css'

// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import ContextWrapper from 'context/ContextWrapper.js'
import CustomerLayout from './layouts/Customer.js'
import Register from './layouts/Register.js'
import ScrollToTop from 'components/ScrollToTop.js'

ReactDOM.render(
  <ContextWrapper>
    <BrowserRouter>
      <ScrollToTop />
      <Switch>
        <Route path={`/auth`} component={AuthLayout} />
        <Route path={`/vendor`} component={AdminLayout} />
        <Route path={`/customer`} component={CustomerLayout} />
        <Route path={`/register`} component={Register} />
        <Redirect from={`/`} to='/auth' />
      </Switch>
    </BrowserRouter>
  </ContextWrapper>,
  document.getElementById('root')
)
