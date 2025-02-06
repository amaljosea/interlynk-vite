import React, { useEffect } from 'react'
import SbomCompare from 'views/Dashboard/Tools/SbomCompare'

import { Grid, SimpleGrid, Stack } from '@chakra-ui/react'
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
import DiffTable from 'components/Tables/DiffTable'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useSbomCompare } from 'hooks/useSbomCompare'

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

  const showToast = useCustomToast()

  //Close the drawer if the sbomOne or sbomTwo is not retrieved from useSbomCompare
  useEffect(() => {
    if (sbomOne === null || sbomTwo === null) {
      onClose()
      showToast({
        description: 'An error occured. Please try later',
        status: 'error'
      })
    }
  }, [sbomOne, sbomTwo, onClose, showToast])

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
                <SbomCompare
                  isSbomOne={true}
                  sbomInfo={sbomOne}
                  isToolsDrawer={true}
                />
                {/* SBOM TWO */}
                <SbomCompare
                  isSbomOne={false}
                  sbomInfo={sbomTwo}
                  isToolsDrawer={true}
                />
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
