import { useLazyQuery } from '@apollo/client'
import { Flex } from '@chakra-ui/react'
import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'
import { ComponentSupportInfos } from 'graphQL/Queries'
import { useGlobalState } from 'hooks/useGlobalState'
import React, { useEffect } from 'react'

const Support = () => {
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState

  // GET COMPONENT SUPPORT INFO
  const [getSupportInfos, { data }] = useLazyQuery(ComponentSupportInfos, {fetchPolicy: 'network-only'})

  useEffect(() => {
    if (data === undefined) {
      getSupportInfos({
        variables: { field, direction, first: totalRows, search: searchInput !== '' ? searchInput : undefined}
      }).then((res) => {
        if (res?.data) {
          console.log('Support data', res.data)
        }
      })
    }
  }, [data])

  return (
    <Flex flexDirection='column' pt={{ base: '120px', md: '74px' }} pr={2} pl={5}>
      <Card>
        <SupportTable data={data?.componentSupportInfos} refetch={getSupportInfos}/>
      </Card>
    </Flex>
  )
}

export default Support
