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
import { useGlobalState } from 'hooks/useGlobalState'

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
  const { prodState } = useGlobalState()
  const { field, direction, totalProduct } = prodState

  const { data: allProducts } = useQuery(GetProjectData, {
    variables: {
      first: totalProduct,
      enabled: true,
      field: field,
      direction: direction
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
      const filterVersion = [...currentProd.sboms].sort((a, b) => {
        const dateA = new Date(a.creationAt)
        const dateB = new Date(b.creationAt)
        return dateB - dateA
      })
      const currentIndex = filterVersion?.findIndex(
        (item) => item.id === currentSbomId
      )
      if (currentIndex !== filterVersion.length - 1) {
        setSelectedVersion(filterVersion[currentIndex + 1].id)
        setSbomId(filterVersion[currentIndex + 1].id)
      } else {
        setSelectedVersion('')
        setSbomId('')
      }
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
                label: project.primaryComponent.version,
                value: project.id,
                creationAt: project.creationAt
              })
            }
          })
          setUniqVersions(versions)
        }
      })
    }
  }, [selectedProd])

  // REMOVE DUPLICATE PRODUCTS
  const removeDuplicates = (arr) => {
    const uniqueVersions = {}
    for (const item of arr) {
      if (
        !uniqueVersions[item.label] ||
        item.updatedAt > uniqueVersions[item.label].creationAt
      ) {
        uniqueVersions[item.label] = item
      }
    }
    const versions = Object.values(uniqueVersions)
      .sort((a, b) => {
        const dateA = new Date(a.creationAt)
        const dateB = new Date(b.creationAt)
        return dateB - dateA
      })
      .filter((item) => item.value !== currentSbomId)

    return versions
  }


  const filteredData = uniqVersions ? removeDuplicates(uniqVersions) : []

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
                    <option key={index} value={item.value}>
                      {item.label}
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
