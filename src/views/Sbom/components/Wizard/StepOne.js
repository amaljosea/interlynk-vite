import { useLazyQuery, useQuery } from '@apollo/client'
import { useEffect } from 'react'
import { envOrderList } from 'utils'

import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Text
} from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'

import { useGlobalState } from 'hooks/useGlobalState'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProject, GetProjectGroups } from 'graphQL/Queries'

const StepOne = ({
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
  const { headingTextColor } = useThemeColor(['headingTextColor'])
  const { data, loading: projectGrpLoading } = useQuery(GetProjectGroups, {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [getProduct, { loading }] = useLazyQuery(GetProject)

  const handleSelectGroup = (e) => {
    setUniqVersions([])
    setSelectedVersion('')
    setSelectedProd('')
    setSelectedGroup(e.target.value)
  }

  const handleSelectProduct = (e) => {
    const { value } = e.target
    setSelectedVersion('')
    setSelectedProd(value)
  }

  useEffect(() => {
    if (selectedProd !== '' && selectedVersion === '') {
      getProduct({ variables: { id: selectedProd } }).then((res) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProd])

  const LoadingSkeleton = (
    <Skeleton height='40px' width='100%' borderRadius='md' />
  )

  const NoVersionAlert = <LynkAlert status='info' msg='No version available' />

  const NoEnvironmentAlert = (
    <LynkAlert status='info' msg='No Environment selected' />
  )

  const VersionSelect = (
    <Select
      name='versions'
      id='versions'
      value={selectedVersion}
      onChange={(e) => {
        setSelectedVersion(e.target.value)
        setSbomId(e.target.value)
      }}
    >
      <option value=''>-- Select --</option>
      {uniqVersions?.map((item, index) => (
        <option key={index} value={item.id}>
          {item?.projectVersion}
        </option>
      ))}
    </Select>
  )

  if (projectGrpLoading) {
    return (
      <Flex alignItems={'center'} gap={2}>
        <Spinner />
        <Text>LOADING....</Text>
      </Flex>
    )
  }

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
                <FormLabel
                  htmlFor='product'
                  fontSize='md'
                  color={headingTextColor}
                >
                  Product
                </FormLabel>
                <Select
                  name='groups'
                  id='groups'
                  value={selectedGroup}
                  onChange={handleSelectGroup}
                >
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
              <FormLabel
                htmlFor='product'
                fontSize='md'
                color={headingTextColor}
              >
                Environment
              </FormLabel>
              <Select
                name='product'
                id='product'
                value={selectedProd}
                onChange={handleSelectProduct}
                textTransform={'capitalize'}
              >
                <option value={''}>-- Select --</option>
                {productList?.length > 0 &&
                  envOrderList(productList).map((item, index) => (
                    <option
                      key={index}
                      value={item.value}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {item.label}
                    </option>
                  ))}
              </Select>
            </FormControl>
            {/* Version */}
            <FormControl fontSize={'sm'}>
              <FormLabel
                htmlFor='versions'
                fontSize='md'
                color={headingTextColor}
              >
                Version
              </FormLabel>
              {loading
                ? LoadingSkeleton
                : uniqVersions?.length === 0 && selectedProd !== ''
                  ? NoVersionAlert
                  : selectedProd === ''
                    ? NoEnvironmentAlert
                    : VersionSelect}
            </FormControl>
          </Stack>
        )}
      </Box>
    </>
  )
}

export default StepOne
