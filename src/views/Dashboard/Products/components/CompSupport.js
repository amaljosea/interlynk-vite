import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getFullDateTime, isCustomerView } from 'utils'

import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  Flex,
  IconButton,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip
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
import { useThemeColor } from 'hooks/useThemeColors'

import {
  componentSupportLevelCreate,
  componentSupportLevelDelete,
  componentSupportLevelUpdate
} from 'graphQL/Mutation'
import { GetComponentSupportLevels } from 'graphQL/Queries'

const CompSupport = ({ data, isOpen, onClose }) => {
  const params = useParams()

  const [edit, setEdit] = useState(false)

  const { data: supports, loading } = useQuery(GetComponentSupportLevels, {
    skip: isOpen ? false : true,
    variables: { id: data?.id, sbomId: params?.sbomid }
  })

  const { componentSupportLevel } = supports?.component || {}

  return (
    <LynkDrawer
      noFooter
      isOpen={isOpen}
      onClose={onClose}
      title={'Edit Support Status'}
      subtitle={data ? <CompInfo data={data} /> : null}
    >
      {loading ? (
        <CustomLoader />
      ) : (
        <Stack>
          {edit ? (
            <SupportForm
              id={data?.id}
              setEdit={setEdit}
              data={componentSupportLevel}
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
  const { level, endDate, notes, retainManualOverrideFor, updatedAt, user } =
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
          <Text {...label}>End-of-Support Date</Text>
          <Text {...infoStyle}>
            {endDate ? getFullDateTime(endDate) : 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Assessment Expries On</Text>
          <Text {...infoStyle}>
            {retainManualOverrideFor
              ? `${retainManualOverrideFor} Days`
              : 'N/A'}{' '}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Last Assessed</Text>
          <Text {...infoStyle}>
            {updatedAt ? getFullDateTime(updatedAt) : 'N/A'}
          </Text>
        </SimpleGrid>
        <SimpleGrid {...container}>
          <Text {...label}>Explation</Text>
          <Text {...infoStyle}>{notes || 'N/A'}</Text>
        </SimpleGrid>
      </Stack>
    </Stack>
  )
}

const SupportForm = ({ id, data, setEdit }) => {
  const customerView = isCustomerView()
  const { showToast } = useCustomToast()

  const [formData, setFormData] = useState({
    assessment: '',
    supportLevel: '',
    endOfSupport: '',
    explanation: '',
    assessmentExpiresOn: 0,
    lastAssessed: '',
    assessedBy: ''
  })

  const isDisabled =
    formData?.supportLevel === '' || formData?.endOfSupport === ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      [field]: newDate._d
    }))
  }

  const handleUpdate = () => {
    updateSupport({
      variables: {
        id: data?.id,
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
        } else {
          showToast({
            description: 'Support level updated successfully',
            status: 'success'
          })
        }
      })
      .finally(() => setEdit(false))
  }

  const handleSubmit = () => {
    createSupport({
      variables: {
        id,
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
        const { errors } = res?.data?.componentSupportLevelCreate || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Support level added successfully',
            status: 'success'
          })
        }
      })
      .finally(() => setEdit(false))
  }

  const handleRemove = () => {
    deleteSupport({
      variables: {
        id: data?.id
      }
    })
      .then((res) => {
        const { errors } = res?.data?.componentSupportLevelDelete || {}
        if (errors?.length > 0) {
          showToast({
            description: errors[0],
            status: 'error'
          })
        } else {
          setFormData((prev) => ({
            ...prev,
            explanation: '',
            assessedBy: '',
            supportLevel: '',
            endOfSupport: new Date(),
            assessmentExpiresOn: 0
          }))
          showToast({
            description: 'Support level removed successfully',
            status: 'success'
          })
        }
      })
      .finally(() => setEdit(false))
  }

  const inputStyle = { size: 'md', fontSize: 'sm' }

  useEffect(() => {
    if (data) {
      const { level, endDate, notes, retainManualOverrideFor, user } =
        data || {}
      setFormData((prev) => ({
        ...prev,
        explanation: notes || '',
        supportLevel: level || '',
        assessedBy: user?.name || '',
        endOfSupport: endDate ? new Date(endDate) : '',
        assessmentExpiresOn: retainManualOverrideFor
          ? Number(retainManualOverrideFor)
          : undefined
      }))
    }
  }, [data])

  return (
    <Stack spacing={4}>
      {/* ASSESSMENT */}
      <FormControl hidden>
        <FormLabel htmlFor='assessment'>Assessment</FormLabel>
        <Select
          sx={inputStyle}
          name='assessment'
          value={formData?.assessment}
          isDisabled={customerView}
          onChange={handleChange}
        >
          <option value='' style={{ background: 'lightgray' }}>
            -- Select --
          </option>
          <option value='automatic'>Automatic</option>
          <option value='manual'>Manual</option>
        </Select>
      </FormControl>
      {/* SUPPRT LEVEL */}
      <FormControl>
        <FormLabel htmlFor='supportLevel'>Support Level</FormLabel>
        <Select
          sx={inputStyle}
          name='supportLevel'
          value={formData?.supportLevel}
          isDisabled={customerView}
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
      <FormControl>
        <FormLabel htmlFor='assessmentExpiresOn'>
          Assessment Expires On
        </FormLabel>
        <InputGroup>
          <NumberInput
            max={365}
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
      {/* ASSESSED BY */}
      <FormControl hidden={!formData?.assessedBy} isDisabled>
        <FormLabel htmlFor='assessedBy'>Assessed By</FormLabel>
        <Input
          sx={inputStyle}
          name='assessedBy'
          value={formData?.assessedBy}
          placeholder='Enter name'
          onChange={(e) =>
            handleChange('support', 'assessedBy', e.target.value)
          }
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
            onClick={data ? handleUpdate : handleSubmit}
          >
            {data ? 'Update' : 'Save'}
          </Button>
        </ButtonGroup>
        {data && (
          <IconButton
            colorScheme='red'
            icon={<DeleteIcon />}
            title='Remove support'
            onClick={handleRemove}
            isLoading={deleteLoading}
          />
        )}
      </Flex>
    </Stack>
  )
}

export default CompSupport
