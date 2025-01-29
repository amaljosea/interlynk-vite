import { useEffect, useState } from 'react'

import { Flex } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'

import { useGlobalState } from 'hooks/useGlobalState'

import { Filters } from './Filters'
import { Graphs } from './Graphs'

const Analytics = () => {
  const { organization, envName } = useGlobalState()
  const [filters, setFilters] = useState({
    product: [],
    label: null,
    version: [],
    duration: null
  })

  useEffect(() => {
    if (envName) {
      setFilters((filtersOld) => ({
        ...filtersOld,
        version: []
      }))
    }
  }, [envName])

  return (
    <Flex gap={6} width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
      {/* ENVIRONMENT FILTER */}
      {organization && <GlobalEnvFilter />}
      <Card>
        <CardBody>
          <Filters filters={filters} setFilters={setFilters} />
        </CardBody>
      </Card>
      {/* GRAPHS */}
      <Graphs filters={filters} />
    </Flex>
  )
}

export default Analytics
