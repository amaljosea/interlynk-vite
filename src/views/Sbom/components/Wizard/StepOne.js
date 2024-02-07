import {
  Heading,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Text
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { GetProject, GetProjectGroups } from 'graphQL/Queries'
import { useLazyQuery, useQuery } from '@apollo/client'
import { useGlobalState } from 'hooks/useGlobalState'
import { isDefaultEnv, normalizeSBOMVersion, envOrderList } from 'utils'

const StepOne = ({
  setProductId,
  setSbomId,
  currentSbomId,
  currentProductId,
  selectedGroup,
  setSelectedGroup,
  selectedProd,
  setSelectedProd,
  selectedVersion,
  setSelectedVersion,
  uniqVersions,
  setUniqVersions
}) => {
  const { totalRows, prodState } = useGlobalState()
  const { enabled, field, direction } = prodState
  const group = JSON.parse(localStorage.getItem('product'))

  const [envName, setEnvName] = useState('')

  const { data } = useQuery(GetProjectGroups, {
    variables: {
      first: totalRows,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction
    }
  })

  const activeGroup =
    data &&
    data?.organization?.projectGroups?.nodes.find(
      (item) => item.id === selectedGroup
    )

  const productList =
    activeGroup &&
    activeGroup.projects
      .filter((item) => item.enabled === true)
      .map((option) => ({
        value: option.id,
        label: option.name
      }))

  useEffect(() => {
    if (activeGroup) {
      const currentProd = activeGroup.projects.find(
        (item) => item.id === currentProductId
      )
      setSelectedProd(currentProd?.id)
      setEnvName(currentProd?.name)
      setProductId(currentProd?.id)
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

  const handleSelectGroup = (e) => {
    setSelectedVersion('')
    setSelectedProd('')
    setSelectedGroup(e.target.value)
  }

  const handleSelectProduct = (e) => {
    const { value } = e.target
    const env = e.target.options[e.target.selectedIndex].text
    setEnvName(env)
    setSelectedVersion('')
    setSelectedProd(value)
    setProductId(value)
  }

  useEffect(() => {
    if (selectedProd !== '' && selectedVersion === '') {
      getProduct({
        variables: {
          id: selectedProd
        }
      }).then((res) => {
        if (res.data) {
          const data = res?.data?.project?.sboms
          const filtered = [...data].filter((item) => item.id !== currentSbomId)
          if (filtered.length > 0) {
            setUniqVersions(filtered)
            setSelectedVersion('')
            setSbomId('')
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
            {/* PROJECT GROUPS */}
            {data?.organization?.projectGroups?.nodes?.length > 0 && (
              <FormControl fontSize={'sm'}>
                <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                  Product
                </FormLabel>
                <Select
                  name='groups'
                  id='groups'
                  value={selectedGroup}
                  onChange={handleSelectGroup}
                >
                  <option value={''}>-- Select --</option>
                  {data?.organization?.projectGroups?.nodes?.map(
                    (item, index) => (
                      <option key={index} value={item.id}>
                        {item.name}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
            )}
            {/* ENVIRONMENT */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' fontSize='md' color='gray.600'>
                Environment
              </FormLabel>
              <Select
                name='product'
                id='product'
                value={selectedProd}
                onChange={handleSelectProduct}
                textTransform={isDefaultEnv(envName) ? 'capitalize' : 'none'}
              >
                <option value={''}>-- Select --</option>
                {productList?.length > 0 &&
                  envOrderList(productList).map((item, index) => (
                    <option
                      key={index}
                      value={item.value}
                      style={{
                        textTransform: isDefaultEnv(item.label)
                          ? 'capitalize'
                          : 'none'
                      }}
                    >
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
                      {normalizeSBOMVersion(item)}
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
