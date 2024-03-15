import { useLazyQuery } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'
import { GetSupportTab } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import { useEffect } from 'react'

const Support = () => {
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState

  // GET COMPONENT SUPPORT INFO
  const [getSupportData, { data }] = useLazyQuery(GetSupportTab, {fetchPolicy: 'network-only' })

  useEffect(() => {
    if (data === undefined) {
      getSupportData({ variables: { search: searchInput === '' ? undefined : searchInput, first: totalRows, field: field, direction: direction }}).then((res) => {
        if (res?.data) {
          console.log('Support data', res.data)
        }
      })
    }
  }, [])

  return (
    <Flex flexDirection='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
      <Card><SupportTable data={data?.supports} refetch={getSupportData}/></Card>
    </Flex>
  )
}

export default Support
