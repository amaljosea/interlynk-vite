import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { capitalizeFirstLetter } from 'utils'
import { infoData } from 'variables/general'

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
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import InfoModal from 'components/InfoModal'
import LynkSelect from 'components/LynkSelect'
import Info from 'components/Misc/Info'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { GetJiraProjects } from 'graphQL/Queries'

const Settings = ({ enabled, data, mfc }) => {
  const { orgView } = useGlobalQueryContext()

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
    skip: !orgView,
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

  const { showToast } = useCustomToast()
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

  const editControls = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_settings'
  })

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
      .then((res) => res.data)
      .finally(() => {
        showToast({
          description: `${capitalizeFirstLetter(field)} updated successfully`,
          status: 'success'
        })
      })
  }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    setInfoHeading(result?.title)
    setInfoText(result?.desc)
    setInfoUrl('')
    onInfoOpen()
  }

  const onCheckVulnScan = () => onCheck(`Vulnerability Scan`)
  const onCheckVulnStatus = () => onCheck(`Retain Vulnerability Status`)
  const onCheckHealth = () => onCheck(`Checks`)
  const onCheckAutomation = () => onCheck(`Automation`)
  const onCheckComponent = () => onCheck(`Internal Component Labeling`)
  const onCheckRetaintion = () => onCheck(`Data Retaintion`)
  const onCheckMfc = () => onCheck(`Manufacturer`)
  const onCheckJira = () => onCheck(`Jira Default Project`)

  return (
    <>
      <CardBody py={4}>
        <Grid width={'100%'} templateColumns='repeat(2, 1fr)' gap={6}>
          {/* LEFT */}
          <GridItem w='100%'>
            <VStack spacing={4} alignItems={'flex-start'}>
              {/* VULN SCAN */}
              <Flex align='center'>
                <LynkSwitch
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
                  <Info ml={2} onClick={onCheckVulnScan} />
                </Text>
              </Flex>
              {/* COPY VEX FROM PREVIOUS */}
              <Flex align='center'>
                <LynkSwitch
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
                  <Info ml={2} onClick={onCheckVulnStatus} />
                </Text>
              </Flex>
              {/* APPLY CHECK */}
              <Flex align='center'>
                <LynkSwitch
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
                  <Info ml={2} onClick={onCheckHealth} />
                </Text>
              </Flex>
              {/* APPLY AUTOMATION */}
              <Flex align='center'>
                <LynkSwitch
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
                  <Info ml={2} onClick={onCheckAutomation} />
                </Text>
              </Flex>
              {/* APPLY INTERNAL COMPONENTS */}
              <Flex align='center'>
                <LynkSwitch
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
                  <Info ml={2} onClick={onCheckComponent} />
                </Text>
              </Flex>
            </VStack>
          </GridItem>
          {/* RIGHT */}
          <GridItem w='100%'>
            <FormControl>
              <FormLabel>
                Retain Data For
                <Info ml={2} onClick={onCheckRetaintion} />
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
                    {item !== 0 && item} {item === 0 ? 'Forever' : 'Days'}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>
                Manufacturer
                <Info ml={2} onClick={onCheckMfc} />
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
                <Info ml={2} onClick={onCheckJira} />
              </FormLabel>
              <LynkSelect
                options={projects}
                placeholder='Project'
                isDisabled={!editControls}
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
