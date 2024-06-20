import { useQuery } from '@apollo/client'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getComponentHealthScoreFromLocalData } from 'utils/getComponentHealthScoreFromLocalData'

import {
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  Text,
  Tooltip
} from '@chakra-ui/react'

import Card from 'components/Card/Card'

import { useGlobalState } from 'hooks/useGlobalState'

import { GetComponentData } from 'graphQL/Queries'

const getBg = (score) => {
  if (score >= 0 && score < 30) {
    return 'red.300'
  } else if (score >= 30 && score < 50) {
    return 'yellow.300'
  } else if (score >= 50 && score <= 100) {
    return 'green.300'
  }
}

const TooltipData = ({ item }) => {
  return (
    <Stack direction={'column'} spacing={0} py={1}>
      <Text fontSize={'xs'}>Name - {item?.name}</Text>
      <Text fontSize={'xs'}>Version - {item?.version}</Text>
      <Text fontSize={'xs'}>Score - {item?.score}</Text>
    </Stack>
  )
}

const HeatMap = ({ data }) => {
  return (
    <>
      {data?.map((item, index) => (
        <Tooltip key={index} label={<TooltipData item={item} />}>
          <Center p={4} bg={getBg(item?.score)} />
        </Tooltip>
      ))}
    </>
  )
}

const HealthMap = ({ isOpen, onClose }) => {
  const params = useParams()
  const productId = params.productid
  const sbomId = params.sbomid
  const { prodCompState } = useGlobalState()
  const { totalComp } = prodCompState

  const { data, loading } = useQuery(GetComponentData, {
    skip: isOpen ? false : true,
    variables: {
      sbomId: sbomId,
      projectId: productId,
      first: totalComp
    }
  })

  const { nodes } = data?.sbom?.components || ''
  const isUnknown = nodes?.filter(
    (item) => item?.cpes?.length === 0 && !item?.purl
  )
  const isKnown = nodes?.filter(
    (item) => item?.cpes?.length === 0 && item?.purl
  )

  const getCategory = (data) => {
    let results = []
    data?.map((item) => {
      return results.push({
        name: item?.name,
        version: item?.version,
        score: getComponentHealthScoreFromLocalData({
          componentName: item?.name,
          componentVersion: item?.version
        }).healthScore
      })
    })
    return results
  }

  const seriesOne = getCategory(isKnown)
  const seriesTwo = getCategory(isUnknown)
  const knownData = seriesOne?.sort((a, b) => a?.score - b?.score)
  const unknownData = seriesTwo?.sort((a, b) => a?.score - b?.score)

  return (
    <Drawer
      size='xl'
      isOpen={isOpen}
      onClose={onClose}
      placement='right'
      closeOnOverlayClick={true}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px'>
          Component Health Heat Map
        </DrawerHeader>
        <DrawerBody>
          {loading ? (
            <Stack direction={'column'} p={5} spacing={6}>
              <Skeleton width={'100%'} height={32} />
              <Skeleton width={'100%'} height={32} />
            </Stack>
          ) : (
            <SimpleGrid width={'100%'} columns={1} spacing='24px'>
              <Card width={'100%'}>
                <Tag colorScheme='blue' width={'fit-content'} mb={6}>
                  Known Components
                </Tag>
                {knownData?.length > 0 && (
                  <Grid templateColumns='repeat(20, 1fr)' gap={0.5}>
                    <HeatMap data={knownData} />
                  </Grid>
                )}
              </Card>
              <Card width={'100%'}>
                <Tag colorScheme='blue' width={'fit-content'} mb={6}>
                  Unknown Components
                </Tag>
                {unknownData?.length > 0 && (
                  <Grid templateColumns='repeat(20, 1fr)' gap={0.5}>
                    <HeatMap data={unknownData} />
                  </Grid>
                )}
              </Card>
            </SimpleGrid>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default HealthMap
