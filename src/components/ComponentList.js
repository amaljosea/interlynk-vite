import { useQuery } from '@apollo/client'
import { TabContext } from 'context/TabContext'
import { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import useQueryParam from 'hooks/useQueryParam'

import { GetAllComponents, GetTotalComponents } from 'graphQL/Queries'

import LynkSelect from './LynkSelect'

const ComponentList = ({ id, name, value, setValue }) => {
  const params = useParams()
  const activeTab = useQueryParam('tab')
  const { tab, tabData, setTabData, handleChange } = useContext(TabContext)

  const [options, setOptions] = useState([])
  const { relations } = tabData

  const compState = {
    projectId: params?.productid,
    sbomId: params?.sbomid,
    field: 'COMPONENTS_UPDATED_AT',
    direction: 'DESC'
  }

  const { data: compData } = useQuery(GetTotalComponents, {
    skip: tab === 4 ? false : true,
    fetchPolicy: activeTab === 'components' ? false : true,
    variables: {
      ...compState
    }
  })

  const { data: allComponents, loading } = useQuery(GetAllComponents, {
    skip: compData ? false : true,
    variables: {
      ...compState,
      first: compData?.sbom?.components?.totalCount
    },
    onCompleted: (data) => {
      if (data) {
        setTabData((prev) => ({ ...prev, relations: { to: '', relType: '' } }))
      }
    }
  })
  const { nodes } = allComponents?.sbom?.components || ''

  const onChange = (item) => {
    setValue(item)
    handleChange('relations', 'to', item?.value)
  }

  useEffect(() => {
    if (nodes?.length > 0) {
      const result = [...nodes]
        .filter((com) => com?.name !== name)
        .sort((a, b) =>
          relations?.relType === 'dependency_of'
            ? b?.name?.localeCompare(a?.name)
            : a?.name?.localeCompare(b?.name)
        )
        .map((item) => ({
          label: `${item?.name} - ${item?.version}`,
          value: item?.id
        }))
      console.log('result', result)
      setOptions(result)
    }
  }, [name, nodes, relations?.relType])

  return (
    <LynkSelect
      name={id}
      value={value}
      options={options}
      isClearable={true}
      isSearchable={true}
      onChange={onChange}
      isLoading={loading}
      isDisabled={loading}
      placeholder={'Select component'}
    />
  )
}

export default ComponentList
