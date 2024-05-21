import { useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'

import OrgRegister from '../Profile/components/OrgRegister'
import RequestTable from './RequestTable'

const Inbox = () => {
  const org = localStorage.getItem('organization')

  const [filters, setFilters] = useState({
    field: '',
    direction: 'DESC'
  })

  // const { nodes, paginationProps, reset, loading, refetch } =
  //   usePaginatatedQuery(GetSupportTab, {
  //     skip: org !== 'undefined' ? false : true,
  //     selector: 'supports',
  //     variables: {
  //       ...filters
  //     }
  //   })

  const data = [
    {
      id: 1,
      email: 'sp@interlynk.io',
      productName: 'lynk-dash-app',
      productVersion: '1.3',
      status: 'Uploaded',
      requested: `${new Date().toLocaleDateString()}`
    },
    {
      id: 2,
      email: 'ritesh@interlynk.io',
      productName: 'lynk-api',
      productVersion: '2.2',
      status: 'Sent',
      requested: `${new Date().toLocaleDateString()}`
    },
    {
      id: 3,
      email: 'hasseb@interlynk.io',
      productName: 'dropwizard',
      productVersion: '3.0',
      status: 'Declined',
      requested: `${new Date().toLocaleDateString()}`
    },
    {
      id: 4,
      email: 'sijin@interlynk.io',
      productName: 'calibrator',
      productVersion: '2.0',
      status: 'Canceled',
      requested: `${new Date().toLocaleDateString()}`
    },
    {
      id: 5,
      email: 'amal@interlynk.io',
      productName: 'biotronix',
      productVersion: '4.2',
      status: 'Bounced',
      requested: `${new Date().toLocaleDateString()}`
    }
  ]

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
          <RequestTable
            data={data}
            loading={false}
            // paginationProps={paginationProps}
            filters={filters}
            setFilters={(newFilters) => {
              setFilters(newFilters)
              // reset()
            }}
          />
        </Card>
      )}
    </Flex>
  )
}

export default Inbox
