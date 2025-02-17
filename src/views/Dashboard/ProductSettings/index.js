import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import LynkSelect from 'components/LynkSelect'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { ProjectSettingUpdate } from 'graphQL/Mutation'
import { GetJiraProjects } from 'graphQL/Queries'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const Settings = ({ enabled, data, mfc }) => {
  const activeTab = useQueryParam('tab')
  const { isFreeTier } = useGlobalQueryContext()

  const {
    id,
    dataRetentionDays,
    jiraProject,
    checksEnabled,
    organizationManufacturer,
    automatedFixesEnabled,
    internalCompMatchingEnabled,
    copyVexFromPrevious,
    vulnScanningEnabled,
    enableSupportLevel
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

  const getSettingsLabel = (type) => {
    switch (type) {
      case 'checks':
        return 'Checks'
      case 'internalComp':
        return 'Internal component labeling'
      case 'automation':
        return 'Automation'
      case 'vulnScan':
        return 'Vulnerability scan'
      case 'copyVexFromPrevious':
        return 'Retain vulnerability status'
      case 'manufacturer':
        return 'Manufacturer'
      case 'enableSupportLevel':
        return 'Component support analysis'
      case 'dataRetention':
        return 'Data Retaintion'
      case 'jira':
        return 'Default JIRA project'
    }
  }

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
        mfcId: field === 'manufacturer' ? val : undefined,
        enableSupportLevel: field === 'enableSupportLevel' ? val : undefined,
        jiraProject: field === 'jira' && val ? val?.value : undefined,
        days: field === 'dataRetention' ? Number(val) : undefined,
        pkgUpdateThreshold:
          field === 'pkgUpdateThreshold' ? Number(val) : undefined,
        repoUpdateThreshold:
          field === 'repoUpdateThreshold' ? Number(val) : undefined
      }
    })
      .then((res) => res.data)
      .finally(() => {
        showToast({
          description: `${getSettingsLabel(field)} updated successfully`,
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
        <SimpleGrid w={'100%'} columns={2} gap={6}>
          {/* COLUMNS 1 */}
          <Stack spacing={4}>
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
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
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
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
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
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
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
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
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
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
              </Tooltip>
            </Flex>
            {/* COMPONENT SUPPORT ANALYSIS */}
            <Flex align='center'>
              <LynkSwitch
                size='md'
                colorScheme='blue'
                me='10px'
                id='enableSupportLevel'
                isChecked={enableSupportLevel || false}
                onChange={(e) =>
                  onUpdate(e.target.checked, 'enableSupportLevel')
                }
                isDisabled={!enabled || !editControls}
              />
              <Text noOfLines={1} color={sameSecondaryText} fontWeight='400'>
                Component Support Analysis
              </Text>
              <Tooltip label={onCheck(`Component Support Analysis`)}>
                <InfoIcon ml={2} fontSize={'xs'} color={primaryBlueText} />
              </Tooltip>
            </Flex>
          </Stack>
          {/* COLUMN 2 */}
          <Stack spacing={4}>
            {/* DATE RENTATION */}
            <FormControl width={'400px'}>
              <FormLabel>
                Retain Data For
                <Tooltip label={onCheck(`Data Retaintion`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <Select
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
            {/* MANUFACTURER */}
            <FormControl width={'400px'}>
              <FormLabel>
                Manufacturer
                <Tooltip label={onCheck(`Manufacturer`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <Select
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
            {/* JIRE DEFAULT PROJECT */}
            <FormControl width={'400px'} hidden={isFreeTier}>
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
          </Stack>
        </SimpleGrid>
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
