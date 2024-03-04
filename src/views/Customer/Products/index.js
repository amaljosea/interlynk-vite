// Chakra imports
import { Flex } from '@chakra-ui/react'
import { useLazyQuery } from '@apollo/client'
import { ShareLynkProjectGroup } from 'graphQL/Queries'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function Index() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = new URLSearchParams(location.search)
  const productId = queryParams.get('id')

  const [getProjectGroup] = useLazyQuery(ShareLynkProjectGroup, {
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (productId) {
      getProjectGroup({ variables: { id: productId } }).then((res) => {
        if (res?.data) {
          const group = res?.data?.shareLynkQuery?.projectGroup
          const product = { id:  group?.id , name: group?.name, groupId: group?.id }
          localStorage.setItem('product', JSON.stringify(product))
          localStorage.setItem('publicEnv', group?.defaultProject?.id)
          navigate(`/customer/products/${group?.name}?id=${group?.id}`)
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
