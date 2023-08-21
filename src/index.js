import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import './main.css'

// import SBOMLayout from './layouts/SBOM.js'
import AuthLayout from './layouts/Auth.js'
import AdminLayout from './layouts/Admin.js'
import ContextWrapper from 'context/ContextWrapper.js'
import CustomerLayout from './layouts/Customer.js'
import ShareLynkLayout from 'layouts/ShareLynk'
import Register from './layouts/Register.js'
import LoginLayout from './layouts/Login.js'
import ScrollToTop from 'components/ScrollToTop.js'
import { Redirect } from 'react-router-dom'

ReactDOM.render(
  <React.StrictMode>
    <ContextWrapper>
      <BrowserRouter>
        <ScrollToTop />
        <Switch>
          <Route path={`/auth`} component={AuthLayout} />
          <Route path={`/vendor`} component={AdminLayout} />
          <Route path={`/login`} component={LoginLayout} />
          <Route path={`/customer`} component={CustomerLayout} />
          <Route path={`/sharelynk`} component={ShareLynkLayout} />
          <Route path={`/register`} component={Register} />
          <Redirect from={`/`} to='/auth' />
        </Switch>
      </BrowserRouter>
    </ContextWrapper>
  </React.StrictMode>,
  document.getElementById('root')
)
