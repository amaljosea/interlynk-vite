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
import { SkeletonCircle, SkeletonText } from '@chakra-ui/react'

import Card from 'components/Card/Card'
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

  const isDisabled = isSbomOne
    ? selectedSboms?.length > 0
    : selectedVersionOne === null

  const disableVersionField =
    selectedProd === '' ||
    (selectedProd !== '' && uniqueVersions.length === 0) ||
    (isSbomOne && selectedSboms?.length > 0)

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
                  fontSize={'sm'}
                  value={selectedGroup}
                  isDisabled={isDisabled}
                  onChange={onSelectGroup}
                  id={isSbomOne ? 'groupOne' : 'groupTwo'}
                  name={isSbomOne ? 'groupOne' : 'groupTwo'}
                >
                  <option value=''>-- Select --</option>
                  {data?.organization?.projectGroups?.nodes?.map(
                    (item, index) => (
                      <option key={index} value={item.id}>
                        {truncatedValue(item.name, 50)}
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
                fontSize={'sm'}
                value={selectedProd}
                isDisabled={isDisabled}
                onChange={onSelectProduct}
                textTransform={'capitalize'}
                id={isSbomOne ? 'productOne' : 'productTwo'}
                name={isSbomOne ? 'productOne' : 'productTwo'}
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
              <LynkSelect
                type='text'
                isSearchable
                name='versions'
                isLoading={loading}
                value={selectedVersion}
                options={uniqueVersions}
                placeholder='-- Select --'
                noOptionsMessage={() => null}
                isDisabled={disableVersionField}
                onChange={(value) => onVersionChange(value)}
                components={{
                  DropdownIndicator: () => null
                }}
              />
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
