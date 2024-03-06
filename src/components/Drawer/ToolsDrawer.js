import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Grid,
  GridItem,
  Heading,
  Flex,
  Stack,
  Tag,
  Badge
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import SbomInfo from 'components/SbomInfo'
import DiffTable from 'components/Tables/DiffTable'
import { useGlobalState } from 'hooks/useGlobalState'
import React from 'react'

const ToolsDrawer = ({ data, diffs, setData, selectedSbom, versionList, isOpen, onClose }) => {
  const  {setClearSelect, setSelectedSbom} = useGlobalState()
  const versionsOne = versionList?.nodes?.find((item) => item?.id === selectedSbom[1]?.id)
  const versionsTwo = versionList?.nodes?.find((item) => item?.id === selectedSbom[0]?.id)

  const handleClose = () => {
    setClearSelect(true)
    setSelectedSbom([])
  }

  return (
    <Drawer size='full' isOpen={isOpen} placement='bottom' onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton mt={2} onClick={handleClose} />
        <DrawerHeader>SBOM Comparison</DrawerHeader>
        <DrawerBody>
          {/* SBOM INFO */}
          <Grid templateColumns='repeat(2, 1fr)' gap={6}>
            {/* SBOM ONE */}
            <GridItem w='100%'>
              <Card px={4} h='450px' overflowY='scroll'>
                {versionsOne && (
                  <Flex alignItems={'flex-start'} flexWrap={'wrap'} flexDirection={'column'}>
                    {/* HEADIING */}
                    <Stack>
                      <Flex alignItems={'flex-end'} gap={1}>
                        <Heading fontWeight={'semibold'} color={'#333'} fontFamily={'inherit'} size='md'>
                          {versionsOne?.project?.projectGroup?.name} :{' '}
                          {versionsOne?.projectVersion}
                        </Heading>
                        <Badge px={1} width={'fit-content'}>
                          Primary
                        </Badge>
                      </Flex>
                      <Tag colorScheme='blue' width={'fit-content'} textTransform={'capitalize'}>
                        {versionsOne?.project?.name}
                      </Tag>
                    </Stack>
                    {/* DETAILS */}
                    <SbomInfo data={versionsOne} />
                  </Flex>
                )}
              </Card>
            </GridItem>
            {/* SBOM TWO */}
            <GridItem w='100%'>
              <Card px={4} h='450px' overflowY='scroll'>
                {versionsTwo && (
                  <Flex alignItems={'flex-start'} flexWrap={'wrap'} flexDirection={'column'}>
                    {/* HEADIING */}
                    <Stack>
                      <Heading fontWeight={'semibold'} color={'#333'} fontFamily={'inherit'} size='md'>
                        {versionsTwo?.project?.projectGroup?.name} :{' '}
                        {versionsTwo?.projectVersion}
                      </Heading>
                      <Tag colorScheme='blue' width={'fit-content'} textTransform={'capitalize'}>
                        {versionsTwo?.project?.name}
                      </Tag>
                    </Stack>
                    {/* DETAILS */}
                    <SbomInfo data={versionsTwo} />
                  </Flex>
                )}
              </Card>
            </GridItem>
          </Grid>
          {/* SBOM DIFFERENCE */}
          <DiffTable diffs={diffs} data={data} setData={setData} isLoading={diffs?.sbomDrift ? false : true} sbomOne={versionsOne} sbomTwo={versionsTwo}/>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ToolsDrawer
