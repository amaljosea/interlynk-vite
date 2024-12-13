import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { capitalizeFirstLetter } from 'utils'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  Select,
  Text,
  Tooltip,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import LynkSelect from 'components/LynkSelect'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { GetJiraProjects } from 'graphQL/Queries'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const Settings = ({ enabled, data, mfc }) => {
  const activeTab = useQueryParam('tab')
  const { organization } = useGlobalState()

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
    skip: activeTab !== 'settings'
  })

  useEffect(() => {
    if (projectOptions?.jira) {
      setOptions(
        projectOptions.jira?.projects?.map((project) => ({
          value: project.key,
          label: project.name
        }))
      )
    }
  }, [projectOptions])

  useEffect(() => {
    if (jiraProject) {
      setProject({ value: jiraProject, label: jiraProject })
    } else {
      setProject(null)
    }
  }, [jiraProject])

  const { showToast } = useCustomToast()
  const [checks, setChecks] = useState(false)
  const [internalComp, setInternalComp] = useState(false)
  const [options, setOptions] = useState([])
  const [project, setProject] = useState(null)

  const { sameSecondaryText, primaryBlueText } = useThemeColor([
    'sameSecondaryText',
    'primaryBlueText'
  ])

  const editControls = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'update_product_settings'
  })

  const [updateSettings] = useMutation(ProjectSettingUpdate)

  const { isOpen: isChecksOpen, onClose: onChecksClose } = useDisclosure()

  const { isOpen: isCompOpen, onClose: onCompClose } = useDisclosure()

  const onUpdate = async (val, field) => {
    if (field === 'jira') {
      setProject(val)
    }
    await updateSettings({
      variables: {
        id,
        checks: field === 'checks' ? val : undefined,
        intcomp: field === 'internalComp' ? val : undefined,
        autofix: field === 'automation' ? val : undefined,
        vulnscan: field === 'vulnScan' ? val : undefined,
        copyVexFromPrevious: field === 'copyVexFromPrevious' ? val : undefined,
        days: field === 'dataRetention' ? Number(val) : undefined,
        mfcId: field === 'manufacturer' ? val : undefined,
        jiraProject: field === 'jira' && val ? val?.value : undefined
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
    return result?.desc
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
                <LynkSwitch
                  size='md'
                  colorScheme='blue'
                  me='10px'
                  id='vulnScan'
                  isChecked={vulnScanningEnabled || false}
                  onChange={(e) => onUpdate(e.target.checked, 'vulnScan')}
                  isDisabled={!enabled || !editControls}
                />
                <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                  Vulnerability Scan
                </Text>
                <Tooltip label={onCheck(`Vulnerability Scan`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
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
                <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                  Retain Vulnerability Status
                </Text>
                <Tooltip label={onCheck(`Retain Vulnerability Status`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
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
                <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                  Checks
                </Text>
                <Tooltip label={onCheck(`Checks`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
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
                <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                  Automation
                </Text>
                <Tooltip label={onCheck(`Automation`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
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
                <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                  Internal Component Labeling
                </Text>
                <Tooltip label={onCheck(`Internal Component Labeling`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </Flex>
            </VStack>
          </GridItem>
          {/* RIGHT */}
          <GridItem w='100%'>
            <FormControl>
              <FormLabel>
                Retain Data For
                <Tooltip label={onCheck(`Data Retaintion`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <Select
                width={'400px'}
                id='dataRetention'
                fontSize={'sm'}
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
                <Tooltip label={onCheck(`Manufacturer`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <Select
                width={'400px'}
                fontSize={'sm'}
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
            <FormControl
              mt={4}
              width={'400px'}
              hidden={organization?.tier === 'free'}
            >
              <FormLabel>
                Jira Default Project
                <Tooltip label={onCheck(`Jira Default Project`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <LynkSelect
                options={options}
                isClearable={true}
                placeholder='Project'
                isDisabled={!editControls}
                onChange={(value) => onUpdate(value, 'jira')}
                value={project}
              />
            </FormControl>
          </GridItem>
        </Grid>
      </CardBody>

      {/* CHECKS */}
      {isChecksOpen && (
        <ConfirmationModal
          isOpen={isChecksOpen}
          onClose={onChecksClose}
          onConfirm={() => {
            setChecks(!checks)
            onChecksClose()
          }}
          title={`${checks ? 'Disable' : 'Enable'} Checks`}
          description={`${checks ? 'Disabling' : 'Enabling'} this will${' '}
                  ${checks ? 'stop' : 'start'} SBOM checks applied to uploaded
                  SBOMs`}
        />
      )}

      {/* INTERNAL COMPONENT */}
      {isCompOpen && (
        <ConfirmationModal
          isOpen={isCompOpen}
          onClose={onCompClose}
          onConfirm={() => {
            setInternalComp(!internalComp)
            onCompClose()
          }}
          title={`${internalComp ? 'Disable' : 'Enable'} Component`}
          description={`${internalComp ? 'Disabling' : 'Enabling'} this check will${' '}
                ${internalComp ? 'stop' : 'start'} marketing internal components
                to uploaded SBOMs`}
        />
      )}
    </>
  )
}

export default Settings
