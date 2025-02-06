//User in Compare under tools and also compare in toolsDrawer from versionsTable
import { envOrderList, truncatedValue } from 'utils'

import {
  Button,
  Flex,
  GridItem,
  Heading,
  IconButton,
  Select,
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

import { FaCodeCompare, FaX } from 'react-icons/fa6'

const SbomCompare = ({
  isSbomOne,
  data,
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
  isToolsDrawer
}) => {
  const {
    firstSbomInfo,
    secondSbomInfo,
    handleCompare,
    selectedVersionOne,
    selectedVersionTwo,
    disabled
  } = compareButtonProps

  const {
    primaryTextColor,
    secondaryGreenBorder,
    secondaryRedBorder,
    lightAndDarkBgColor
  } = useThemeColor([
    'primaryTextColor',
    'secondaryGreenBorder',
    'secondaryRedBorder',
    'lightAndDarkBgColor'
  ])

  const VersionSelect = (
    <LynkSelect
      components={{
        DropdownIndicator: () => null
      }}
      value={selectedVersion}
      onChange={(value) => onVersionChange(value)}
      isSearchable
      type='text'
      placeholder='Select versions'
      name='versions'
      isDisabled={isSbomOne && selectedSboms?.length > 0}
      options={uniqueVersions}
      noOptionsMessage={() => null}
    />
  )

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

  const cardBgColor = isToolsDrawer
    ? isSbomOne
      ? secondaryGreenBorder
      : secondaryRedBorder
    : lightAndDarkBgColor

  return (
    <GridItem w='100%'>
      <Card width='100%' p={8} h='450px' overflowY='scroll' bg={cardBgColor}>
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
              icon={<FaX color={primaryTextColor} />}
              size='sm'
              onClick={onClear}
            />
          )}
        </Flex>
        {sbomInfo ? (
          <SbomInfo data={sbomInfo} />
        ) : (
          <Stack
            spacing={4}
            direction={'column'}
            gap={2}
            mt={6}
            height={'285px'}
          >
            {/* PROJECT GROUPS */}
            {data?.organization?.projectGroups?.nodes?.length > 0 && (
              <FormControl fontSize={'sm'}>
                <FormLabel htmlFor='groupOne'>Product</FormLabel>
                <Select
                  name={isSbomOne ? 'groupOne' : 'groupTwo'}
                  id={isSbomOne ? 'groupOne' : 'groupTwo'}
                  isDisabled={
                    isSbomOne
                      ? selectedSboms?.length > 0
                      : selectedVersionOne === null
                  }
                  value={selectedGroup}
                  onChange={onSelectGroup}
                >
                  <option value=''>-- Select --</option>
                  {data?.organization?.projectGroups?.nodes?.map(
                    (item, index) => (
                      <option key={index} value={item.id}>
                        {truncatedValue(item.name, 20)}
                      </option>
                    )
                  )}
                </Select>
              </FormControl>
            )}
            {/* ENVIRONMENT */}
            <FormControl fontSize={'sm'}>
              <FormLabel htmlFor='productOne'>Environment</FormLabel>
              <Select
                name={isSbomOne ? 'productOne' : 'productTwo'}
                id={isSbomOne ? 'productOne' : 'productTwo'}
                isDisabled={
                  isSbomOne
                    ? selectedSboms?.length > 0
                    : selectedVersionOne === null
                }
                value={selectedProd}
                onChange={onSelectProduct}
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
            {/* VERSION */}
            <FormControl fontSize={'sm'}>
              <FormLabel
                htmlFor={isSbomOne ? 'versionOne' : 'versionTwo'}
                fontSize='md'
              >
                Version
              </FormLabel>
              {loading
                ? LoadingSkeleton
                : selectedProd !== '' && uniqueVersions.length === 0
                  ? NoVersionAlert
                  : selectedProd === ''
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
                width={'fit-content'}
                leftIcon={<FaCodeCompare />}
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
