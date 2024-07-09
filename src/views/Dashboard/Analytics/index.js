import React, { useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'

import OrgRegister from '../Profile/components/OrgRegister'
import { Filters } from './Filters'
import { Graphs } from './Graphs'

const Analytics = () => {
  const org = localStorage.getItem('organization')
  const orgNotFound = !org || org === 'undefined'

  const [filters, setFilters] = useState({
    env: null,
    product: [],
    version: [],
    duration: null
  })

  if (orgNotFound) return <OrgRegister />

  return (
    <Flex gap={6} width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
      <Card>
        <CardBody>
          <Filters filters={filters} setFilters={setFilters} />
        </CardBody>
      </Card>
      <Card>
        <CardBody py={6} pr={12}>
          <Graphs filters={filters} />
        </CardBody>
      </Card>
    </Flex>
  )
}

export default Analytics
