import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, envOrderList, isDefaultEnv } from 'utils'

import { FormControl, FormLabel, Tag, Text } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'
import LynkSelect from 'components/LynkSelect'

import useCustomToast from 'hooks/useCustomToast'

import { sbomUpdate } from 'graphQL/Mutation'

import { LuArrowDownUp } from 'react-icons/lu'

const ProjectGroup = gql`
  query ProjectGroup($id: Uuid!) {
    projectGroup(id: $id) {
      projects {
        id
        name
      }
    }
  }
`

const SbomTransfer = ({ sbom, isOpen, onClose, productGroup }) => {
  const params = useParams()
  const { showToast } = useCustomToast()

  const { data } = useQuery(ProjectGroup, {
    skip: isOpen ? false : true,
    variables: { id: params?.productgroupid }
  })
  const { projects } = data?.projectGroup || ''

  const [updateSbom, { loading }] = useMutation(sbomUpdate)

  const [value, setValue] = useState('')
  const [envList, setEnvList] = useState([])

  const disabled = value === ''

  const handleSubmit = async () => {
    await updateSbom({
      variables: {
        id: sbom?.id,
        spec: sbom?.spec,
        moveTo: value
      }
    })
      .then((res) => {
        if (res?.sbomUpdate?.errors?.length > 0) {
          showToast({
            description: res?.sbomUpdate?.errors[0],
            status: 'error'
          })
        } else {
          showToast({
            description: `Sbom transferred successfully`,
            status: 'success'
          })
        }
      })
      .then(() => onClose())
  }

  useEffect(() => {
    if (projects?.length > 0) {
      const productList = projects
        .filter((item) => item.id !== params?.productid)
        .map((option) => ({
          value: option?.id,
          label: option?.name
        }))
      setEnvList(productList)
    }
  }, [params?.productid, projects])

  const envOptions = [
    { label: '-- Select --', value: '' },
    ...envOrderList(envList).map((item) => ({
      label: isDefaultEnv(item.label)
        ? capitalizeFirstLetter(item.label)
        : capitalizeFirstLetter(item.label),
      value: item.value
    }))
  ]

  const envValue =
    envList?.length > 0
      ? envOrderList(envList).find((opt) => opt.value === value)
        ? {
            ...envOrderList(envList).find((opt) => opt.value === value),
            label: capitalizeFirstLetter(
              envOrderList(envList).find((opt) => opt.value === value).label
            )
          }
        : null
      : null

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText='Switch'
      onClose={onClose}
      Icon={LuArrowDownUp}
      title={'Switch Environment'}
      isLoading={loading}
      onSubmit={handleSubmit}
      disabled={disabled}
    >
      <Tag colorScheme='blue' mb={5} py={1.5}>
        <Text fontWeight={400} wordBreak={'break-all'}>
          {productGroup?.name} - {sbom?.projectVersion}
        </Text>
      </Tag>
      <FormControl isRequired>
        <FormLabel htmlFor='environment'>Environment</FormLabel>
        <LynkSelect
          value={envValue}
          name='environment'
          onChange={(selected) => setValue(selected.value)}
          options={envOptions}
          placeholder={'-- Select --'}
          dropDown
        />
      </FormControl>
    </LynkModal>
  )
}

export default SbomTransfer
