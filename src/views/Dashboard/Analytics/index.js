import { useEffect } from 'react'

import { Button, Flex } from '@chakra-ui/react'

import AnalyticsList from 'components/AnalyticsList'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import GlobalEnvFilter from 'components/Misc/GlobalEnvFilter'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useGlobalState } from 'hooks/useGlobalState'

import { Filters } from './Filters'
import { Graphs } from './Graphs'

const Analytics = () => {
  const { isFreeTier } = useGlobalQueryContext()
  const { organization, envName, dispatch } = useGlobalState()
  const { analyticsDispatch } = dispatch

  useEffect(() => {
    if (envName) {
      analyticsDispatch({ type: 'CLEAR_FILTERS' })
    }
  }, [analyticsDispatch, envName])

  return (
    <Flex gap={6} width={'100%'} flexDir={'column'} alignItems={'flex-start'}>
      {/* ENVIRONMENT FILTER */}
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <Button
          fontSize='sm'
          fontWeight={'medium'}
          colorScheme='blue'
          textTransform={'capitalize'}
          _hover={{ colorScheme: 'blue' }}
          _active={{ colorScheme: 'blue' }}
        >
          {envName}
        </Button>
        <Flex gap={2} alignItems={'center'}>
          {organization && <GlobalEnvFilter />}
          {!isFreeTier && <AnalyticsList />}
        </Flex>
      </Flex>
      <Card>
        <CardBody>
          <Filters />
        </CardBody>
      </Card>
      {/* GRAPHS */}
      <Graphs />
    </Flex>
  )
}

export default Analytics
