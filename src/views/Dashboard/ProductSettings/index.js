import { useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { capitalizeFirstLetter } from 'utils'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Text,
  VStack,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import InfoModal from 'components/InfoModal'
import LynkSelect from 'components/LynkSelect'

import { useGlobalState } from 'hooks/useGlobalState'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { GetJiraProjects } from 'graphQL/Queries'

const Settings = ({ enabled, data, refetch, mfc }) => {
  const org = localStorage.getItem('organization')

  const {
    id,
    dataRetentionDays,
    jiraProject,
    checksEnabled,
    organizationManufacturer,
    automatedFixesEnabled,
    internalCompMatchingEnabled,
    copyVexFromPrevious,
    vulnScanningEnabled
  } = data || ''

  const { data: projectOptions } = useQuery(GetJiraProjects, {
    skip: org ? false : true,
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (projectOptions) {
      setProjects(
        projectOptions.jira?.projects?.map((project) => ({
          value: project.key,
          label: project.name
        }))
      )
    }
  }, [projectOptions])

  const toast = useToast()
  const { userPermissions } = useGlobalState()
  const [checks, setChecks] = useState(false)
  const [internalComp, setInternalComp] = useState(false)
  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')
  const [projects, setProjects] = useState([])

  const {
    isOpen: isInfoOpen,
    onOpen: onInfoOpen,
    onClose: onInfoClose
  } = useDisclosure()

  const product = userPermissions?.find((item) => item.key === 'view_product')
  const editControls = product?.supersededBy?.some(
    (permission) =>
      permission.key === 'update_product_settings' && permission.value === true
  )
  const con = userPermissions?.find((item) => item.key === 'view_connections')
  const updateCon = con?.supersededBy?.some(
    (permission) =>
      permission.key === 'create_update_connection' && permission.value === true
  )

  const [updateSettings] = useMutation(ProjectSettingUpdate)

  const { isOpen: isChecksOpen, onClose: onChecksClose } = useDisclosure()

  const { isOpen: isCompOpen, onClose: onCompClose } = useDisclosure()

  const onUpdate = async (value, field) => {
    await updateSettings({
      variables: {
        id,
        checks: field === 'checks' ? value : undefined,
        intcomp: field === 'internalComp' ? value : undefined,
        autofix: field === 'automation' ? value : undefined,
        vulnscan: field === 'vulnScan' ? value : undefined,
        copyVexFromPrevious:
          field === 'copyVexFromPrevious' ? value : undefined,
        days: field === 'dataRetention' ? Number(value) : undefined,
        mfcId: field === 'manufacturer' ? value : undefined,
        jiraProject: field === 'jira' ? value : undefined
      }
    })
      .then((res) => res.data && refetch())
      .finally(() => {
        toast({
          description: `${capitalizeFirstLetter(field)} updated successfully`,
          position: 'top',
          status: 'success',
          duration: 3000
        })
      })
  }

  const onCheckVulnScan = useCallback(() => {
    setInfoHeading(`Vulnerability Scan`)
    setInfoText(
      `This setting lets you turn on or off vulnerability scanning for your system. It's best to keep this turned on.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckVulnStatus = useCallback(() => {
    setInfoHeading(`Retain Vulnerability Status`)
    setInfoText(
      `This settings lets you turn on or off copying of vulnerability status, when an sbom is imported, whose version matches an existing one.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckHealth = useCallback(() => {
    setInfoHeading(`Checks`)
    setInfoText(
      `This setting lets you decide whether to turn on or off SBOM checks when importing. These checks help you find any issues with the SBOMs you're bringing in.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckAutomation = useCallback(() => {
    setInfoHeading(`Automation`)
    setInfoText(
      `This setting decides whether the automation rules set up for the environment should run when importing SBOMs.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckComponent = useCallback(() => {
    setInfoHeading(`Internal Component Labeling`)
    setInfoText(
      `This setting lets you choose whether components are marked as internal when you import an SBOM.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckRetaintion = useCallback(() => {
    setInfoHeading(`Data Retaintion`)
    setInfoText(
      `This setting lets you choose how long the SBOM data is kept before it's deleted. Once it's gone, you can't get it back.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckMfc = useCallback(() => {
    setInfoHeading(`Manufacturer`)
    setInfoText(
      `This setting allows you to select a manufacturer as the default for the environment. When sboms are exported, this is used to set the manufacturer.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

  const onCheckJira = useCallback(() => {
    setInfoHeading(`Jira Default Project`)
    setInfoText(
      `This setting allows you to select a default Jira project. Please configure Jira in the Organizarion settings.`
    )
    setInfoUrl(``)
    onInfoOpen()
  }, [onInfoOpen])

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
                  isChecked={vulnScanningEnabled || false}
                  onChange={(e) => onUpdate(e.target.checked, 'vulnScan')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Vulnerability Scan
                  <InfoIcon
                    ml={2}
                    color={'blue.500'}
                    cursor={'pointer'}
                    onClick={onCheckVulnScan}
                  />
                </Text>
              </Flex>
              {/* COPY VEX FROM PREVIOUS */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='copyVexFromPrevious'
                  isChecked={copyVexFromPrevious || false}
                  onChange={(e) =>
                    onUpdate(e.target.checked, 'copyVexFromPrevious')
                  }
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Retain Vulnerability Status
                  <InfoIcon
                    ml={2}
                    color={'blue.500'}
                    cursor={'pointer'}
                    onClick={onCheckVulnStatus}
                  />
                </Text>
              </Flex>
              {/* APPLY CHECK */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='checks'
                  isChecked={checksEnabled || false}
                  onChange={(e) => onUpdate(e.target.checked, 'checks')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Checks
                  <InfoIcon
                    ml={2}
                    color={'blue.500'}
                    cursor={'pointer'}
                    onClick={onCheckHealth}
                  />
                </Text>
              </Flex>
              {/* APPLY AUTOMATION */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='automation'
                  isChecked={automatedFixesEnabled || false}
                  onChange={(e) => onUpdate(e.target.checked, 'automation')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Automation
                  <InfoIcon
                    ml={2}
                    color={'blue.500'}
                    cursor={'pointer'}
                    onClick={onCheckAutomation}
                  />
                </Text>
              </Flex>
              {/* APPLY INTERNAL COMPONENTS */}
              <Flex align='center'>
                <Switch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='internalComp'
                  isChecked={internalCompMatchingEnabled || false}
                  onChange={(e) => onUpdate(e.target.checked, 'internalComp')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color='gray.500' fontWeight='400'>
                  Internal Component Labeling
                  <InfoIcon
                    ml={2}
                    color={'blue.500'}
                    cursor={'pointer'}
                    onClick={onCheckComponent}
                  />
                </Text>
              </Flex>
            </VStack>
          </GridItem>
          {/* RIGHT */}
          <GridItem w='100%'>
            <FormControl>
              <FormLabel>
                Retain Data For
                <InfoIcon
                  ml={2}
                  color={'blue.500'}
                  cursor={'pointer'}
                  onClick={onCheckRetaintion}
                />
              </FormLabel>
              <Select
                width={'400px'}
                id='dataRetention'
                value={Number(dataRetentionDays) || 0}
                onChange={(e) => onUpdate(e.target.value, 'dataRetention')}
                isDisabled={!enabled || !editControls}
              >
                {[1, 30, 90, 365, 0].map((item, index) => (
                  <option key={index} value={item}>
                    {item !== 0 && item}{' '}
                    {item === 365 ? 'Year' : item === 0 ? 'Forever' : 'Days'}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>
                Manufacturer
                <InfoIcon
                  ml={2}
                  color={'blue.500'}
                  cursor={'pointer'}
                  onClick={onCheckMfc}
                />
              </FormLabel>
              <Select
                width={'400px'}
                value={organizationManufacturer?.id || ''}
                onChange={(e) => onUpdate(e.target.value, 'manufacturer')}
                isDisabled={!enabled || !editControls}
              >
                <option value={''}>-- Select --</option>
                {mfc?.nodes?.map((item, index) => (
                  <option key={index} value={item?.id}>
                    {item?.organizationName}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4} width={'400px'}>
              <FormLabel>
                Jira Default Project
                <InfoIcon
                  ml={2}
                  color={'blue.500'}
                  cursor={'pointer'}
                  onClick={onCheckJira}
                />
              </FormLabel>
              <LynkSelect
                options={projects}
                placeholder='Project'
                isDisabled={!updateCon}
                onChange={(e) => onUpdate(e.value, 'jira')}
                value={{ value: jiraProject || '', label: jiraProject || '' }}
              />
            </FormControl>
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

      {/* INFO MODAL */}
      {isInfoOpen && (
        <InfoModal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          heading={infoHeading}
          body={infoText}
          url={infoUrl}
        />
      )}
    </>
  )
}

export default Settings
