import React from 'react'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  useColorModeValue
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import SbomInfo from 'components/SbomInfo'
import DiffTable from 'components/Tables/DiffTable'

import { useSbomCompare } from 'hooks/useSbomCompare'

const Loader = () => {
  return (
    <Stack width={'100%'} dir='column' spacing={6}>
      <SimpleGrid columns={2} spacing={6}>
        <Skeleton width={'100%'} height={64} />
        <Skeleton width={'100%'} height={64} />
      </SimpleGrid>
      <Skeleton width={'100%'} height={72} />
    </Stack>
  )
}

const ToolsDrawer = ({ sbomIdOne, sbomIdTwo, onClose }) => {
  const { sbomOne, sbomTwo, isLoading, diffs } = useSbomCompare({
    sbomIdOne,
    sbomIdTwo
  })

  const textColor = useColorModeValue('#1A202C', '#F7FAFC')
  const sbomOneColor = useColorModeValue('green.100', 'gray.800')
  const sbomTwoColor = useColorModeValue('red.100', 'gray.800')

  return (
    <Drawer size='full' isOpen={true} placement='bottom' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} />
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
                    bg={sbomOneColor}
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
                              color={textColor}
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
                  <Card bg={sbomTwoColor} px={6} h='450px' overflowY='scroll'>
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
                            color={textColor}
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
