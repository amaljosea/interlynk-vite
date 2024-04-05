import { useEffect } from 'react'
import { findSimilarItems } from 'utils'

import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'

import CopyTable from 'components/Tables/CopyTable'

import { useGlobalState } from 'hooks/useGlobalState'

const StepTwo = ({
  productId,
  sbomId,
  getVulns,
  currentSbomId,
  currentProductId
}) => {
  const { prodVulnState, dispatch } = useGlobalState()
  const { field, direction, totalVulns, mergeData, importSbom, currentSbom } =
    prodVulnState
  const { prodVulnDispatch } = dispatch

  useEffect(() => {
    if (currentSbomId && currentProductId) {
      getVulns({
        variables: {
          projectId: currentProductId,
          sbomId: currentSbomId,
          first: totalVulns,
          field: field,
          direction: direction
        }
      }).then((res) =>
        prodVulnDispatch({
          type: 'UPDATE_CURRENT_SBOM',
          payload: res.data.sbom.vulns.nodes
        })
      )
    }
  }, [])

  useEffect(() => {
    if (productId && sbomId) {
      getVulns({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalVulns,
          field: field,
          direction: direction
        }
      }).then((res) =>
        prodVulnDispatch({
          type: 'UPDATE_IMPORT_SBOMS',
          payload: res.data.sbom.vulns.nodes
        })
      )
    }
  }, [productId, sbomId])

  useEffect(() => {
    if (currentSbom && importSbom) {
      console.log('currentSbom', currentSbom)
      console.log('importSbom', importSbom)
      const data = findSimilarItems(currentSbom, importSbom)
      const filterData = data.filter((item) => item.importStatus !== null)
      prodVulnDispatch({ type: 'UPDATE_MERGE_DATA', payload: filterData })
    }
  }, [currentSbom, importSbom])

  return (
    <Box width={'100%'} mx={'auto'}>
      <Stack
        dir='column'
        spacing={4}
        alignItems={'center'}
        justifyContent={'center'}
        textAlign={'center'}
      >
        <Heading fontWeight={'medium'} fontSize={24} fontFamily={'inherit'}>
          Select common vulnerabilities for status update
        </Heading>
      </Stack>
      {mergeData.length > 0 ? (
        <CopyTable />
      ) : (
        <Flex
          width={'100%'}
          alignItems={'center'}
          flexDirection={'column'}
          justifyContent={'flex-start'}
          gap={24}
          mt={12}
        >
          <Text>Total: 0</Text>
          <Text fontSize={24} mt={12}>
            No match found. Please select other version
          </Text>
        </Flex>
      )}
    </Box>
  )
}

export default StepTwo
