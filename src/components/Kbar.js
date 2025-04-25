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
import { useNavigate, useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'
import { detectOS } from 'utils'
import { allDefaultActions, settingActions } from 'variables/general'

import { SearchIcon } from '@chakra-ui/icons'
import { Kbd, useColorMode } from '@chakra-ui/react'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProjectGroupAndVersionDetails } from 'graphQL/Queries'

import { FaRegWindowMaximize } from 'react-icons/fa'
import { FaDesktop, FaDisplay, FaMoon, FaSun } from 'react-icons/fa6'
import { FaRegFile } from 'react-icons/fa6'
import { FaScrewdriverWrench } from 'react-icons/fa6'

const Kbar = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { results, rootActionId } = useMatches()
  const resultsCount = results?.length
  const navigate = useNavigate()
  const params = useParams()

  const {
    isVulnerabilityDetailsPage,
    isProductVersionPage,
    isProductDetailsPage,
    isProductsPage,
    isProductsRelatedPage,
    isGlobalVulnerabilitiesPage,
    isSingleVulnerabilityPage,
    isPolicyDetailsPage
  } = useRouteFlags()

  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { envName, onChangeEnv } = useGlobalState()

  const {
    primaryBgColor,
    secondaryBgColor,
    sameSecondaryText,
    secondaryTextInverse
  } = useThemeColor([
    'primaryBgColor',
    'secondaryBgColor',
    'sameSecondaryText',
    'secondaryTextInverse'
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

  const getFreeTierActions = (actions, ...ids) => {
    return actions.filter((action) => ids.includes(action.id))
  }

  const freeTierActions = getFreeTierActions(
    allDefaultActions,
    'home',
    'products',
    'vulnerabilities',
    'tools',
    'policies',
    'settings'
  )

  const freeTierSettingsActions = getFreeTierActions(
    settingActions,
    'users',
    'feeds',
    'compliance',
    'lists',
    'legal',
    'integrations-org',
    'plan',
    'integrations'
  )

  const actions = isFreeTier ? freeTierActions : allDefaultActions

  const settingsActionsActual = isFreeTier
    ? freeTierSettingsActions
    : settingActions

  let data = []

  actions?.map((item) =>
    data?.push({
      id: item?.name,
      name: item?.name,
      section: `${item?.section}`,
      icon: <FaRegFile color={sameSecondaryText} />,
      perform: () => navigate(item?.path)
    })
  )

  if (productData?.organization?.projectGroups?.nodes?.length > 0) {
    productData.organization.projectGroups.nodes.forEach((item) => {
      const envProject = item?.projects?.find((proj) => proj.name === envName)

      data.push({
        id: item?.name,
        name: truncatedValue(item?.name, 30),
        section: 'products',
        icon: <FaRegWindowMaximize color={sameSecondaryText} />,
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
                name: `${truncatedValue(item?.name, 20)} - ${truncatedValue(version?.projectVersion, 20)} (${project?.name})`,
                section: 'product versions',
                icon: <FaScrewdriverWrench color={sameSecondaryText} />,
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

      settingsActionsActual?.map((item) =>
        data?.push({
          id: item?.name,
          name: item?.name,
          section: item?.section,
          icon: <FaRegFile color={sameSecondaryText} />,
          perform: () => navigate(item?.path)
        })
      )
    })
  }

  //Shortcuts
  //.. shortcut
  data.push({
    id: '..',
    name: '.. Go back a level',
    keywords: ['..'],
    section: 'shortcuts',
    icon: <FaRegFile color={sameSecondaryText} />,
    perform: () => {
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
      } else if (isGlobalVulnerabilitiesPage) {
        const link = '/vendor/vulnerabilities'
        navigate(link)
      } else if (isSingleVulnerabilityPage) {
        navigate(-1)
      } else if (isPolicyDetailsPage) {
        const link = '/vendor/policies'
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
    keywords: ['/'],
    icon: <FaRegFile color={sameSecondaryText} />,
    perform: () => {
      if (isGlobalVulnerabilitiesPage) {
        const link = '/vendor/vulnerabilities'
        navigate(link)
      } else if (isProductsRelatedPage) {
        const link = '/vendor/products'
        navigate(link)
      } else if (isPolicyDetailsPage) {
        const link = '/vendor/policies'
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
      icon: <FaDisplay color={secondaryTextInverse} />
    },
    {
      id: 'darkTheme',
      name: 'Dark',
      keywords: 'dark theme',
      section: 'Theme',
      icon: <FaMoon color={secondaryTextInverse} />,
      perform: () => setColorMode('dark'),
      parent: 'theme'
    },
    {
      id: 'lightTheme',
      name: 'Light',
      keywords: 'light theme',
      section: 'Theme',
      icon: <FaSun color={secondaryTextInverse} />,
      perform: () => setColorMode('light'),
      parent: 'theme'
    },
    {
      id: 'systemTheme',
      name: 'System',
      keywords: 'system theme',
      section: 'Theme',
      icon: <FaDesktop color={secondaryTextInverse} />,
      perform: () => setColorMode('system'),
      parent: 'theme'
    }
  )

  const resultsWithShortcuts = results.filter(
    (result) => result.id === '..' || result.id === '/'
  )

  let shortcutsWithTitle = []
  if (resultsWithShortcuts.length !== 0) {
    shortcutsWithTitle = ['SHORTCUTS', ...resultsWithShortcuts]
  }
  const resultsMinusShortcuts = results.filter(
    (result) =>
      result.id !== '..' && result.id !== '/' && result !== 'shortcuts'
  )

  // results.length < resultsCount = false when KBAR is loaded initially
  const actualResults =
    results.length < resultsCount
      ? [...shortcutsWithTitle, ...resultsMinusShortcuts]
      : results

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

  const os = detectOS()

  return (
    <KBarPortal>
      <KBarPositioner className='kbar_positioner'>
        <KBarAnimator
          className='kbar_animator'
          style={{ background: primaryBgColor }}
        >
          <div className='kbar_search_container'>
            {/* search icon */}
            <SearchIcon color={sameSecondaryText} />
            {/* search input */}
            <KBarSearch className='kbar_search' />
            <Kbd>{os?.startsWith('Windows') ? 'Ctrl' : 'Cmd'}</Kbd> +
            <Kbd> K</Kbd>
          </div>
          <div className='kbar_result_container'>
            {/* search results */}

            {results && results?.length !== 0 && (
              <div className='kbar_result_body'>
                <KBarResults
                  items={actualResults}
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
