import { useMutation } from '@apollo/client'
import {
  Switch,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Button,
  Grid,
  GridItem,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Select,
  useToast
} from '@chakra-ui/react'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { useGlobalState } from 'hooks/useGlobalState'
import { useState, useEffect } from 'react'

const Settings = ({ enabled, data, refetch }) => {
  const toast = useToast()
  const { userPermissons } = useGlobalState()
  const [dataRetentionDays, setDataRetentionDays] = useState(0)
  const [projectSettingId, setProjectSettingId] = useState(null)

  const product = userPermissons?.find((item) => item.key === 'view_product')
  const editControls = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'edit_product_controls' && permission.value === true
  )

  useEffect(() => {
    if (data) {
      setProjectSettingId(data?.id)
    }
  }, [data])

  useEffect(() => {
    if (data) {
      setDataRetentionDays(data?.dataRetentionDays)
    }
  }, [data])

  const [updateSettings] = useMutation(ProjectSettingUpdate)

  const {
    isOpen: isChecksOpen,
    onOpen: onChecksOpen,
    onClose: onChecksClose
  } = useDisclosure()

  const {
    isOpen: isCompOpen,
    onOpen: onCompOpen,
    onClose: onCompClose
  } = useDisclosure()

  const onUpdate = async (value, id) => {
    await updateSettings({
      variables: {
        id: projectSettingId,
        checks: id === 'checks' ? value : undefined,
        intcomp: id === 'internalComp' ? value : undefined,
        autofix: id === 'automation' ? value : undefined,
        vulnscan: id === 'vulnScan' ? value : undefined,
        days: id === 'dataRetention' ? value : undefined
      }
    })
      .then((res) => res.data && refetch({ id: id }))
      .finally(() =>
        toast({
          description: 'Retention updated successfully',
          position: 'top',
          status: 'success',
          duration: 3000
        })
      )
  }

  return (
    <>
      <CardBody py={4}>
        <Grid width={'100%'} templateColumns='repeat(2, 1fr)' gap={6}>
          {/* LEFT */}
          <GridItem w='100%'>
            <VStack spacing={4} alignItems={'flex-start'}>
              {/* VULN SCAN */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='vulnScan'
                  isChecked={data?.vulnScanningEnabled}
                  onChange={(e) => onUpdate(e.target.checked, 'vulnScan')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Vulnerability Scan
                </Text>
              </Flex>
              {/* APPLY CHECK */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='checks'
                  isChecked={data?.checksEnabled}
                  onChange={(e) => onUpdate(e.target.checked, 'checks')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Checks
                </Text>
              </Flex>
              {/* APPLY AUTOMATION */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='automation'
                  isChecked={data?.automatedFixesEnabled}
                  onChange={(e) => onUpdate(e.target.checked, 'automation')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Automation
                </Text>
              </Flex>
              {/* APPLY INTERNAL COMPONENTS */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='internalComp'
                  isChecked={data?.internalCompMatchingEnabled}
                  onChange={(e) => onUpdate(e.target.checked, 'internalComp')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Internal Component Labeling
                </Text>
              </Flex>
            </VStack>
          </GridItem>
          {/* RIGHT */}
          <GridItem w='100%'>
            <FormControl>
              <FormLabel>Retain Data For</FormLabel>
              <Select
                width={'400px'}
                id='dataRetention'
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(e.target.value)}
                isDisabled={!enabled || !editControls}
              >
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
                <option value={365}>1 Year</option>
                <option value={0}>Forever</option>
              </Select>
            </FormControl>
            {(enabled || editControls) && (
              <Button
                colorScheme='blue'
                variant='solid'
                mt={2}
                onClick={() =>
                  onUpdate(Number(dataRetentionDays), 'dataRetention')
                }
              >
                Update
              </Button>
            )}
          </GridItem>
        </Grid>
      </CardBody>

      {/* CHECKS */}
      {isChecksOpen && (
        <Modal isOpen={isChecksOpen} onClose={onChecksClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{checks ? 'Disable' : 'Enable'} Checks</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {checks ? 'Disabling' : 'Enabling'} this will{' '}
                {checks ? 'stop' : 'start'} SBOM checks applied to uploaded
                SBOMs
              </Text>
              <Text mt={8}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onChecksClose}>
                No
              </Button>
              <Button
                colorScheme={checks ? 'red' : 'green'}
                onClick={() => {
                  setChecks(!checks)
                  onChecksClose()
                }}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* INTERNAL COMPONENT */}
      {isCompOpen && (
        <Modal isOpen={isCompOpen} onClose={onCompClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {internalComp ? 'Disable' : 'Enable'} Component
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                {internalComp ? 'Disabling' : 'Enabling'} this check will{' '}
                {internalComp ? 'stop' : 'start'} marketing internal components
                to uploaded SBOMs
              </Text>
              <Text mt={8}>Are you sure you wish to continue?</Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onCompClose}>
                No
              </Button>
              <Button
                colorScheme={internalComp ? 'red' : 'green'}
                onClick={() => {
                  setInternalComp(!internalComp)
                  onCompClose()
                }}
              >
                Yes
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </>
  )
}

export default Settings
