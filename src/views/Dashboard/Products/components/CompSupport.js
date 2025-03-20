import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { calculateExpiryDate, getFullDate, timeSince } from 'utils'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  FormErrorMessage,
  IconButton,
  Select,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/react'
import { Input, InputGroup, InputRightAddon } from '@chakra-ui/react'
import { Button, ButtonGroup } from '@chakra-ui/react'
import { FormControl, FormLabel } from '@chakra-ui/react'
import { NumberInput, NumberInputField } from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkDate from 'components/LynkDate'
import LynkDrawer from 'components/LynkDrawer'
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

  const { componentSupportLevel } = supports?.component || {}

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
            <SupportCard setEdit={setEdit} data={componentSupportLevel} />
          )}
        </Stack>
      )}
    </LynkDrawer>
  )
}

const SupportCard = ({ setEdit, data }) => {
  const { level, updatedAt, user, endDate, retainManualOverrideFor, notes } =
    data || {}

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
    gap: 5,
    w: '100%',
    columns: 2,
    borderBottom: `1px solid ${grayBorderColor}`
  }

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
        <SimpleGrid {...container}>
          <Text {...label}>Assessment</Text>
          <Text {...infoStyle}>{user?.id ? 'Manual' : 'Automatic'}</Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Support Level</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {level?.replaceAll('_', ' ') || 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>End of Support</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container} hidden={level === 'no_longer_maintained'}>
          <Text {...label}>Assessment Expires On</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {retainManualOverrideFor
              ? calculateExpiryDate(retainManualOverrideFor)
              : 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Explanation</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {notes || 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Last Assessed By</Text>
          <Text {...infoStyle} textTransform={'capitalize'}>
            {user?.name || 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Last Assessed</Text>
          {updatedAt ? (
            <Tooltip label={getFullDate(updatedAt)}>
              <Text {...infoStyle}>{timeSince(updatedAt)}</Text>
            </Tooltip>
          ) : (
            <Text {...infoStyle}>{'N/A'}</Text>
          )}
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}

const SupportForm = ({ component, data, setEdit, handleClose }) => {
  const { isCustomerView } = useRouteFlags()
  const { showToast } = useCustomToast()

  const { componentSupportLevel } = data || {}

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState({
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: 365
  })

  const isDisabled =
    (formData?.supportLevel === '' && formData?.endOfSupport === '') ||
    (!component?.internal && formData?.assessmentExpiresOn < 1) ||
    (!component?.internal && formData?.assessmentExpiresOn > 365)

  const noLongerMaintained = formData?.supportLevel === 'no_longer_maintained'

  const handleChange = (e) => {
    const { name, value } = e.target
    const isUnspecified =
      name === 'supportLevel' && (value === 'unspecified' || noLongerMaintained)
    if (isUnspecified) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endOfSupport: '',
        explanation: '',
        assessmentExpiresOn: 0
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
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
        id: componentSupportLevel?.id,
        level: formData?.supportLevel || undefined,
        notes: formData?.explanation || undefined,
        retainManualOverrideFor:
          Number(formData?.assessmentExpiresOn) || undefined,
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
        retainManualOverrideFor: noLongerMaintained
          ? undefined
          : Number(formData?.assessmentExpiresOn),
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
        }
      })
      .finally(() => handleClose(false))
  }

  const handleRemove = () => {
    deleteSupport({ variables: { id: componentSupportLevel?.id } })
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
            assessmentExpiresOn: 0
          }))
        }
      })
      .finally(() => handleClose())
  }

  const inputStyle = { size: 'md' }

  useEffect(() => {
    if (componentSupportLevel) {
      const { level, endDate, notes, retainManualOverrideFor } =
        componentSupportLevel || {}
      setFormData((prev) => ({
        ...prev,
        explanation: notes || '',
        supportLevel: level || '',
        endOfSupport: endDate ? new Date(endDate) : '',
        assessmentExpiresOn: retainManualOverrideFor
          ? Number(retainManualOverrideFor)
          : undefined
      }))
    }
  }, [componentSupportLevel])

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

  return (
    <Stack spacing={4} mt={2}>
      {/* SUPPRT LEVEL */}
      <FormControl>
        <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
        <Select
          sx={inputStyle}
          name='supportLevel'
          value={formData?.supportLevel}
          isDisabled={isCustomerView}
          onChange={handleChange}
        >
          <option value='' style={{ background: 'lightgray' }}>
            -- Select --
          </option>
          <option value='unspecified'>Unspecified</option>
          <option value='actively_maintained'>Actively Maintained</option>
          <option value='no_longer_maintained'>No Longer Maintained</option>
          <option value='abandoned'>Abandoned</option>
        </Select>
      </FormControl>
      {/* END-OF-SUPPORT DATE */}
      <FormControl>
        <FormLabel htmlFor='endOfSupport'>End-Of-Support Date</FormLabel>
        <LynkDate
          name='endOfSupport'
          value={formData?.endOfSupport}
          onChange={(value) => handleDateChange(value, 'endOfSupport')}
        />
      </FormControl>
      {/* RETAIN MANNUAL OVERRIDE */}
      <FormControl
        hidden={noLongerMaintained}
        isRequired={!component?.internal}
        isInvalid={formData?.assessmentExpiresOn > 365}
      >
        <FormLabel htmlFor='assessmentExpiresOn'>
          Assessment Expires On
        </FormLabel>
        <InputGroup>
          <NumberInput
            w={'100%'}
            name='assessmentExpiresOn'
            value={formData?.assessmentExpiresOn}
            onChange={(valueString) =>
              setFormData((prev) => ({
                ...prev,
                assessmentExpiresOn: valueString
              }))
            }
          >
            <NumberInputField fontSize={'sm'} borderRightRadius={0} />
          </NumberInput>
          <InputRightAddon>Days</InputRightAddon>
        </InputGroup>
        <FormErrorMessage>Value must be between 1 and 365</FormErrorMessage>
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
            onClick={componentSupportLevel ? handleUpdate : handleSubmit}
          >
            {componentSupportLevel ? 'Update' : 'Save'}
          </Button>
        </ButtonGroup>
        {componentSupportLevel && (
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
