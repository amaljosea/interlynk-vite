import { useState } from 'react'
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

let productId
let sbomId
const uniqVersions = []

// FORM ONE
const Form1 = () => {
  const [selectedProd, setSelectedProd] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')

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
      console.log(res.data.project.sboms)
    })
  }

  data &&
    data.project.sboms.map((project) => {
      if (project.primaryComponent) {
        uniqVersions.push({
          version: project.primaryComponent.version,
          id: project.id,
          updatedAt: project.updatedAt
        })
      }
    })

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

  const filteredData = uniqVersions
    ? removeDuplicatesAndLatest(uniqVersions)
    : []

  return (
    <>
      <Text
        w='100%'
        fontSize={24}
        textAlign={'center'}
        fontWeight='medium'
        mb={10}
      >
        {/* Existing Projects */}
        Coming Soon
      </Text>
      <Box width={'400px'} margin={'0 auto'} display={'none'}>
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
              {filteredData.length > 0 &&
                filteredData.map((item, index) => (
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
const Form4 = () => {
  // GET VULN DATA
  const { data: vulnData } = useQuery(GetVulnData, {
    variables: {
      projectId: productId,
      sbomId: sbomId,
      first: 10,
      field: 'UPDATED_AT',
      direction: 'ASC'
    }
  })

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
        {vulnData && <CopyTable data={vulnData.sbom.vulns} />}
      </Box>
    </>
  )
}

const Multistep = ({ step, progress }) => {
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
          step === 4 && <Form4 />
        )}
      </Box>
    </>
  )
}

export default Multistep
