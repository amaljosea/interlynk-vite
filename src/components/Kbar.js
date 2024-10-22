import { useQuery } from '@apollo/client'
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarResults,
  KBarSearch,
  useMatches,
  useRegisterActions
} from 'kbar'
import { Fragment, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
import { settingActions } from 'variables/general'

import { SearchIcon } from '@chakra-ui/icons'
import { useColorMode } from '@chakra-ui/system'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectGroupAndVersionDetails } from 'graphQL/Queries'

import { FaRegWindowMaximize } from 'react-icons/fa'
import { FaDisplay, FaMoon, FaSun } from 'react-icons/fa6'
import { FaRegFile } from 'react-icons/fa6'
import { FaScrewdriverWrench } from 'react-icons/fa6'

const Kbar = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { results, rootActionId } = useMatches()
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()

  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { envName, onChangeEnv } = useGlobalState()

  const { primaryBgColor, secondaryBgColor } = useThemeColor([
    'primaryBgColor',
    'secondaryBgColor'
  ])

  const { data: productData } = useQuery(GetProjectGroupAndVersionDetails, {
    fetchPolicy: 'network-only',
    variables: {
      first: 500,
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
  const { setColorMode } = useColorMode()

  const allDefaultActions = [
    {
      id: 'home',
      name: 'Home',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/dashboard')
    },
    {
      id: 'products',
      name: 'Products',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/products')
    },
    {
      id: 'requests',
      name: 'Requests',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/requests')
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/vulnerabilities')
    },
    {
      id: 'licenses',
      name: 'Licenses',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/licenses')
    },
    {
      id: 'analytics',
      name: 'Analytics',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/analytics')
    },
    {
      id: 'tools',
      name: 'Tools',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/tools')
    },
    {
      id: 'support',
      name: 'Support',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/support')
    },
    {
      id: 'policies',
      name: 'Policies',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/policies')
    },
    {
      id: 'settings',
      name: 'Settings',
      section: 'navigation',
      icon: <FaRegFile color='#718096' />,
      perform: () => navigate('/vendor/settings?tab=users')
    }
  ]

  const getFreeTierActions = (...ids) => {
    return allDefaultActions.filter((action) => ids.includes(action.id))
  }

  const freeTierActions = getFreeTierActions(
    'home',
    'products',
    'vulnerabilities',
    'tools',
    'policies',
    'settings'
  )

  const actions = isFreeTier ? freeTierActions : allDefaultActions

  let data = [...actions]

  if (productData?.organization?.projectGroups?.nodes?.length > 0) {
    productData.organization.projectGroups.nodes.forEach((item) => {
      const envProject = item?.projects?.find((proj) => proj.name === envName)

      data.push({
        id: item?.name,
        name: truncatedValue(item?.name, 30),
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
                name: `${truncatedValue(item?.name, 20)} - ${version.projectVersion} (${project?.name})`,
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

  //Shortcuts
  //.. shortcut
  data.push({
    id: '..',
    name: '..  Go back a level',
    section: 'shortcuts',
    icon: <FaRegFile color='#718096' />,
    perform: () => {
      const isVulnerabilityDetailsPage =
        location.pathname.includes('products') &&
        location.pathname.includes('env') &&
        location.pathname.includes('vulnerability')

      const isProductVersionPage = location.pathname.includes('version')

      const isProductDetailsPage =
        location.pathname.includes('products') &&
        location.pathname.includes('env')

      const isProductsPage = location.pathname === '/vendor/products'

      if (isVulnerabilityDetailsPage) {
        const link = generateProductDetailPageUrlFromCurrentUrl({
          productgroupid: params.productgroupid,
          productid: params.productid,
          paramsObj: { tab: 'vulnerabilities' }
        })
        navigate(link)
      } else if (isProductVersionPage) {
        const link = generateProductDetailPageUrlFromCurrentUrl({
          productgroupid: params.productgroupid,
          productid: params.productid
        })
        navigate(link)
      } else if (isProductDetailsPage) {
        const link = '/vendor/products'
        navigate(link)
      } else if (isProductsPage) {
        const link = '/vendor/dashboard'
        navigate(link)
      } else {
        return
      }
    }
  })

  // '/' shortcut
  data.push({
    id: '/',
    name: '/  Go Back to first level',
    section: 'shortcuts',
    icon: <FaRegFile color='#718096' />,
    perform: () => {
      const isVulnerabilityRelatedPage =
        location.pathname.includes('vulnerabilities')

      const isProductsRelatedPage = location.pathname.includes('products')

      if (isVulnerabilityRelatedPage) {
        const link = '/vendor/vulnerabilities'
        navigate(link)
      } else if (isProductsRelatedPage) {
        const link = '/vendor/products'
        navigate(link)
      } else {
        return
      }
    }
  })
  useRegisterActions(data, [productData, envName, params])

  data.push(
    {
      id: 'theme',
      name: 'Change Theme',
      section: 'Preferences',
      icon: <FaDisplay color='#718096' />
    },
    {
      id: 'darkTheme',
      name: 'Dark Mode',
      keywords: 'dark theme',
      section: 'Theme',
      icon: <FaMoon color='#718096' />,
      perform: () => setColorMode('dark'),
      parent: 'theme'
    },
    {
      id: 'lightTheme',
      name: 'Light Mode',
      keywords: 'light theme',
      section: 'Theme',
      icon: <FaSun color='#718096' />,
      perform: () => setColorMode('light'),
      parent: 'theme'
    }
  )

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
        style={{ background: active ? secondaryBgColor : 'none' }}
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
        <KBarAnimator
          className='kbar_animator'
          style={{ background: primaryBgColor }}
        >
          <div className='kbar_search_container'>
            {/* search icon */}
            <SearchIcon color={'gray.500'} />
            {/* search input */}
            <KBarSearch className='kbar_search' />
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
