import { useEffect, useContext } from 'react'
import { Box, Heading, Flex, Text, Stack } from '@chakra-ui/react'
import GlobalContext from 'context/GlobalContext'
import { findSimilarItems } from 'utils'
import CopyTable from 'components/Tables/CopyTable'

const StepTwo = ({
  productId,
  sbomId,
  getVulns,
  currentSbomId,
  currentProductId
}) => {
  const {
    vulnField,
    vulnDirection,
    totalVulns,
    mergeData,
    setMergeData,
    currentSbom,
    setCurrentSbom,
    importSbom,
    setImportSbom
  } = useContext(GlobalContext)

  useEffect(() => {
    if (currentSbomId && currentProductId) {
      getVulns({
        variables: {
          projectId: currentProductId,
          sbomId: currentSbomId,
          first: totalVulns,
          field: vulnField,
          direction: vulnDirection
        }
      }).then((res) => setCurrentSbom(res.data.sbom.vulns.nodes))
    }
  }, [])

  useEffect(() => {
    if (productId && sbomId) {
      getVulns({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          first: totalVulns,
          field: vulnField,
          direction: vulnDirection
        }
      }).then((res) => setImportSbom(res.data.sbom.vulns.nodes))
    }
  }, [productId, sbomId])

  useEffect(() => {
    if (currentSbom && importSbom) {
      // console.log('currentSbom', currentSbom)
      // console.log('importSbom', importSbom)
      const data = findSimilarItems(currentSbom, importSbom)
      const filterData = data.filter((item) => item.importStatus !== null)
      // console.log('filterData', filterData)
      setMergeData(filterData)
    }
  }, [currentSbom, importSbom])

  // useEffect(() => {
  //   console.log('Final data', mergeData)
  // }, [mergeData])

  return (
    <Box width={'90%'} mx={'auto'}>
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
          justifyContent={'space-between'}
          mt={12}
        >
          <Text>Total: 0</Text>
        </Flex>
      )}
    </Box>
  )
}

export default StepTwo
