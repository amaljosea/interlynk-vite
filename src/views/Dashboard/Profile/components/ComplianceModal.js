import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { FormControl, FormLabel, Spacer } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'
import useQueryParam from 'hooks/useQueryParam'

import { UpdateComplianceList } from 'graphQL/Mutation'

import { IoShieldCheckmark } from 'react-icons/io5'

const GetCompliances = gql`
  query GetCompliances {
    allOrganizationCompliances {
      id
      isEnabled
      complianceType
      scoreEnabled
    }
  }
`

const ComplianceModal = ({ data, isOpen, onClose }) => {
  const tab = useQueryParam('tab')
  const { showToast } = useCustomToast()

  const { data: compliances } = useQuery(GetCompliances, {
    skip: tab === 'compliance' ? false : true
  })

  const [updateCompliance, { loading }] = useMutation(UpdateComplianceList)
  const { allOrganizationCompliances: list } = compliances || ''

  const [options, setOptions] = useState([])
  const [value, setValue] = useState(null)

  const onChange = (selected) => {
    setValue(selected)
  }

  const updatedList = list?.map((listItem) => {
    const matchingValue = value?.some(
      (valueItem) => valueItem.value === listItem.id
    )
    return {
      ...listItem,
      isEnabled: matchingValue ? true : false
    }
  })

  const handleSubmit = async () => {
    const result =
      updatedList?.length > 0 &&
      updatedList?.map((item) => ({
        id: item?.id,
        isEnabled: item?.isEnabled,
        complianceType: item?.complianceType
      }))
    await updateCompliance({ variables: { compliances: result || [] } })
      .then((res) => {
        if (res?.organizationComplianceBulkUpdate?.errors?.length > 0) {
          showToast({
            description: res?.organizationComplianceBulkUpdate?.errors[0],
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
    if (list?.length > 0) {
      const result = list
        ?.filter((item) => item?.complianceType !== 'bsi')
        ?.map((item) => ({
          value: item?.id,
          active: item?.isEnabled,
          label: item?.complianceType?.toUpperCase()
        }))
      setOptions(result)
    }
  }, [list])

  useEffect(() => {
    if (isOpen && data?.length > 0) {
      const activeItems = data?.map((item) => ({
        value: item?.id,
        active: item?.isEnabled,
        label: item?.complianceType?.toUpperCase()
      }))
      setValue(activeItems)
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
      disabled={data?.length > 0 && value?.length === 0}
      title={`${data?.length > 0 ? 'Update' : 'Add'} Compliance`}
    >
      <FormControl>
        <FormLabel fontSize={12}>Applicable Compliance</FormLabel>
        <Spacer mt={2} />
        <LynkSelect
          isMulti
          value={value}
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

export default ComplianceModal
