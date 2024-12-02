import React, { useState } from 'react'

import { Flex, Stack } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'

import { useGlobalState } from 'hooks/useGlobalState'

import { Filters } from './Filters'
import { Graphs } from './Graphs'

const Analytics = () => {
  const { organization } = useGlobalState()
  const [filters, setFilters] = useState({
    product: [],
    label: null,
    version: [],
    duration: null
  })

  return (
    <Flex gap={6} width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
      {/* ENVIRONMENT FILTER */}
      {organization && <GlobalEnvFilter />}
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
