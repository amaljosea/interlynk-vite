import {
  Heading,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Text
} from '@chakra-ui/react'
import { useContext, useEffect } from 'react'
import GlobalContext from 'context/GlobalContext'
import { GetProjectData, GetProject } from 'graphQL/Queries'
import { useLazyQuery, useQuery } from '@apollo/client'

const StepOne = ({
  setProductId,
  setSbomId,
  currentSbomId,
  currentProductId,
  selectedProd,
  setSelectedProd,
  selectedVersion,
  setSelectedVersion,
  uniqVersions,
  setUniqVersions
}) => {
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

  useEffect(() => {
    if (allProducts) {
      const currentProd = allProducts.projects.nodes.find(
        (item) => item.id === currentProductId
      )
      setSelectedProd(currentProd.id)
      setProductId(currentProd.id)
    }
  }, [allProducts])

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    setSelectedVersion('')
    setSelectedProd(e.target.value)
    setProductId(e.target.value)
  }

  useEffect(() => {
    if (selectedProd !== '') {
      getProduct({
        variables: {
          id: selectedProd
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
  }, [selectedProd])

  const filterVersions =
    uniqVersions.length > 0 &&
    uniqVersions.filter((version) => version.id !== currentSbomId)

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

  filteredData?.sort((a, b) => {
    const dateA = new Date(a.updatedAt)
    const dateB = new Date(b.updatedAt)

    // Compare the dates
    return dateB - dateA
  })

  return (
    <>
      <Box width={'50%'} mx={'auto'}>
        <Stack
          dir='column'
          spacing={4}
          alignItems={'center'}
          justifyContent={'center'}
          textAlign={'center'}
        >
          <Heading fontWeight={'medium'} fontSize={24} fontFamily={'inherit'}>
            Select the source of Vulnerability Status.
          </Heading>
          <Text>
            This importer allows you to bring vulnerability status from a
            different product/version to this version. Select source product and
            version to get started
          </Text>
        </Stack>
        {productList && (
          <Stack
            width={'350px'}
            mx={'auto'}
            spacing={4}
            direction={'column'}
            gap={2}
            mt={12}
          >
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
                  setSbomId(e.target.value)
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

export default StepOne
