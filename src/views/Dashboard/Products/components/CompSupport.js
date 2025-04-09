import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { getDate, getFullDate, getTotalDays, timeSince } from 'utils'
import { assessmentExpiryWarning } from 'variables/general'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormErrorMessage,
  IconButton,
  Input,
  Stack,
  Tag,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDate from 'components/LynkDate'
import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useRouteFlags } from 'hooks/useRouteFlags'
import { useThemeColor } from 'hooks/useThemeColors'

import {
  componentSupportLevelCreate,
  componentSupportLevelDelete,
  componentSupportLevelUpdate
} from 'graphQL/Mutation'
import { GetComponentSupportLevels } from 'graphQL/Queries'

const CompSupport = ({ data, isOpen, onClose }) => {
  const [edit, setEdit] = useState(false)

  const { data: supports, loading } = useQuery(GetComponentSupportLevels, {
    skip: isOpen ? false : true,
    variables: { id: data?.id, sbomId: data?.sbom?.id }
  })

  const Header = () => {
    if (!data) return null
    return (
      <Flex gap={2}>
        <CompInfo data={data} />
        {data?.internal && (
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
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack>
          {edit ? (
            <SupportForm
              setEdit={setEdit}
              handleClose={onClose}
              data={data}
              component={{
                id: data?.id,
                name: data?.name,
                internal: data?.internal
              }}
            />
          ) : (
            <SupportCard setEdit={setEdit} data={supports?.component} />
          )}
        </Stack>
      )}
    </LynkDrawer>
  )
}

const SupportCard = ({ setEdit, data }) => {
  const {
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data || {}

  const { sameSecondaryText, grayBorderColor } = useThemeColor([
    'sameSecondaryText',
    'grayBorderColor'
  ])

  const label = { fontSize: 12, color: sameSecondaryText }
  const infoStyle = {
    fontSize: 14
  }
  const container = {
    pb: 2,
    w: '100%',
    spacing: 0,
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const assessment = manual?.level ? 'Manual' : 'Automatic'
  const supportLevel = manual?.level || automatic?.level
  const endOfSupport = manual?.endDate
  const assessmentExpiresOn = manual?.retainManualOverrideFor
  const explanation = manual?.notes || automatic?.notes
  const assessedBy = manual?.user?.name
  const lastAssessed = manual?.updatedAt

  return (
    <Stack spacing={4} mt={3}>
      <Tooltip label='Edit'>
        <IconButton
          aria-label='Edit'
          icon={<EditIcon />}
          colorScheme='blue'
          variant='solid'
          fontSize={'sm'}
          alignSelf='end'
          onClick={() => setEdit(true)}
        />
      </Tooltip>
      <Stack spacing={3}>
        <Stack {...container}>
          <Text {...label}>Assessment</Text>
          <Text {...infoStyle}>{assessment}</Text>
        </Stack>
        <Stack {...container}>
          <Text {...label}>Support Level</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {supportLevel?.replaceAll('_', ' ') || 'N/A'}
          </Text>
        </Stack>
        <Stack {...container}>
          <Text {...label}>End of Support</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {endOfSupport ? new Date(endOfSupport).toLocaleDateString() : 'N/A'}
          </Text>
        </Stack>
        <Stack {...container} hidden={supportLevel === 'no_longer_maintained'}>
          <Text {...label}>Assessment Expires On</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {assessmentExpiresOn
              ? getDate(assessmentExpiresOn).toLocaleDateString()
              : 'N/A'}
          </Text>
        </Stack>
        <Stack {...container}>
          <Text {...label}>Explanation</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {explanation || 'N/A'}
          </Text>
        </Stack>
        <Stack {...container}>
          <Text {...label}>Last Assessed By</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {assessedBy || 'N/A'}
          </Text>
        </Stack>
        <Stack {...container}>
          <Text {...label}>Last Assessed</Text>
          {lastAssessed ? (
            <Tooltip label={getFullDate(lastAssessed)}>
              <Text {...infoStyle}>{timeSince(lastAssessed)}</Text>
            </Tooltip>
          ) : (
            <Text {...infoStyle}>{'N/A'}</Text>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}

const SupportForm = ({ component, data, setEdit, handleClose }) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 365)

  const {
    componentSupportLevel: manual,
    componentSupportLevelAutomatic: automatic
  } = data || {}

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
    (isAbandoned && !component?.internal && totalDays < 1) ||
    (isAbandoned && !component?.internal && totalDays > 365)

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
    componentSupportLevelCreate
  )
  const [updateSupport, { loading: updateLoading }] = useMutation(
    componentSupportLevelUpdate
  )
  const [deleteSupport, { loading: deleteLoading }] = useMutation(
    componentSupportLevelDelete
  )

  const handleDateChange = (newDate, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newDate ? newDate._d : ''
    }))
  }

  const handleUpdate = () => {
    updateSupport({
      variables: {
        id: manual?.id,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor: totalDays > 0 ? totalDays : 0,
        endDate: formData?.endOfSupport
          ? new Date(formData?.endOfSupport).toISOString()
          : undefined
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelUpdate || {}
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
      const { level, endDate, notes, retainManualOverrideFor } = manual || {}
      setFormData((prev) => ({
        ...prev,
        explanation: notes || automatic?.notes,
        supportLevel: level || automatic?.level,
        endOfSupport: endDate ? new Date(endDate) : '',
        assessmentExpiresOn: retainManualOverrideFor
          ? getDate(retainManualOverrideFor)
          : undefined
      }))
    }
  }, [automatic, manual])

  if (isOpen)
    return (
      <Stack spacing={4} mt={2}>
        <Text>{`You are about to delete the support : ${component?.name} from this component.`}</Text>
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
        isRequired={
          !component?.internal && formData?.supportLevel !== 'abandoned'
        }
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
          <IconButton
            onClick={onOpen}
            colorScheme='red'
            icon={<DeleteIcon />}
            title='Remove support'
          />
        )}
      </Flex>
    </Stack>
  )
}

export default CompSupport
