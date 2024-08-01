import { GlobalQueryContextWrapper } from 'context/GlobalQueryContext.js'
import { PartsContextWrapper } from 'context/PartsContext.js'
import { ProductUrlContextWrapper } from 'context/ProductUrlContext.js'
import Cookies from 'js-cookie'
import Reset from 'layouts/Reset'
import Success from 'layouts/Success'
import React from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import PubProducts from 'views/Customer/Products'
import PubProductDetails from 'views/Customer/Products/ProductDetails'
import PubProductList from 'views/Customer/Products/ProductList'
import PubSbomDetails from 'views/Customer/Sbom/index.js'
import Analytics from 'views/Dashboard/Analytics/index.js'
import Dashboard from 'views/Dashboard/Dashboard'
import Policies from 'views/Dashboard/Policies'
import Products from 'views/Dashboard/Products'
import ProductDetailsMain from 'views/Dashboard/Products/ProductDetailsMain.js'
import ProductDetailsSbomNew from 'views/Dashboard/Products/ProductDetailsSbomNew/index.js'
import ProductDetailsVul from 'views/Dashboard/Products/ProductDetailsVul.js'
import ProductList from 'views/Dashboard/Products/ProductList'
import Profile from 'views/Dashboard/Profile'
import Requests from 'views/Dashboard/Requests/index.js'
import Support from 'views/Dashboard/Support'
import Tools from 'views/Dashboard/Tools'
import Vulnerabilities from 'views/Dashboard/Vulnerabilities'

import Licenses from 'components/Licenses'
import { SentryTest } from 'components/SentryTest.js'

import usePageTracking from 'hooks/usePageTracking.js'

import AdminLayout from './layouts/Admin.js'
import AuthLayout from './layouts/Auth.js'
import CustomerLayout from './layouts/Customer.js'
import LoginLayout from './layouts/Login.js'
import Register from './layouts/Register.js'
import RequestSbomUpload from './layouts/RequestSbomUpload'
import './main.css'

const authToken = Cookies.get('authToken')

const MainWrapper = () => (
  <ProductUrlContextWrapper>
    <GlobalQueryContextWrapper>
      <Outlet />
    </GlobalQueryContextWrapper>
  </ProductUrlContextWrapper>
)

export const MainRoutes = () => {
  usePageTracking()

  return (
    <Routes>
      <Route path={`/`} element={<MainWrapper />}>
        <Route
          path=''
          element={
            authToken ? (
              <Navigate replace to='/vendor/dashboard' />
            ) : (
              <Navigate replace to='/auth' />
            )
          }
        />
        <Route path={`auth`} element={<AuthLayout />} />
        <Route path={`reset_password`} element={<Reset />} />
        <Route path={`register`} element={<Register />} />
        <Route path={`accept-user-invitation`} element={<Success />} />
        <Route path={`confirmation`} element={<Success />} />
        <Route
          path={`vendor`}
          element={
            <PartsContextWrapper>
              <AdminLayout />
            </PartsContextWrapper>
          }
        >
          <Route path={`dashboard`} element={<Dashboard />} />
          <Route path={`products`} element={<Products />}>
            <Route index element={<ProductList />} />
            <Route
              exact
              path=':productgroupid/env/:productid'
              Component={ProductDetailsMain}
            />
            <Route
              exact
              path=':productgroupid/env/:productid/version/:sbomid'
              Component={ProductDetailsSbomNew}
            />
            <Route
              exact
              path=':productgroupid/env/:productid/vulnerability/:vulnerabilityid'
              Component={ProductDetailsVul}
            />
          </Route>
          {/* <Route path={`SAG`} element={<Sag />} /> */}
          <Route path={`vulnerabilities`} element={<Vulnerabilities />} />
          <Route path={`licenses`} element={<Licenses />} />
          <Route path={`analytics`} element={<Analytics />} />
          <Route path={`tools`} element={<Tools />} />
          <Route path={`support`} element={<Support />} />
          <Route path={`policies`} element={<Policies />} />
          <Route path={`requests`} element={<Requests />} />
          <Route path={`settings`} element={<Profile />} />
        </Route>
        <Route path={`login`} element={<LoginLayout />} />
        <Route path={`customer`} element={<CustomerLayout />}>
          <Route path={`products`} element={<PubProducts />}>
            <Route index element={<PubProductList />} />
            <Route
              exact
              path=':productgroupid/env/:productid'
              element={<PubProductDetails />}
            />
            <Route
              exact
              path=':productgroupid/env/:productid/version/:sbomid'
              element={<PubSbomDetails />}
            />
          </Route>
        </Route>
        <Route path={`register`} element={<Register />} />
        <Route path={`sentry-test`} element={<SentryTest />} />
        <Route path='request-sbom-upload' element={<RequestSbomUpload />} />
      </Route>
    </Routes>
  )
}
