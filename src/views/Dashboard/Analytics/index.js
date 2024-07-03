import React, { useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import ViewAlert from 'components/Misc/ViewAlert'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import OrgRegister from '../Profile/components/OrgRegister'
import { Filters } from './Filters'
import { Graphs } from './Graphs'

const Analytics = () => {
  const { orgView, orgLoading } = useGlobalQueryContext()
  const org = localStorage.getItem('organization')
  const [filters, setFilters] = useState({
    env: null,
    product: [],
    version: [],
    duration: null
  })

  if (!orgView) {
    return <ViewAlert loading={orgLoading} category='analytics page' />
  }

  if (!org || org === 'undefined') return <OrgRegister />

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
