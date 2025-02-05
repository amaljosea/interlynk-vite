import { useLazyQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { capitalizeFirstLetter, envOrderList } from 'utils'
import LabelSelect from 'views/Dashboard/Analytics/Selects/LabelSelect'

import { Box, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'
import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useSelect } from 'hooks/useSelect'
import { useThemeColor } from 'hooks/useThemeColors'

import { GetProject, GetProjectGroups } from 'graphQL/Queries'

const StepOne = ({
  setSbomId,
  currentSbomId,
  currentProductId,
  selectedProd,
  setSelectedProd,
  selectedVersion,
  setSelectedVersion,
  uniqVersions,
  setUniqVersions,
  setSelectedGroupId
}) => {
  const { prodState } = useGlobalState()
  const { enabled, field, direction } = prodState

  const { headingTextColor } = useThemeColor(['headingTextColor'])

  const [label, setLabel] = useState(null)
  const { style } = useSelect('lynkSelect')
  const [selectedGroup, setSelectedGroup] = useState({})

  const handleSelectGroup = (item) => {
    setSelectedGroupId(item.id)
    setSelectedGroup(item)
    setSelectedVersion('')
    setSelectedProd('')
    setUniqVersions([])
  }

  const handleChange = (value) => {
    setLabel(value)
    setSelectedProd('')
    setSelectedVersion('')
    setSelectedGroup({})
  }

  const { lazyDropDownProps } = useLazyDropDown(GetProjectGroups, {
    selector: 'organization.projectGroups',
    variables: {
      labelIds: label ? [label?.value] : undefined,
      enabled: enabled === 'yes' ? true : enabled === 'no' ? false : undefined,
      field: field,
      direction: direction,
      first: 5
    },
    selectorForActualCount: 'organization.projectGroups',
    styles: style,
    selectedItem: selectedGroup.name ? selectedGroup.name : '--Select--',
    onChange: handleSelectGroup,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: CustomDropdownIndicator
    },
    optionLabel: 'name'
  })

  const { isLoading, nodes } = lazyDropDownProps

  useEffect(() => {
    if (selectedGroup?.id) {
      const currentProd = selectedGroup.projects.find(
        (item) => item.id === currentProductId
      )
      setSelectedProd(currentProd?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [getProduct, { loading }] = useLazyQuery(GetProject)

  const handleSelectProduct = (e) => {
    const value = e.value
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

  const noProjectsAlert = (
    <LynkAlert status='info' msg='No projects available' />
  )

  //Checks if any product is available after applying the labels
  const isProductAvailable = !(label !== null && nodes.length === 0)

  const productList =
    selectedGroup?.id &&
    selectedGroup.projects
      .filter((item) => item.enabled === true)
      .map((option) => ({
        value: option.id,
        label: option.name
      }))

  const envOptions =
    productList?.length > 0 &&
    envOrderList(productList).map((item) => {
      return {
        value: item.value,
        label: item.label ? capitalizeFirstLetter(item.label) : item.label
      }
    })

  const versionsOptions =
    uniqVersions &&
    uniqVersions.map((version) => {
      return {
        value: version.id,
        label: version.projectVersion
      }
    })

  const envLabel =
    selectedProd && envOptions
      ? envOptions.find((option) => option.value === selectedProd)?.label
      : '--Select--'

  const versionLabel =
    selectedVersion && versionsOptions
      ? versionsOptions.find((version) => version.value === selectedVersion)
          ?.label
      : '--Select--'

  const VersionSelect = (
    <LynkSelect
      id='vex_versions'
      name='versions'
      placeholder={versionLabel || '--Select--'}
      value={versionLabel}
      options={versionsOptions}
      onChange={(e) => {
        setSelectedVersion(e.value)
        setSbomId(e.value)
      }}
      isSearchable={false}
      isDisabled={!selectedGroup?.id}
      dropDown={true}
    />
  )
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
          <Heading fontWeight={'medium'} fontSize={24}>
            Select the source of Vulnerability Status.
          </Heading>
          <Text>
            This importer allows you to bring vulnerability status from a
            different product/version to this version. Select source product and
            version to get started
          </Text>
        </Stack>
        <Stack
          width={'350px'}
          mx={'auto'}
          spacing={4}
          direction={'column'}
          gap={2}
          mt={12}
        >
          {/* LABEL */}
          <LabelSelect
            value={label}
            onChange={(value) => handleChange(value)}
          />
          {/* PROJECT GROUPS */}
          {
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' color={headingTextColor}>
                Product
              </FormLabel>
              {isProductAvailable ? (
                <AsyncSelect
                  {...{
                    ...lazyDropDownProps,
                    isDisabled: isLoading,
                    value: null,
                    id: 'vex_groups'
                  }}
                />
              ) : (
                noProjectsAlert
              )}
            </FormControl>
          }
          {/* ENVIRONMENT */}
          {isProductAvailable && (
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='product' color={headingTextColor}>
                Environment
              </FormLabel>
              <LynkSelect
                id='vex_products'
                name='product'
                placeholder={envLabel || '--Select--'}
                value={'envLabel'}
                options={envOptions}
                onChange={handleSelectProduct}
                isSearchable={false}
                isDisabled={!selectedGroup?.id}
                dropDown={true}
              />
            </FormControl>
          )}

          {/* Version */}
          {isProductAvailable && (
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='versions' color={headingTextColor}>
                Version
              </FormLabel>
              {loading
                ? LoadingSkeleton
                : uniqVersions.length === 0 && selectedProd && selectedGroup?.id
                  ? NoVersionAlert
                  : VersionSelect}
            </FormControl>
          )}
        </Stack>
      </Box>
    </>
  )
}

export default StepOne
