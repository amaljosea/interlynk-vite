import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { getSettingsLabel } from 'utils'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import CardBody from 'components/Card/CardBody'
import JiraFields from 'components/JiraFields'
import LynkSelect from 'components/LynkSelect'
import LynkSwitch from 'components/Misc/LynkSwitch'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'
import { useHasPermission } from 'hooks/useHasPermission'
import { useThemeColor } from 'hooks/useThemeColors'

import { ProjectSettingUpdate } from 'graphQL/Mutation'

import ConfirmationModal from '../Products/components/ConfirmationModal'

const Settings = ({ enabled, data, mfc }) => {
  const { isFreeTier } = useGlobalQueryContext()

  const {
    id,
    dataRetentionDays,
    checksEnabled,
    organizationManufacturer,
    automatedFixesEnabled,
    enableAutoArchive,
    internalCompMatchingEnabled,
    copyVexFromPrevious,
    vulnScanningEnabled,
    enableSupportLevel,
    enableKeepPartsUpdated
  } = data || {}

  const { showToast } = useCustomToast()
  const [checks, setChecks] = useState(false)
  const [internalComp, setInternalComp] = useState(false)

  const { sameSecondaryText, primaryBlueText } = useThemeColor([
    'sameSecondaryText',
    'primaryBlueText'
  ])

  const editControls = useHasPermission({
    parentKey: 'view_product_group',
    childKey: 'edit_product_settings'
  })

  const [updateSettings] = useMutation(ProjectSettingUpdate, {
    refetchQueries: ['GetProjectSettings', 'GetProjectInfo']
  })

  const { isOpen: isChecksOpen, onClose: onChecksClose } = useDisclosure()

  const { isOpen: isCompOpen, onClose: onCompClose } = useDisclosure()

  const onUpdate = async (val, field) => {
    await updateSettings({
      variables: {
        id,
        checks: field === 'checks' ? val : undefined,
        intcomp: field === 'internalComp' ? val : undefined,
        autofix: field === 'automation' ? val : undefined,
        vulnscan: field === 'vulnScan' ? val : undefined,
        enableAutoArchive: field === 'autoArchive' ? val : undefined,
        copyVexFromPrevious: field === 'copyVexFromPrevious' ? val : undefined,
        mfcId: field === 'manufacturer' ? val : undefined,
        enableSupportLevel: field === 'enableSupportLevel' ? val : undefined,
        enableKeepPartsUpdated:
          field === 'enableKeepPartsUpdated' ? val : undefined,
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

  const ProductSetting = ({ id, label, value }) => {
    if (id === 'enableSupportLevel' && isFreeTier) return null
    return (
      <Flex gap={4} align='center' justifyContent={'space-between'}>
        <Flex align='center'>
          <Tooltip label={onCheck(`${label}`)}>
            <InfoIcon mr={2} fontSize={'sm'} color={primaryBlueText} />
          </Tooltip>
          <Text
            noOfLines={1}
            color={sameSecondaryText}
            fontSize={14}
            fontWeight='400'
          >
            {label}
          </Text>
        </Flex>
        <LynkSwitch
          id={id}
          size='md'
          me='10px'
          isChecked={value || false}
          isDisabled={!enabled || !editControls}
          onChange={(e) => onUpdate(e.target.checked, id)}
        />
      </Flex>
    )
  }

  const dataRetentionOptions = [1, 30, 90, 365, 0].map((item) => ({
    value: item,
    label: item === 0 ? 'Forever' : `${item} Days`
  }))

  const manufacturerOptions = [
    { value: '', label: '-- Select --' },
    ...(mfc?.nodes || []).map((item) => ({
      value: item?.id,
      label: item?.organizationName
    }))
  ]

  return (
    <>
      <CardBody py={4}>
        <SimpleGrid w={'100%'} columns={3} gap={[6, 12]}>
          {/* COLUMNS 1 */}
          <Stack spacing={5}>
            <Text fontSize={14} fontWeight={'semibold'}>
              Import Actions
            </Text>
            {/* APPLY CHECK */}
            <ProductSetting
              id={'checks'}
              value={checksEnabled}
              label={'Run SBOM Checks'}
            />
            {/* PARTS CHECK */}
            <ProductSetting
              id={'enableKeepPartsUpdated'}
              value={enableKeepPartsUpdated}
              label={'Always Use Latest Parts'}
            />
            {/* APPLY INTERNAL COMPONENTS */}
            <ProductSetting
              id={'internalComp'}
              label={'Run Internal Labeling'}
              value={internalCompMatchingEnabled}
            />
            {/* AUTO ARCHIVE */}
            <ProductSetting
              id={'autoArchive'}
              label={'Run Auto Archive'}
              value={enableAutoArchive}
            />
            {/* APPLY AUTOMATION */}
            <ProductSetting
              id={'automation'}
              value={automatedFixesEnabled}
              label={'Apply Automation Rules'}
            />
            {/* VULN SCAN */}
            <ProductSetting
              id={'vulnScan'}
              value={vulnScanningEnabled}
              label={'Run Vulnerability Scan'}
            />
            {/* COMPONENT SUPPORT ANALYSIS */}
            <ProductSetting
              id={'enableSupportLevel'}
              value={enableSupportLevel}
              label={'Run Component Support Analysis'}
            />
            {/* COPY VEX FROM PREVIOUS */}
            <ProductSetting
              id={'copyVexFromPrevious'}
              value={copyVexFromPrevious}
              label={'Retain Vulnerability Status with Version'}
            />
          </Stack>
          {/* COLUMN 2 */}
          <Stack spacing={4}>
            <Text fontSize={14} fontWeight={'semibold'}>
              Environment Defaults
            </Text>

            {/* DATE RENTATION */}
            <FormControl>
              <FormLabel>
                Retain Data For
                <Tooltip label={onCheck(`Data Retaintion`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <LynkSelect
                id='dataRetention'
                value={dataRetentionOptions.find(
                  (opt) => opt.value === Number(dataRetentionDays) || 0
                )}
                onChange={(selected) =>
                  onUpdate(selected?.value, 'dataRetention')
                }
                options={dataRetentionOptions}
                isDisabled={!enabled || !editControls}
                dropDown
              />
            </FormControl>
            {/* MANUFACTURER */}
            <FormControl>
              <FormLabel>
                Manufacturer
                <Tooltip label={onCheck(`Manufacturer`)}>
                  <InfoIcon ml={2} color={primaryBlueText} />
                </Tooltip>
              </FormLabel>
              <LynkSelect
                value={manufacturerOptions.find(
                  (opt) => opt.value === (organizationManufacturer?.id || '')
                )}
                onChange={(selected) =>
                  onUpdate(selected?.value, 'manufacturer')
                }
                options={manufacturerOptions}
                isDisabled={!enabled || !editControls}
                dropDown
                placeholder='Select manufacturer'
              />
            </FormControl>
          </Stack>
          {/* COLUMN 3 */}
          <JiraFields />
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
