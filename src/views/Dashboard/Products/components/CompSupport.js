import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { formatDate, getDate, getTotalDays } from 'utils'
import { assessmentExpiryWarning } from 'variables/general'

import {
  Box,
  Flex,
  FormErrorMessage,
  Input,
  Stack,
  Tag,
  Text,
  useDisclosure
} from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import DeleteButton from 'components/Icons/DeleteButton'
import EditButton from 'components/Icons/EditButton'
import LynkDate from 'components/LynkDate'
import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  ComponentSupportLevelBulkUpdate,
  componentSupportLevelCreate,
  componentSupportLevelDelete
} from 'graphQL/Mutation'

const CompSupport = ({ data, reset, isOpen, onClose, enableSupportLevel }) => {
  const [edit, setEdit] = useState(false)
  const supports = data?.occurrences[0] || {}
  const { internal } = supports || {}

  const { primaryErrorColor } = useThemeColor(['primaryErrorColor'])

  const Header = () => {
    if (!supports) return null
    return (
      <Flex gap={2}>
        <CompInfo data={supports} />
        {internal && (
          <Tag w={'fit-content'} colorScheme='blue'>
            Internal
          </Tag>
        )}
      </Flex>
    )
  }

  return (
    <LynkDrawer
      noFooter
      isOpen={isOpen}
      onClose={onClose}
      subtitle={<Header />}
      title={'Edit Support Status'}
    >
      <Stack w={'100%'}>
        {edit ? (
          <SupportForm
            data={data}
            reset={reset}
            setEdit={setEdit}
            handleClose={onClose}
          />
        ) : (
          <Stack spacing={4} mt={3}>
            <Flex
              gap={2}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Box>
                {!enableSupportLevel && (
                  <Text fontSize={'sm'} color={primaryErrorColor}>
                    Component support level analysis is not enabled for this
                    product
                  </Text>
                )}
              </Box>
              <EditButton
                size={'md'}
                type={'primary'}
                aria-label='Edit'
                onClick={() => setEdit(true)}
              />
            </Flex>
            <SupportCard
              setEdit={setEdit}
              data={supports}
              enableSupportLevel={enableSupportLevel}
            />
          </Stack>
        )}
      </Stack>
    </LynkDrawer>
  )
}

const SupportCard = ({ data }) => {
  const {
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data || {}

  const { sameSecondaryText, grayBorderColor } = useThemeColor([
    'sameSecondaryText',
    'grayBorderColor'
  ])

  const labelStyle = { fontSize: 12, color: sameSecondaryText }
  const infoStyle = { fontSize: 14 }
  const containerStyle = {
    pb: 2,
    w: '100%',
    spacing: 0,
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const assessment = manual?.user ? 'Manual' : 'Automatic'
  const supportLevel = manual?.level || automatic?.level
  const explanation = manual?.notes || automatic?.notes
  const endOfSupport = formatDate(manual?.endDate)
  const assessmentExpiresOn =
    manual?.retainManualOverrideFor > 0
      ? formatDate(getDate(manual?.retainManualOverrideFor))
      : 'N/A'
  const assessedBy = manual?.user?.name || 'N/A'
  const lastAssessed = formatDate(manual?.updatedAt)

  return (
    <Stack spacing={3} mt={3}>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>Assessment</Text>
        <Text {...infoStyle}>{assessment}</Text>
      </Stack>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>{`Level`}</Text>
        <Text {...infoStyle} textTransform={'capitalize'}>
          {supportLevel?.replaceAll('_', ' ') || 'N/A'}
        </Text>
      </Stack>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>End of Support</Text>
        <Text {...infoStyle}>{endOfSupport}</Text>
      </Stack>
      <Stack
        {...containerStyle}
        hidden={supportLevel === 'no_longer_maintained'}
      >
        <Text {...labelStyle}>Assessment Expires On</Text>
        <Text {...infoStyle}>{assessmentExpiresOn}</Text>
      </Stack>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>{`Explanation`}</Text>
        <Text {...infoStyle}>{explanation}</Text>
      </Stack>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>Last Assessed By</Text>
        <Text {...infoStyle} textTransform={'capitalize'}>
          {assessedBy}
        </Text>
      </Stack>
      <Stack {...containerStyle}>
        <Text {...labelStyle}>Last Assessed</Text>
        <Text {...infoStyle}>{lastAssessed}</Text>
      </Stack>
      {manual?.user && (
        <Stack {...containerStyle}>
          <Text {...labelStyle}>{`Level (System)`}</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {automatic?.level?.replaceAll('_', ' ') || 'N/A'}
          </Text>
        </Stack>
      )}
      {manual?.user && (
        <Stack {...containerStyle}>
          <Text {...labelStyle}>{`Explanation (System)`}</Text>
          <Text {...infoStyle}>{automatic?.notes || 'N/A'}</Text>
        </Stack>
      )}
    </Stack>
  )
}

const SupportForm = ({ data, reset, setEdit, handleClose }) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const {
    name,
    internal,
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data?.occurrences[0] || {}

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 365)

  const { endDate, retainManualOverrideFor } = manual || {}

  const endOfSupport = endDate
  const assessmentExpiresOn =
    retainManualOverrideFor > 0 ? getDate(retainManualOverrideFor) : defaultDate
  const explanation = automatic?.notes || manual?.notes

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: defaultDate
  })

  const totalDays = Number(getTotalDays(formData?.assessmentExpiresOn))
  const isAbandoned = formData?.supportLevel !== 'abandoned'

  const isDisabled =
    formData?.supportLevel === '' ||
    (isAbandoned && !internal && totalDays < 1) ||
    (isAbandoned && !internal && totalDays > 365)

  const noLongerMaintained = formData?.supportLevel === 'no_longer_maintained'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelect = (selectedItem, name) => {
    const { value } = selectedItem
    const isUnspecified =
      name === 'supportLevel' && (value === 'unspecified' || noLongerMaintained)
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endOfSupport: endOfSupport || '',
        explanation: explanation || '',
        assessmentExpiresOn: assessmentExpiresOn
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        assessmentExpiresOn: assessmentExpiresOn
      }))
    }
  }

  const [createSupport, { loading: createLoading }] = useMutation(
    componentSupportLevelCreate,
    { onCompleted: () => reset() }
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    ComponentSupportLevelBulkUpdate,
    { onCompleted: () => reset() }
  )
  const [deleteSupport, { loading: deleteLoading }] = useMutation(
    componentSupportLevelDelete,
    { onCompleted: () => reset() }
  )

  const handleDateChange = (newDate, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newDate ? newDate._d : ''
    }))
  }

  const handleUpdate = () => {
    const ids = data?.occurrences?.map((item) => item?.id) || []
    updateSupport({
      variables: {
        ids: ids,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : 0,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelBulkUpdate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Status updated successfully',
            status: 'success'
          })
        }
      })
      .finally(() => handleClose(false))
  }
  const handleSubmit = () => {
    createSupport({
      variables: {
        id: data?.id,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : 0,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelCreate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Status updated successfully',
            status: 'success'
          })
        }
      })
      .finally(() => handleClose(false))
  }

  const handleRemove = () => {
    deleteSupport({ variables: { id: manual?.id } })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelDelete || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          setEdit(false)
          setFormData(() => ({
            explanation: '',
            assessedBy: '',
            supportLevel: '',
            endOfSupport: new Date(),
            assessmentExpiresOn: ''
          }))
        }
      })
      .finally(() => handleClose())
  }

  const inputStyle = { size: 'md' }

  const hasManualSupport = manual?.level

  useEffect(() => {
    if (automatic || manual) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 365)
      const { level, endDate, notes, retainManualOverrideFor } = manual || {}
      setFormData((prev) => ({
        ...prev,
        explanation: notes || automatic?.notes,
        supportLevel: level || automatic?.level,
        endOfSupport: endDate ? new Date(endDate) : '',
        assessmentExpiresOn: retainManualOverrideFor
          ? getDate(retainManualOverrideFor)
          : defaultDate
      }))
    }
  }, [automatic, manual])

  if (isOpen)
    return (
      <Stack spacing={4} mt={2}>
        <Text>{`You are about to delete the support : ${name} from this component.`}</Text>
        <Text fontWeight={500}>Are you sure you want to proceed?</Text>
        <ButtonGroup>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            colorScheme='red'
            onClick={handleRemove}
            isLoading={deleteLoading}
            loadingText='Deleting....'
          >
            Yes
          </Button>
        </ButtonGroup>
      </Stack>
    )

  const supportLevelOptions = [
    { value: '', label: '-- Select --' },
    { value: 'unspecified', label: 'Unspecified' },
    { value: 'actively_maintained', label: 'Actively Maintained' },
    { value: 'no_longer_maintained', label: 'No Longer Maintained' },
    { value: 'abandoned', label: 'Abandoned' }
  ]

  return (
    <Stack spacing={4} mt={2}>
      {/* SUPPRT LEVEL */}
      <FormControl>
        <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
        <LynkSelect
          name='supportLevel'
          value={
            supportLevelOptions.find(
              (opt) => opt.value === formData?.supportLevel
            ) || null
          }
          onChange={(selected) => handleSelect(selected, 'supportLevel')}
          options={supportLevelOptions}
          isDisabled={isCustomerView}
          dropDown
        />
      </FormControl>
      {/* END-OF-SUPPORT DATE */}
      {(formData?.supportLevel === 'actively_maintained' ||
        formData?.supportLevel === 'no_longer_maintained') && (
        <FormControl>
          <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
          <LynkDate
            name='endOfSupport'
            value={formData?.endOfSupport}
            onChange={(value) => handleDateChange(value, 'endOfSupport')}
          />
        </FormControl>
      )}
      {/* RETAIN MANNUAL OVERRIDE */}
      <FormControl
        hidden={noLongerMaintained}
        isRequired={!internal && formData?.supportLevel !== 'abandoned'}
        isInvalid={totalDays > 365}
      >
        <FormLabel htmlFor='assessmentExpiresOn'>
          Assessment Expires On
        </FormLabel>
        <LynkDate
          name='assessmentExpiresOn'
          value={formData?.assessmentExpiresOn}
          onChange={(value) => handleDateChange(value, 'assessmentExpiresOn')}
        />
        <FormErrorMessage>{assessmentExpiryWarning}</FormErrorMessage>
      </FormControl>
      {/* EXPLANATION */}
      <FormControl>
        <FormLabel htmlFor='explanation'>Explanation</FormLabel>
        <Input
          sx={inputStyle}
          name='explanation'
          value={formData?.explanation}
          placeholder='Enter explanation'
          onChange={handleChange}
        />
      </FormControl>
      {/* ACTIONS */}
      <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
        <ButtonGroup>
          <Button fontSize={'sm'} onClick={() => setEdit(false)}>
            Cancel
          </Button>
          <Button
            fontSize={'sm'}
            colorScheme='blue'
            isDisabled={isDisabled}
            loadingText='Saving...'
            isLoading={createLoading || updateLoading}
            onClick={hasManualSupport ? handleUpdate : handleSubmit}
          >
            {hasManualSupport ? 'Update' : 'Save'}
          </Button>
        </ButtonGroup>
        {hasManualSupport && (
          <DeleteButton
            onClick={onOpen}
            title='Remove support'
            variant={'solid'}
          />
        )}
      </Flex>
    </Stack>
  )
}

export default CompSupport
