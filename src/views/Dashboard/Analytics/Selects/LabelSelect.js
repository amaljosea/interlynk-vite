import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { FormControl, FormLabel } from '@chakra-ui/react'

import LynkSelect from 'components/LynkSelect'

import { useGlobalQueryContext } from 'hooks/useGlobalQueryContext'

import { GetLabels } from 'graphQL/Queries'

const LabelSelect = ({ value, onChange, filters }) => {
  const location = useLocation()
  const { orgView } = useGlobalQueryContext()
  const [options, setOptions] = useState([])

  const { data, loading } = useQuery(GetLabels, {
    skip: location?.pathname === '/vendor/analytics' && orgView ? false : true,
    variables: { first: 500 }
  })
  const { nodes } = data?.labels || ''

  useEffect(() => {
    if (nodes?.length > 0) {
      setOptions(() =>
        nodes?.map((item) => ({ label: item?.name, value: item?.id }))
      )
    }
  }, [nodes])

  return (
    <FormControl>
      <FormLabel htmlFor='phases' fontSize={'sm'}>
        Label
      </FormLabel>
      <LynkSelect
        value={value}
        options={options}
        isClearable={true}
        isLoading={loading}
        isSearchable={true}
        onChange={onChange}
        name='Product Label'
        placeholder={'Add label'}
        isDisabled={!filters.env}
      />
    </FormControl>
  )
}

export default LabelSelect
