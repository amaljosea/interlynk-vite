import { gql, useMutation, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { capitalizeFirstLetter, envOrderList, isDefaultEnv } from 'utils'

import { FormControl, FormLabel, Select } from '@chakra-ui/react'

import LynkModal from 'components/LynkModal'

import useCustomToast from 'hooks/useCustomToast'

import { sbomUpdate } from 'graphQL/Mutation'

import { BiLayerPlus } from 'react-icons/bi'

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

const SbomTransfer = ({ sbom, isOpen, onClose }) => {
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

  return (
    <LynkModal
      isOpen={isOpen}
      buttonText='Switch'
      onClose={onClose}
      Icon={BiLayerPlus}
      title={'Switch Environment'}
      isLoading={loading}
      onSubmit={handleSubmit}
      disabled={disabled}
    >
      <FormControl isRequired>
        <FormLabel htmlFor='environment'>Environment</FormLabel>
        <Select
          value={value}
          fontSize={'sm'}
          name={'environment'}
          onChange={(e) => setValue(e.target.value)}
        >
          <option value=''>-- Select --</option>
          {envList?.length > 0 &&
            envOrderList(envList).map((item, index) => (
              <option
                key={index}
                value={item.value}
                label={
                  isDefaultEnv(item.label)
                    ? capitalizeFirstLetter(item.label)
                    : item.label
                }
              >
                {item.label}
              </option>
            ))}
        </Select>
      </FormControl>
    </LynkModal>
  )
}

export default SbomTransfer
