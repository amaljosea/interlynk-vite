//User in Compare under tools and also compare in toolsDrawer from versionsTable
import AsyncSelect from 'react-select/async'
import { capitalizeFirstLetter, envOrderList, truncatedValue } from 'utils'

import {
  Button,
  Flex,
  GridItem,
  Heading,
  IconButton,
  Stack,
  Tag
} from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import LynkAlert from 'components/LynkAlert'
import LynkSelect from 'components/LynkSelect'
import SbomInfo from 'components/SbomInfo'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuGitCompare, LuX } from 'react-icons/lu'

const SbomCompare = ({
  isSbomOne,
  selectedVersion,
  projectGrpLoading,
  onVersionChange,
  selectedSboms,
  uniqueVersions,
  sbomInfo,
  selectedGroup,
  selectedProd,
  onClear,
  onSelectGroup,
  loading,
  onSelectProduct,
  productList,
  compareButtonProps = {},
  isToolsDrawer,
  lazyDropDownProps
}) => {
  const {
    firstSbomInfo,
    secondSbomInfo,
    handleCompare,
    selectedVersionOne,
    selectedVersionTwo,
    disabled
  } = compareButtonProps

  const { primaryTextColor, secondaryGreenBorder, secondaryRedBorder } =
    useThemeColor([
      'primaryTextColor',
      'secondaryGreenBorder',
      'secondaryRedBorder'
    ])

  const envOptions =
    productList?.length > 0
      ? envOrderList(productList).map((item) => ({
          label: capitalizeFirstLetter(item.label),
          value: item.value
        }))
      : []

  const LoadingSkeleton = (
    <Skeleton height='40px' width='100%' borderRadius='md' />
  )

  const NoVersionAlert = <LynkAlert msg='No version available' />

  const NoEnvironmentAlert = (
    <LynkAlert status='info' msg='No Environment selected' />
  )

  if (projectGrpLoading) {
    return (
      <Card>
        <SkeletonCircle size='10' />
        <SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='4' />
      </Card>
    )
  }

  const cardBorder = isSbomOne ? secondaryGreenBorder : secondaryRedBorder

  const isDisabled = isSbomOne
    ? selectedSboms?.length > 0
    : selectedVersionOne === null

  const disableVersionField =
    selectedProd === '' ||
    (selectedProd !== '' && uniqueVersions?.length === 0) ||
    (isSbomOne && selectedSboms?.length > 0)

  const VersionSelect = (
    <LynkSelect
      isSearchable
      value={selectedVersion?.label}
      name={isSbomOne ? 'versionOne' : 'versionTwo'}
      aria-label={isSbomOne ? 'versionOne' : 'versionTwo'}
      onChange={(value) => onVersionChange(value)}
      placeholder={selectedVersion?.label || '--Select--'}
      isDisabled={disableVersionField}
      options={uniqueVersions}
      dropDown={true}
    />
  )

  return (
    <GridItem w='100%'>
      <Card
        p={8}
        h='450px'
        width='100%'
        overflowY='scroll'
        border={`1px solid ${cardBorder}`}
      >
        <Flex
          alignItems={'flex-start'}
          flexWrap={'wrap'}
          justifyContent={'space-between'}
        >
          {sbomInfo ? (
            <Stack>
              <Heading fontWeight={'semibold'} size='md'>
                {truncatedValue(sbomInfo?.project?.projectGroup?.name, 20)} :{' '}
                {truncatedValue(sbomInfo?.projectVersion, 20)}
              </Heading>
              <Tag
                variant='solid'
                w={'fit-content'}
                textTransform={'capitalize'}
                colorScheme={isSbomOne ? 'green' : 'red'}
              >
                {sbomInfo?.project?.name}
              </Tag>
            </Stack>
          ) : (
            <Heading fontWeight={'semibold'} size='md'>
              {isSbomOne ? ' Select First SBOM' : 'Select Second SBOM'}
            </Heading>
          )}
          {sbomInfo && !selectedSboms && !isToolsDrawer && (
            <IconButton
              icon={<LuX size={18} color={primaryTextColor} />}
              size='sm'
              onClick={onClear}
            />
          )}
        </Flex>
        {sbomInfo ? (
          <SbomInfo data={sbomInfo} />
        ) : (
          <Stack spacing={5} mt={6} height={'285px'}>
            {/* PROJECT GROUPS */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor={isSbomOne ? 'groupOne' : 'groupTwo'}>
                Product
              </FormLabel>
              <AsyncSelect
                {...{
                  ...lazyDropDownProps,
                  onChange: onSelectGroup,
                  value: null,
                  isDisabled: isDisabled,
                  id: isSbomOne ? 'groupOne' : 'groupTwo',
                  placeholder: selectedGroup?.name || '--Select--',
                  name: isSbomOne ? 'groupOne' : 'groupTwo',
                  'aria-label': isSbomOne ? 'groupOne' : 'groupTwo'
                }}
              />
            </FormControl>
            {/* ENVIRONMENT */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='productOne'>Environment</FormLabel>
              <LynkSelect
                name={isSbomOne ? 'productOne' : 'productTwo'}
                aria-label={isSbomOne ? 'productOne' : 'productTwo'}
                value={selectedProd?.label || null}
                onChange={onSelectProduct}
                placeholder={selectedProd?.label || '--Select--'}
                isDisabled={isDisabled}
                options={envOptions}
                dropDown={true}
              />
            </FormControl>
            {/* VERSION */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor={isSbomOne ? 'versionOne' : 'versionTwo'}>
                Version
              </FormLabel>
              {loading
                ? LoadingSkeleton
                : selectedProd?.value && uniqueVersions.length === 0
                  ? NoVersionAlert
                  : !selectedProd?.value
                    ? NoEnvironmentAlert
                    : VersionSelect}
            </FormControl>
          </Stack>
        )}
        {/*  COMPARE BUTTON */}
        {(!firstSbomInfo || !secondSbomInfo) &&
          !isSbomOne &&
          !isToolsDrawer && (
            <Flex justifyContent={'flex-end'}>
              <Button
                colorScheme='blue'
                fontWeight={'medium'}
                width={'fit-content'}
                leftIcon={<LuGitCompare size={18} />}
                onClick={handleCompare}
                isDisabled={
                  !selectedVersionOne || !selectedVersionTwo || disabled
                }
              >
                Compare
              </Button>
            </Flex>
          )}
      </Card>
    </GridItem>
  )
}

export default SbomCompare
