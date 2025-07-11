import { useMutation, useQuery } from '@apollo/client'
import { useMemo, useRef, useState } from 'react'
import { timeSince } from 'utils'
import { licenseStatusTypes } from 'variables/general'

import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react'

import CustomLoader from 'components/CustomLoader'
import LynkAlert from 'components/LynkAlert'
import LynkDrawer from 'components/LynkDrawer'
import LynkSelect from 'components/LynkSelect'
import CompInfo from 'components/Misc/CompInfo'

import useCustomToast from 'hooks/useCustomToast'
import { useThemeColor } from 'hooks/useThemeColors'

import { ComponentLicenseStatusUpdate } from 'graphQL/Mutation'
import { GetLicenseStatusHistory } from 'graphQL/Queries'

import { LuPlus } from 'react-icons/lu'

const LicenseStatus = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const { sameSecondaryText } = useThemeColor(['sameSecondaryText'])

  const noteForm = useRef(null)
  const [edit, setEdit] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    licenseStatus: '',
    licenseNotes: ''
  })

  const [updateStatus, { loading: updateLoading }] = useMutation(
    ComponentLicenseStatusUpdate
  )

  const { data: statuses, loading: statusLoading } = useQuery(
    GetLicenseStatusHistory,
    {
      variables: { compId: data?.id }
    }
  )
  const { componentLicenseStatusHistories } = statuses || {}

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdate = () => {
    setFormData(() => ({ licenseStatus: '', licenseNotes: '' }))
    setEdit(true)
  }

  const handleSubmit = () => {
    updateStatus({
      variables: {
        id: data?.id,
        sbomId: data?.sbomId,
        licenseStatus: formData?.licenseStatus,
        licenseNotes: formData?.licenseNotes
      }
    }).then((res) => {
      const { errors } = res?.data?.componentLicenseStatusUpdate || {}
      if (errors?.length > 0) {
        setError(errors[0])
      } else {
        setEdit(false)
        setFormData({ licenseStatus: '', licenseNotes: '' })
        showToast({ description: 'Note Updated', status: 'success' })
      }
    })
  }

  const isDisabled =
    formData?.licenseStatus.trim() === '' ||
    formData?.licenseNotes.trim() === ''

  const filterData = useMemo(() => {
    if (!componentLicenseStatusHistories?.length) return []
    return [...componentLicenseStatusHistories].sort(
      (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)
    )
  }, [componentLicenseStatusHistories])

  const selectOptions = useMemo(
    () => licenseStatusTypes?.map((item) => ({ value: item, label: item })),
    []
  )

  return (
    <LynkDrawer
      title={'Edit License Status'}
      subtitle={data && <CompInfo data={data} />}
      isOpen={isOpen}
      onClose={onClose}
      noFooter
    >
      <Stack spacing={4}>
        {edit ? (
          <Stack spacing={4} ref={noteForm}>
            {/* STATUS */}
            <FormControl isRequired>
              <FormLabel htmlFor='licenseStatus'>Status</FormLabel>
              <LynkSelect
                name='licenseStatus'
                aria-label='licenseStatus'
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: 'licenseStatus',
                      value: selectedOption?.value
                    }
                  })
                }
                value={selectOptions?.find(
                  (option) => option.value === formData.licenseStatus
                )}
                options={selectOptions}
                placeholder='-- Select --'
                dropDown
                isDisabled={updateLoading}
              />
            </FormControl>
            {/* NOTE */}
            <FormControl isRequired>
              <FormLabel htmlFor='licenseNotes'>Note</FormLabel>
              <Textarea
                maxLength={512}
                name='licenseNotes'
                onChange={handleChange}
                value={formData?.licenseNotes}
                placeholder={'Add some notes'}
                isDisabled={updateLoading}
              />
            </FormControl>
            {error !== '' && <LynkAlert msg={error} />}
            {/* NOTE ACTIONS */}
            <ButtonGroup>
              <Button
                w={'24'}
                fontSize={'sm'}
                variant='solid'
                colorScheme='gray'
                onClick={() => setEdit(false)}
              >
                Cancel
              </Button>
              <Button
                w={'24'}
                fontSize={'sm'}
                variant='outline'
                colorScheme='blue'
                onClick={handleSubmit}
                isDisabled={isDisabled}
                isLoading={updateLoading}
              >
                Save
              </Button>
            </ButtonGroup>
          </Stack>
        ) : (
          <Button
            mt={2}
            w={'full'}
            fontSize={'sm'}
            leftIcon={<LuPlus size={18} />}
            onClick={handleUpdate}
            data-testid='update_status'
          >
            Add Status
          </Button>
        )}
        <Divider />
        {statusLoading ? (
          <CustomLoader />
        ) : (
          <Stack>
            {filterData?.length > 0 ? (
              <Stack spacing={6} mb={4}>
                {filterData?.map((item) => (
                  <Flex
                    gap={8}
                    key={item.id}
                    justify='space-between'
                    alignItems={'flex-start'}
                  >
                    <Stack spacing={0} maxW='320px'>
                      <Text
                        fontSize={'sm'}
                        whiteSpace='pre-wrap'
                        wordBreak='break-word'
                      >
                        {item?.values?.license_status}
                      </Text>
                      <Text fontSize={'xs'} color={sameSecondaryText}>
                        {item?.values?.license_notes}
                      </Text>
                    </Stack>
                    <Text
                      fontSize={'xs'}
                      textAlign='right'
                      color={sameSecondaryText}
                    >
                      {timeSince(item?.createdAt)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text textAlign={'center'} color={sameSecondaryText}>
                No record to display
              </Text>
            )}
          </Stack>
        )}
      </Stack>
    </LynkDrawer>
  )
}

export default LicenseStatus
