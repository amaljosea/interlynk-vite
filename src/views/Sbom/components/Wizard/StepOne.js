import {
  Heading,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Text
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { GetProject } from 'graphQL/Queries'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import { removeDuplicates } from 'utils'

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
  const { data } = prodState
  const group = JSON.parse(localStorage.getItem('product'))

  const activeGroup =
    data && data.nodes.find((item) => item.id === group.groupId)

  console.log('activeGroup', activeGroup)

  const productList =
    activeGroup &&
    activeGroup.projects
      .filter((item) => item.enabled === true)
      .map((option) => ({
        value: option.id,
        label: option.name
      }))

  console.log('productList', productList)

  useEffect(() => {
    if (activeGroup) {
      const currentProd = activeGroup.projects.find(
        (item) => item.id === currentProductId
      )
      setSelectedProd(currentProd.id)
      setProductId(currentProd.id)
      // const filterVersion = [...currentProd.sboms].filter(
      //   (item) => item.id !== currentSbomId
      // )
      // const currentIndex = filterVersion?.findIndex(
      //   (item) => item.id === currentSbomId
      // )
      // if (currentIndex !== filterVersion.length - 1) {
      //   setSelectedVersion(filterVersion[currentIndex + 1].id)
      //   setSbomId(filterVersion[currentIndex + 1].id)
      // } else {
      //   setSelectedVersion('')
      //   setSbomId('')
      // }
    }
  }, [data])

  const [getProduct] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    setSelectedVersion('')
    setSelectedProd(e.target.value)
    setProductId(e.target.value)
  }

  useEffect(() => {
    if (selectedProd !== '' && selectedVersion === '') {
      getProduct({
        variables: {
          id: selectedProd
        }
      }).then((res) => {
        if (res.data) {
          const data = removeDuplicates(res.data.project.sboms)
          const filtered = [...data].filter(
            (item) => item.id !== currentSbomId && item.primaryComponent
          )
          if (filtered.length > 0) {
            setSelectedVersion(filtered[0].id)
            setUniqVersions(filtered)
          } else {
            setSelectedVersion('')
            setUniqVersions([])
          }
        }
      })
    }
  }, [selectedProd])

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
                {uniqVersions.length > 0 &&
                  uniqVersions.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.primaryComponent?.version}
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
