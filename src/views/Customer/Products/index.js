import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import { Flex } from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'

import { ShareLynkProjectGroup } from 'graphQL/Queries'

function Index() {
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
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
          navigate(
            generateProductDetailPageUrlFromCurrentUrl({
              productgroupid: productGroupId
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
