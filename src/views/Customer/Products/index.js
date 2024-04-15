// Chakra imports
import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { getProductDetailPageUrl } from 'utils/url'

import { Flex } from '@chakra-ui/react'

import { ShareLynkProjectGroup } from 'graphQL/Queries'

function Index() {
  const navigate = useNavigate()
  const params = useParams()
  const productGroupId = params.productgroupid

  const [getProjectGroup] = useLazyQuery(ShareLynkProjectGroup, {
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (productGroupId) {
      getProjectGroup({ variables: { id: productGroupId } }).then((res) => {
        if (res?.data) {
          const group = res?.data?.shareLynkQuery?.projectGroup
          const product = {
            id: group?.id,
            name: group?.name,
            groupId: group?.id
          }
          localStorage.setItem('product', JSON.stringify(product))
          localStorage.setItem('publicEnv', group?.defaultProject?.id)
          navigate(
            getProductDetailPageUrl({
              productgroupid: productGroupId,
              productid: params.productid
            })
          )
        }
      })
    }
  }, [])

  return (
    <Flex flexDirection='column' pt={'74px'} pr={2} pl={5}>
      <Outlet />
    </Flex>
  )
}

export default Index
