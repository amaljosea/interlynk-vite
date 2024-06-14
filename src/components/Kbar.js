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
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserType } from 'utils/url'

import { SearchIcon } from '@chakra-ui/icons'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetProductTable } from 'graphQL/Queries'

import { FaRegWindowMaximize } from 'react-icons/fa'

const Kbar = () => {
  // hooks
  const { results } = useMatches()
  const userType = getUserType()
  const navigate = useNavigate()

  const { userPermissions } = useGlobalState()
  const productPermissions = useMemo(
    () => userPermissions?.find((item) => item.key === 'view_product_group'),
    [userPermissions]
  )

  const { data: productData } = useQuery(GetProductTable, {
    skip: productPermissions?.value === true ? false : true,
    fetchPolicy: 'network-only',
    variables: {
      field: 'PROJECT_GROUPS_UPDATED_AT',
      direction: 'DESC',
      enabled: true
    }
  })

  let data = []
  if (productData?.organization?.projectGroups?.nodes?.length > 0) {
    productData?.organization?.projectGroups?.nodes?.map((item) =>
      data?.push({
        id: item?.name,
        name: item?.name,
        section: 'products',
        icon: <FaRegWindowMaximize color='#718096' />,
        perform: () =>
          navigate(
            `/${userType}/products/${item?.id}/env/${item?.defaultProject?.id}`
          )
      })
    )
  }

  useRegisterActions(data, [productData])

  return (
    <KBarPortal>
      <KBarPositioner className='kbar_positioner'>
        <KBarAnimator className='kbar_animator'>
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
                  onRender={({ item, active }) =>
                    typeof item === 'string' ? (
                      // section header
                      <div className='kbar_result_header'>{item}</div>
                    ) : (
                      // each single item
                      <div
                        className='kbar_result_item_container'
                        style={{ background: active ? '#EDF2F7' : 'none' }}
                      >
                        <div className='kbar_result_item'>
                          {/* icon */}
                          <div>{item?.icon}</div>
                          {/* name and subtitle */}
                          <div
                            className='kbar_result_item_name'
                            style={{ fontSize: '14px' }}
                          >
                            {item?.name}
                          </div>
                        </div>
                      </div>
                    )
                  }
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
