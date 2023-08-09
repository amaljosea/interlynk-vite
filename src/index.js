import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import './main.css'

// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import ContextWrapper from 'context/ContextWrapper.js'
import CustomerLayout from './layouts/Customer.js'
import Register from './layouts/Register.js'
import ScrollToTop from 'components/ScrollToTop.js'
import PrivateRoute from 'components/PrivateRoute'

ReactDOM.render(
  <ContextWrapper>
    <BrowserRouter>
      <ScrollToTop />
      <Switch>
        <Route path={`/auth`} component={AuthLayout} />
        <Route path='/' component={PrivateRoute}>
          <Route path={`/vendor`} component={AdminLayout} />
          <Route path={`/customer`} component={CustomerLayout} />
        </Route>
        <Route path={`/register`} component={Register} />
        <Route path={`/`} component={AuthLayout} />
      </Switch>
    </BrowserRouter>
  </ContextWrapper>,
  document.getElementById('root')
)
