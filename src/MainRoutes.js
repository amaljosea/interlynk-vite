import { GlobalQueryContextWrapper } from 'context/GlobalQueryContext.js'
import { PartsContextWrapper } from 'context/PartsContext.js'
import { ProductUrlContextWrapper } from 'context/ProductUrlContext.js'
import Cookies from 'js-cookie'
import AdminLayout from 'layouts/Admin.js'
// Critical components - loaded immediately
import Auth from 'layouts/Auth.js'
import CustomerLayout from 'layouts/Customer.js'
import Login from 'layouts/Login.js'
import PageNotFound from 'layouts/PageNotFound.js'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { lazyImport } from 'utils/lazyImport.js'

import ConditionalRoute from 'components/ConditionalRoute.js'
import Licenses from 'components/Licenses'
import { SentryTest } from 'components/SentryTest.js'
import PolicyTable from 'components/Tables/PolicyTable.js'

import './main.css'
import PubProductList from './views/Customer/Products/ProductList.js'

// Non-critical layout components - can be lazy loaded
const Register = lazyImport(() => import('./layouts/Register.js'))
const LoginLayout = lazyImport(() => import('./layouts/UserLogin.js'))
const Callback = lazyImport(() => import('layouts/Callback.js'))
const Reset = lazyImport(() => import('layouts/Reset'))
const SSO = lazyImport(() => import('layouts/SSO.js'))
const Success = lazyImport(() => import('layouts/Success.js'))
const RequestSbomUpload = lazyImport(
  () => import('./layouts/RequestSbomUpload')
)

// Customer route components - lazy loaded
const PubProducts = lazyImport(() => import('views/Customer/Products/index.js'))
const PubProductDetails = lazyImport(
  () => import('./views/Customer/Products/ProductDetails.js')
)
const PubSbomDetails = lazyImport(() => import('views/Customer/Sbom/index.js'))

// Dashboard components - lazy loaded
const Dashboard = lazyImport(() => import('views/Dashboard/Dashboard/index.js'))
const Analytics = lazyImport(() => import('views/Dashboard/Analytics/index.js'))
const Package = lazyImport(() => import('views/Dashboard/Package/index.js'))
const Policies = lazyImport(() => import('views/Dashboard/Policies/index.js'))
const PolicyDetails = lazyImport(
  () => import('views/Dashboard/Policies/PolicyDetails.js')
)
const Products = lazyImport(() => import('views/Dashboard/Products/index.js'))
const ProductDetailsMain = lazyImport(
  () => import('views/Dashboard/Products/ProductDetailsMain.js')
)
const ProductDetailsSbomNew = lazyImport(
  () => import('views/Dashboard/Products/ProductDetailsSbomNew/index.js')
)
const ProductDetailsVul = lazyImport(
  () => import('views/Dashboard/Products/ProductDetailsVul.js')
)
const ProductList = lazyImport(
  () => import('views/Dashboard/Products/ProductList.js')
)
const Profile = lazyImport(() => import('views/Dashboard/Profile/index.js'))
const Requests = lazyImport(() => import('views/Dashboard/Requests/index.js'))
const Support = lazyImport(() => import('views/Dashboard/Support/index.js'))
const Tools = lazyImport(() => import('views/Dashboard/Tools/index.js'))
const Vulnerabilities = lazyImport(
  () => import('views/Dashboard/Vulnerabilities/index.js')
)
const ColorDisplay = lazyImport(() => import('views/Dashboard/colors/index.js'))

const authToken = Cookies.get('authToken')

const MainWrapper = () => (
  <ProductUrlContextWrapper>
    <GlobalQueryContextWrapper>
      <Outlet />
    </GlobalQueryContextWrapper>
  </ProductUrlContextWrapper>
)

const URL = authToken ? '/vendor/dashboard' : '/auth'

export const MainRoutes = () => {
  return (
    <Routes>
      <Route path={`/`} element={<MainWrapper />}>
        <Route path='' element={<Auth />}>
          <Route path='' element={<Navigate replace to={URL} />} />
          <Route path={`auth`} element={<Login />} />
          <Route path={`reset_password`} element={<Reset />} />
          <Route path={`sso`} element={<SSO />} />
          <Route path={`register`} element={<Register />} />
          <Route path={`accept-user-invitation`} element={<Success />} />
          <Route path={`confirmation`} element={<Success />} />
          <Route path={`oauth_callback`} element={<Callback />} />
        </Route>
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

          <Route
            path='licenses'
            element={<ConditionalRoute element={Licenses} />}
          />
          <Route
            path={`package`}
            element={<ConditionalRoute element={Package} />}
          />
          <Route
            path='analytics'
            element={<ConditionalRoute element={Analytics} />}
          />
          <Route path={`tools`} element={<Tools />} />
          <Route
            path='support'
            element={<ConditionalRoute element={Support} />}
          />
          <Route path={`policies`} element={<Policies />}>
            <Route index element={<PolicyTable />} />
            <Route exact path=':policyid' element={<PolicyDetails />} />
          </Route>
          <Route
            path='requests'
            element={<ConditionalRoute element={Requests} />}
          />
          <Route path={`settings`} element={<Profile />} />
          <Route path={`colors`} element={<ColorDisplay />} />
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
        <Route path='*' element={<PageNotFound />} />
      </Route>
    </Routes>
  )
}
