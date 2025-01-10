import { Flex, Heading, SimpleGrid, Stack, Tag } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CustomLoader from 'components/CustomLoader'
import SbomInfo from 'components/SbomInfo'
import DiffTable from 'components/Tables/DiffTable'

import { useGlobalState } from 'hooks/useGlobalState'
import { useSbomCompare } from 'hooks/useSbomCompare'
import { useThemeColor } from 'hooks/useThemeColors'

const Loader = () => {
  return (
    <Stack spacing={6}>
      <SimpleGrid columns={2} gap={4}>
        <Card>
          <CustomLoader />
        </Card>
        <Card>
          <CustomLoader />
        </Card>
      </SimpleGrid>
      <Card>
        <CustomLoader />
      </Card>
    </Stack>
  )
}

const ToolsDrawer = ({ sbomIdOne, sbomIdTwo, onClose }) => {
  const { clearSelect, setClearSelect, setSelectedSbom } = useGlobalState()
  const { sbomOne, sbomTwo, isLoading, diffs } = useSbomCompare({
    sbomIdOne,
    sbomIdTwo
  })

  const { primaryTextColor, secondaryRedBorder, secondaryGreenBorder } =
    useThemeColor([
      'primaryTextColor',
      'secondaryRedBorder',
      'secondaryGreenBorder'
    ])

  const handleClear = () => {
    setSelectedSbom([])
    setClearSelect(!clearSelect)
  }

  return (
    <Drawer size='full' isOpen={true} placement='bottom' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} onClick={handleClear} />
        <DrawerHeader>SBOM Comparison</DrawerHeader>
        <DrawerBody>
          {isLoading ? (
            <Loader />
          ) : (
            <Stack dir='column'>
              {/* SBOM INFO */}
              <Grid templateColumns='repeat(2, 1fr)' gap={6} mb={12}>
                {/* SBOM ONE */}
                <GridItem w='100%'>
                  <Card
                    width='100%'
                    bg={secondaryGreenBorder}
                    px={6}
                    h='450px'
                    overflowY='scroll'
                  >
                    {sbomOne && (
                      <Flex width={'100%'} flexDirection={'column'}>
                        {/* HEADIING */}
                        <Stack>
                          <Flex alignItems={'flex-end'} gap={1}>
                            <Heading
                              fontWeight={'semibold'}
                              color={primaryTextColor}
                              fontFamily={'inherit'}
                              size='md'
                            >
                              {sbomOne?.project?.projectGroup?.name} :{' '}
                              {sbomOne?.projectVersion}
                            </Heading>
                          </Flex>
                          <Tag
                            variant='solid'
                            colorScheme='green'
                            width={'fit-content'}
                            textTransform={'capitalize'}
                          >
                            {sbomOne?.project?.name}
                          </Tag>
                        </Stack>
                        {/* DETAILS */}
                        <SbomInfo data={sbomOne} />
                      </Flex>
                    )}
                  </Card>
                </GridItem>
                {/* SBOM TWO */}
                <GridItem w='100%'>
                  <Card
                    bg={secondaryRedBorder}
                    px={6}
                    h='450px'
                    overflowY='scroll'
                  >
                    {sbomTwo && (
                      <Flex
                        width='100%'
                        flexWrap={'wrap'}
                        flexDirection={'column'}
                      >
                        {/* HEADIING */}
                        <Stack>
                          <Heading
                            fontWeight={'semibold'}
                            color={primaryTextColor}
                            fontFamily={'inherit'}
                            size='md'
                          >
                            {sbomTwo?.project?.projectGroup?.name} :{' '}
                            {sbomTwo?.projectVersion}
                          </Heading>
                          <Tag
                            variant='solid'
                            colorScheme='red'
                            width={'fit-content'}
                            textTransform={'capitalize'}
                          >
                            {sbomTwo?.project?.name}
                          </Tag>
                        </Stack>
                        {/* DETAILS */}
                        <SbomInfo data={sbomTwo} />
                      </Flex>
                    )}
                  </Card>
                </GridItem>
              </Grid>
              {/* SBOM DIFFERENCE */}
              <DiffTable
                diffs={diffs}
                isLoading={isLoading}
                sbomOne={sbomOne}
                sbomTwo={sbomTwo}
              />
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ToolsDrawer
