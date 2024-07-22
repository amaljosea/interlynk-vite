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
import { useNavigate } from 'react-router-dom'
import { getUserType } from 'utils/url'

import { SearchIcon } from '@chakra-ui/icons'
import { useColorModeValue } from '@chakra-ui/system'

import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import useSettingActions from 'hooks/useSettingActions'
import useThemeActions from 'hooks/useThemeAction'

import { GetProjectGroupAndVersionDetails } from 'graphQL/Queries'

import { FaRegWindowMaximize } from 'react-icons/fa'
import { FaScrewdriverWrench } from 'react-icons/fa6'

const Kbar = () => {
  // hooks
  const { results, rootActionId } = useMatches()
  const navigate = useNavigate()
  const {
    generateProductVersionDetailPageUrlFromCurrentUrl,
    generateProductDetailPageUrlFromCurrentUrl
  } = useProductUrlContext()
  const { setEnvName, envName } = useGlobalState()

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

    localStorage.setItem('environment', env?.name)
    setEnvName(env?.name)
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
    })
  }

  useThemeActions()
  useSettingActions()
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
