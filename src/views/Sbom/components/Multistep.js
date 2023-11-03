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
  Flex,
  Skeleton
} from '@chakra-ui/react'
import { useLazyQuery, useQuery } from '@apollo/client'
import { GetProjectData, GetProject, GetVulnData } from 'graphQL/Queries'
import CopyTable from 'components/Tables/CopyTable'
import GlobalContext from 'context/GlobalContext'
import { useLocation } from 'react-router-dom'
import { mergeData } from 'utils'

let productId
let sbomId

// FORM ONE
const Form1 = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomVersionId = queryParams.get('sbom')

  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [uniqVersions, setUniqVersions] = useState([])

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: 10
    }
  })

  const productList =
    allProducts &&
    allProducts.projects.nodes.map((option) => ({
      value: option.id,
      label: option.name
    }))

  const [getProduct, { data }] = useLazyQuery(GetProject)

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
    uniqVersions.filter((version) => version.id !== `${sbomVersionId}`)

  // console.log('uniqVersions', uniqVersions)

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

  // console.log('selectedProd', selectedProd)
  // console.log('selectedVersion', selectedVersion)

  return (
    <>
      <Box width={'400px'} margin={'0 auto'}>
        <Stack spacing={4} direction={'column'} gap={2}>
          {/* Project */}
          <FormControl fontSize={'sm'}>
            <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
              Project
            </FormLabel>
            <Select
              name='projects'
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
            <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
              Version
            </FormLabel>
            <Select
              name='projects'
              value={selectedVersion}
              onChange={(e) => {
                setSelectedVersion(e.target.value)
                sbomId = e.target.value
              }}
            >
              <option value={''}>-- Select --</option>
              {filterVersions.length > 0 &&
                filterVersions.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.version}
                  </option>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  )
}

// FORM TWO
const Form2 = () => {
  return (
    <>
      <Box width={'400px'} margin={'0 auto'}>
        <FormControl mt={24}>
          <Checkbox colorScheme='blue'>
            Import status of vulnerabilities
          </Checkbox>
        </FormControl>
      </Box>
    </>
  )
}

// FORM THREE
const Form3 = () => {
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
            <Select name='importFrom'>
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
            <Select name='statusHistory'>
              <option value={''}>-- Select --</option>
              <option value={'Yes'}>Yes</option>
              <option value={'No'}>No</option>
            </Select>
          </FormControl>
        </Stack>
      </Box>
    </>
  )
}

// FORM FOUR
const Form4 = ({ currentData, refetch }) => {
  const { vulnField, vulnDirection } = useContext(GlobalContext)

  // GET VULN DATA
  const [getVulns, { data: vulnData }] = useLazyQuery(GetVulnData)
  const [finalData, setFinalData] = useState([])

  useEffect(() => {
    if (productId && sbomId) {
      getVulns({
        variables: {
          projectId: productId,
          sbomId: sbomId,
          field: vulnField,
          direction: vulnDirection
        }
      })
    }
  }, [])

  useEffect(() => {
    if (vulnData) {
      const data = mergeData(currentData, vulnData.sbom.vulns.nodes)
      setFinalData(data)
    }
  }, [vulnData])

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
        <CopyTable
          data={finalData}
          productId={productId}
          sbomId={sbomId}
          getVulns={getVulns}
          refetch={refetch}
          setFinalData={setFinalData}
        />
      </Box>
    </>
  )
}

const Multistep = ({ step, progress, currentData, refetch }) => {
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
          <Form1 />
        ) : step === 2 ? (
          <Form2 />
        ) : step === 3 ? (
          <Form3 />
        ) : (
          step === 4 && <Form4 currentData={currentData} refetch={refetch} />
        )}
      </Box>
    </>
  )
}

export default Multistep
