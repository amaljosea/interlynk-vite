import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import OrgRegister from 'views/Dashboard/Profile/components/OrgRegister'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import SupportTable from 'components/Tables/SupportTable'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetSupportTab } from 'graphQL/Queries'

const Support = () => {
  const org = localStorage.getItem('organization')
  const { totalRows, supportState } = useGlobalState()
  const { searchInput, field, direction } = supportState

  // GET COMPONENT SUPPORT INFO
  const [getSupportData, { data }] = useLazyQuery(GetSupportTab)

  useEffect(() => {
    if (org !== 'undefined' && data === undefined) {
      getSupportData({
        variables: {
          search: searchInput === '' ? undefined : searchInput,
          first: totalRows,
          field: field,
          direction: direction
        }
      }).then((res) => {
        if (res?.data) {
          console.log('Support data', res.data)
        }
      })
    }
  }, [])

  return (
    <Flex
      flexDirection='column'
      pt={{ base: '120px', md: '74px' }}
      pr={2}
      pl={5}
    >
      {!org || org === 'undefined' ? (
        <OrgRegister />
      ) : (
        <Card>
          <SupportTable data={data?.supports} refetch={getSupportData} />
        </Card>
      )}
    </Flex>
  )
}

export default Support
