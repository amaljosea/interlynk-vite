import { useContext, useEffect, useState } from 'react'
import {
  Progress,
  Box,
  Text,
  Stack,
  FormLabel,
  FormControl,
  Select,
  Checkbox,
  Flex
} from '@chakra-ui/react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetProjectData, GetProject, GetVulnData } from 'graphQL/Queries'
import CopyTable from 'components/Tables/CopyTable'
import GlobalContext from 'context/GlobalContext'
import { useLocation } from 'react-router-dom'
import { findSimilarItems } from 'utils'

let productId
let sbomId

// FORM ONE
const Form1 = ({
  selectedProd,
  setSelectedProd,
  selectedVersion,
  setSelectedVersion,
  uniqVersions,
  setUniqVersions
}) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomVersionId = queryParams.get('sbom')

  const { totalProducts } = useContext(GlobalContext)

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: totalProducts
    }
  })

  const productList =
    allProducts &&
    allProducts.projects.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    setSelectedProd(e.target.value)
    productId = e.target.value
    getProduct({
      variables: {
        id: e.target.value
      }
    }).then((res) => {
      if (res.data) {
        let versions = []
        res.data.project.sboms.map((project) => {
          if (project.primaryComponent) {
            versions.push({
              version: project.primaryComponent.version,
              id: project.id,
              updatedAt: project.updatedAt
            })
          }
        })
        setUniqVersions(versions)
      }
    })
  }

  const filterVersions =
    uniqVersions.length > 0 &&
    uniqVersions.filter((version) => version.id !== sbomVersionId)

  // remove duplicates
  const removeDuplicatesAndLatest = (arr) => {
    const uniqueVersions = {}

    for (const item of arr) {
      if (
        !uniqueVersions[item.version] ||
        item.updatedAt > uniqueVersions[item.version].updatedAt
      ) {
        uniqueVersions[item.version] = item
      }
    }

    return Object.values(uniqueVersions)
  }

  const filteredData = filterVersions
    ? removeDuplicatesAndLatest(filterVersions)
    : []

  return (
    <>
      <Box width={'400px'} margin={'0 auto'}>
        {productList && (
          <Stack spacing={4} direction={'column'} gap={2}>
            {/* Project */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                Project
              </FormLabel>
              <Select
                name='product'
                id='product'
                value={selectedProd}
                onChange={handleSelectProduct}
              >
                <option value={''}>-- Select --</option>
                {productList.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/* Version */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='versions' fontSize='md' color='gray.600'>
                Version
              </FormLabel>
              <Select
                name='versions'
                id='versions'
                value={selectedVersion}
                onChange={(e) => {
                  setSelectedVersion(e.target.value)
                  sbomId = e.target.value
                }}
              >
                <option value={''}>-- Select --</option>
                {filteredData.length > 0 &&
                  filteredData.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.version}
                    </option>
                  ))}
              </Select>
            </FormControl>
          </Stack>
        )}
      </Box>
    </>
  )
}

// FORM TWO
const Form2 = ({ isChecked, setIsChecked }) => {
  return (
    <>
      <Box width={'400px'} margin={'0 auto'}>
        <FormControl mt={24}>
          <Checkbox
            colorScheme='blue'
            isChecked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          >
            Import status of vulnerabilities
          </Checkbox>
        </FormControl>
      </Box>
    </>
  )
}

// FORM THREE
const Form3 = ({
  importFrom,
  setImportFrom,
  statusHistory,
  setStatusHistory
}) => {
  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Component view resolved by
      </Text>
      <Box width={'300px'} margin={'0 auto'}>
        <Stack spacing={4} direction={'column'} gap={2}>
          {/* import from */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='importFrom' fontSize='md' color='gray.600'>
              Prefer vulnerability status from
            </FormLabel>
            <Select
              name='importFrom'
              id='importFrom'
              value={importFrom}
              onChange={(e) => setImportFrom(e.target.value)}
            >
              <option value={''}>-- Select --</option>
              <option value={'Keep existing'}>Keep existing</option>
              <option value={'Replace from import'}>Replace from import</option>
            </Select>
          </FormControl>
          {/* status history */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='statusHistory' fontSize='md' color='gray.600'>
              Import vulnerability status history
            </FormLabel>
            <Select
              name='statusHistory'
              id='statusHistory'
              value={statusHistory}
              onChange={(e) => setStatusHistory(Boolean(e.target.value))}
            >
              <option>-- Select --</option>
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  )
}

// FORM FOUR
const Form4 = ({
  getVulns,
  importFrom,
  statusHistory,
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
  }, [])

  useEffect(() => {
    if (currentSbom && importSbom) {
      const data = findSimilarItems(
        currentSbom,
        importSbom,
        importFrom,
        statusHistory
      )
      const filterData = data.filter((item) => item.importStatus !== null)
      console.log('filterData', filterData)
      setMergeData(filterData)
    }
  }, [currentSbom, importSbom])

  useEffect(() => {
    console.log('Final data', mergeData)
  }, [mergeData])

  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        Vunlerability view resolved by
      </Text>
      <Box width={'90%'} margin={'0 auto'}>
        {mergeData.length > 0 ? (
          <CopyTable
            productId={productId}
            sbomId={sbomId}
            getVulns={getVulns}
            importFrom={importFrom}
            statusHistory={statusHistory}
          />
        ) : (
          <Flex
            width={'100%'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Text>Total : {mergeData.length}</Text>
          </Flex>
        )}
      </Box>
    </>
  )
}

const Multistep = ({
  step,
  progress,
  currentSbomId,
  currentProductId,
  getVulns
}) => {
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const [isChecked, setIsChecked] = useState(false)

  const [importFrom, setImportFrom] = useState('')
  const [statusHistory, setStatusHistory] = useState()

  return (
    <>
      <Box as='form'>
        <Progress
          hasStripe
          size='sm'
          value={progress}
          isAnimated
          mb={8}
        ></Progress>
        {step === 1 ? (
          <Form1
            selectedProd={selectedProd}
            setSelectedProd={setSelectedProd}
            selectedVersion={selectedVersion}
            setSelectedVersion={setSelectedVersion}
            uniqVersions={uniqVersions}
            setUniqVersions={setUniqVersions}
          />
        ) : step === 2 ? (
          <Form2 isChecked={isChecked} setIsChecked={setIsChecked} />
        ) : step === 3 ? (
          <Form3
            importFrom={importFrom}
            setImportFrom={setImportFrom}
            statusHistory={statusHistory}
            setStatusHistory={setStatusHistory}
          />
        ) : (
          step === 4 && (
            <Form4
              currentSbomId={currentSbomId}
              currentProductId={currentProductId}
              importFrom={importFrom}
              statusHistory={statusHistory}
              getVulns={getVulns}
            />
          )
        )}
      </Box>
    </>
  )
}

export default Multistep
