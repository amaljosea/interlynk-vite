import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel, Spacer } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { UpdateCompliance } from 'graphQL/Mutation'

import { IoShieldCheckmark } from 'react-icons/io5'

const QualityScoreModal = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()

  const [updateCompliance, { loading }] = useMutation(UpdateCompliance)

  const [options, setOptions] = useState([])
  const [item, setItem] = useState(null)

  const onChange = (selected) => {
    setItem(selected)
  }

  const handleSubmit = async () => {
    await updateCompliance({
      variables: { id: item?.value, scoreEnabled: true }
    })
      .then((res) => {
        if (res?.organizationComplianceUpdate?.errors?.length > 0) {
          showToast({
            description: res?.organizationComplianceUpdate?.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: 'Compliances updated successfully',
            status: 'success'
          })
        }
      })
      .finally(() => onClose())
  }

  useEffect(() => {
    if (isOpen && data?.length > 0) {
      const getLabel = (type) => {
        switch (type) {
          case 'unspecified':
            return 'None'
          default:
            return type?.toUpperCase()
        }
      }
      const compliances = data
        ?.filter((item) => item?.complianceType !== 'bsi')
        ?.map((item) => ({
          value: item?.id,
          active: item?.isEnabled,
          label: getLabel(item?.complianceType)
        }))
      setOptions(compliances)
      const result = data?.find((item) => item?.scoreEnabled)
      if (result) {
        setItem({
          value: result?.id,
          active: result?.isEnabled,
          label: getLabel(result?.complianceType)
        })
      } else {
        setItem(null)
      }
    }
  }, [data, isOpen])

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      buttonText='Save'
      isLoading={loading}
      onSubmit={handleSubmit}
      Icon={IoShieldCheckmark}
      disabled={data?.length > 0 && item === null}
      title={`${data?.length > 0 ? 'Update' : 'Add'} Compliance`}
    >
      <FormControl>
        <FormLabel>SBOM Quality Score</FormLabel>
        <Spacer mt={2} />
        <LynkSelect
          value={item}
          options={options}
          name='compliance'
          isClearable={true}
          isLoading={loading}
          isSearchable={false}
          onChange={onChange}
          filterOption={null}
          noOptionsMessage={() => null}
          placeholder={'Select compliance'}
        />
      </FormControl>
    </LynkModal>
  )
}

export default QualityScoreModal
