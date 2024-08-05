import { useQuery } from '@apollo/client'
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarResults,
  KBarSearch,
  useKBar,
  useMatches,
  useRegisterActions
} from 'kbar'
import { Fragment, useMemo } from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { settingActions } from 'variables/general'

import { SearchIcon } from '@chakra-ui/icons'
import { useColorModeValue } from '@chakra-ui/system'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useThemeActions from 'hooks/useThemeAction'

import { GetProjectGroupAndVersionDetails } from 'graphQL/Queries'

import { FaRegWindowMaximize } from 'react-icons/fa'
import { FaRegFile, FaScrewdriverWrench } from 'react-icons/fa6'

const Kbar = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // hooks
  const { query } = useKBar((state) => ({
    query: state.query,
    disabled: state.disabled
  }))
  const { results, rootActionId } = useMatches()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { envName, onChangeEnv } = useGlobalState()

  const bgColor = useColorModeValue('#F7FAFC', '#1A202C')
  const textHoverColor = useColorModeValue('#EDF2F7', '#2D3748')

  const productPermissions = useHasPermission({
    parentKey: 'view_product_group'
  })

  const { data: productData } = useQuery(GetProjectGroupAndVersionDetails, {
    skip: !productPermissions,
    fetchPolicy: 'network-only',
    variables: {
      field: 'PROJECT_GROUPS_UPDATED_AT',
      direction: 'DESC',
      enabled: true
    }
  })

  const handleVersionClick = (value) => {
    const env = productData?.organization?.projectGroups?.nodes
      .flatMap((group) => group.projects)
      .find((item) => item.name === value)
    onChangeEnv(env?.name)
  }

  // Function to disabled KBAR
  const kBarDisabledTrue = () => {
    query.disable(true)
  }

  // Function to enable KBAR
  const kBarDisabledFalse = () => {
    query.disable(false)
  }

  //Function to clean up after executing the '..' shortcut
  const executeNavigationCleanup = () => {
    setSearchQuery('')
    kBarDisabledTrue()
    setTimeout(() => {
      kBarDisabledFalse()
    }, 100)
  }

  //Effect to run code when the search input is ".."
  //The function strictly takes user back a level for the products details and product version page. For all other pages, it navigates back to the previous URL
  useEffect(() => {
    if (searchQuery.trim() === '..') {
      const isProductVersionPage = location.pathname.includes('version')

      const isProductDetailsPage =
        location.pathname.includes('products') &&
        location.pathname.includes('env')

      const isProductsPage = location.pathname === '/vendor/products'

      if (isProductVersionPage) {
        const link = generateProductDetailPageUrlFromCurrentUrl({
          productgroupid: params.productgroupid,
          productid: params.productid
        })
        navigate(link)
        executeNavigationCleanup()
      } else if (isProductDetailsPage) {
        const link = '/vendor/products'
        navigate(link)
        executeNavigationCleanup()
      } else if (isProductsPage) {
        const link = '/vendor/dashboard'
        navigate(link)
        executeNavigationCleanup()
      } else {
        navigate(-1)
        executeNavigationCleanup()
      }
    }
  }, [searchQuery])

  //Input capture to check if the input is '..'
  const handleInputChange = (event) => {
    const { value } = event.target
    setSearchQuery(value)
  }

  let data = []
  if (productData?.organization?.projectGroups?.nodes?.length > 0) {
    productData.organization.projectGroups.nodes.forEach((item) => {
      const envProject = item?.projects?.find((proj) => proj.name === envName)

      data.push({
        id: item?.name,
        name: item?.name,
        section: 'products',
        icon: <FaRegWindowMaximize color='#718096' />,
        perform: () => {
          const link = generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: item?.id,
            productid: envProject?.id
          })

          navigate(link)
        }
      })

      item?.projects?.forEach((project) => {
        if (project?.sbomVersions?.nodes?.length > 0) {
          project.sbomVersions.nodes.forEach((version) => {
            if (version?.projectVersion) {
              data.push({
                id: version?.id,
                name: `${item?.name} - ${version.projectVersion} (${project?.name})`,
                section: 'product versions',
                icon: <FaScrewdriverWrench color='#718096' />,
                perform: () => {
                  const link =
                    generateProductVersionDetailPageUrlFromCurrentUrl({
                      productgroupid: item?.id,
                      productid: project?.id,
                      sbomid: version?.id,
                      paramsObj: { tab: 'general' }
                    })
                  handleVersionClick(project?.name)
                  navigate(link)
                }
              })
            }
          })
        }
      })

      settingActions?.map((item) =>
        data?.push({
          id: item?.name,
          name: item?.name,
          section: item?.section,
          icon: <FaRegFile color='#718096' />,
          perform: () => navigate(item?.path)
        })
      )
    })
  }

  useThemeActions()
  useRegisterActions(data, [productData, envName])

  const ResultItem = ({ item, active, currentRootActionId }) => {
    const ancestors = useMemo(() => {
      if (!currentRootActionId) return item.ancestors
      const index = item?.ancestors?.findIndex(
        (ancestor) => ancestor?.id === currentRootActionId
      )
      return item?.ancestors?.slice(index + 1)
    }, [item.ancestors, currentRootActionId])

    if (typeof item === 'string') {
      return <div className='kbar_result_header'>{item}</div>
    }

    return (
      <div
        className='kbar_result_item_container'
        style={{ background: active ? textHoverColor : 'none' }}
      >
        <div className='kbar_result_item'>
          {/* icon */}
          <div>{item?.icon}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <Fragment key={ancestor.id}>
                    <span
                      style={{
                        opacity: 0.5,
                        marginRight: 8,
                        fontSize: '14px'
                      }}
                    >
                      {ancestor.name}
                    </span>
                    <span
                      style={{
                        marginRight: 8
                      }}
                    >
                      &rsaquo;
                    </span>
                  </Fragment>
                ))}
              {/* name */}
              <span
                className='kbar_result_item_name'
                style={{ fontSize: '14px' }}
              >
                {item.name}
              </span>
            </div>
            {/* subtitle */}
            {item.subtitle && (
              <span style={{ fontSize: 12 }}>{item.subtitle}</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <KBarPortal>
      <KBarPositioner className='kbar_positioner'>
        <KBarAnimator className='kbar_animator' style={{ background: bgColor }}>
          <div className='kbar_search_container'>
            {/* search icon */}
            <SearchIcon color={'gray.500'} />
            {/* search input */}
            <KBarSearch
              onChange={handleInputChange}
              value={searchQuery}
              className='kbar_search'
            />
          </div>
          <div className='kbar_result_container'>
            {/* search results */}

            {results && results?.length !== 0 && (
              <div className='kbar_result_body'>
                <KBarResults
                  items={results}
                  onRender={({ item, active }) => (
                    <ResultItem
                      item={item}
                      active={active}
                      currentRootActionId={rootActionId}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  )
}

export default Kbar
