import { useMutation } from '@apollo/client'
import { useState } from 'react'
import AsyncSelect from 'react-select/async'
import { formatString, truncatedValue } from 'utils'

import { Flex, FormControl, FormLabel } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'
import CustomDropdownIndicator from 'components/Misc/CustomDropdownIndicator'

import useCustomToast from 'hooks/useCustomToast'
import { useGlobalState } from 'hooks/useGlobalState'
import { useLazyDropDown } from 'hooks/useLazyDropDown'
import { useSelect } from 'hooks/useSelect'

import { RequestAccept } from 'graphQL/Mutation'
import { GetProductNamesForRequest } from 'graphQL/Queries'
import { LuCheckCheck } from 'react-icons/lu'


const RequestAcceptModal = ({ data, isOpen, onClose }) => {
  const { showToast } = useCustomToast()
  const { style } = useSelect('lynkSelect')
  const [acceptRequest, { loading }] = useMutation(RequestAccept)
  const { prodState } = useGlobalState()
  const { field, direction } = prodState

  const [projectId, setProjectId] = useState('')
  const [productName, setProductName] = useState('')
  const [projectIds, setProjectIds] = useState([])

  const { lazyDropDownProps } = useLazyDropDown(GetProductNamesForRequest, {
    selector: 'organization.projectGroups',
    variables: {
      field: field,
      direction: direction,
      first: 5
    },
    selectorForActualCount: 'organization.projectGroups',
    styles: style,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: CustomDropdownIndicator
    },
    optionLabel: 'name'
  })

  const handleAccept = async () => {
    await acceptRequest({
      variables: {
        id: data?.id,
        projectId: projectId
      }
    }).then((res) => {
      if (res?.data?.requestAccept?.errors?.length === 0) {
        showToast({
          description: `SBOM copied into Product ${productName}`,
          status: 'success'
        })
        onClose()
      } else {
        showToast({
          description: "Couldn't accept request",
          status: 'error'
        })
      }
    })
  }

  const handleProductChange1 = (value) => {
    setProductName(value?.name)

    const projectGroup = value

    if (projectGroup) {
      setProjectIds(
        projectGroup.projects.map((project) => ({
          id: project.id,
          name: project.name
        }))
      )
    } else {
      setProjectIds([])
    }
  }

  const envOptions = [
    { value: '', label: '-- Select Environment --' },
    ...(Array.isArray(projectIds) ? projectIds : [])
      .sort((a, b) => a?.name?.localeCompare(b?.name))
      .map((item) => ({
        value: item.id,
        label: truncatedValue(formatString(item.name), 24)
      }))
  ]

  return (
    <LynkModal
      isOpen={isOpen}
      onClose={onClose}
      title={'Accept SBOM'}
      buttonText='Accept'
      isLoading={loading}
      onSubmit={handleAccept}
      Icon={LuCheckCheck}
      disabled={projectId === ''}
    >
      <Flex width={'100%'} direction={'column'} gap={4}>
        <FormControl isRequired>
          <FormLabel>Product</FormLabel>
          <AsyncSelect
            {...{
              ...lazyDropDownProps,
              onChange: handleProductChange1,
              value: null,

              placeholder: productName || '--Select--'
            }}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Environment</FormLabel>
          <LynkSelect
            options={envOptions}
            onChange={(selected) => setProjectId(selected?.value || '')}
            placeholder='-- Select Environment --'
            dropDown
          />
        </FormControl>
      </Flex>
    </LynkModal>
  )
}

export default RequestAcceptModal
