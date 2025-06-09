import { useNavigate, useParams } from 'react-router-dom'

import {
  Menu,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import useQueryParam from 'hooks/useQueryParam'

import EnvList from './EnvList'

const EnvFilter = ({ data }) => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { envName, onChangeEnv, setClearSelect } = useGlobalState()

  const { projects } = useProjectGroup({
    projectGroupId: params?.productgroupid
  })

  const handleEnvChange = (value) => {
    if (params.productgroupid) {
      const project = projects.find((p) => p.name === value)
      const currentTab = { tab: activeTab }
      onChangeEnv(project)
      navigate(
        generateProductDetailPageUrlFromCurrentUrl({
          productid: project.id,
          paramsObj: activeTab ? currentTab : {}
        })
      )
    }
    setClearSelect(true)
  }

  return (
    <Menu closeOnSelect={true}>
      <EnvList data={data} />
      <MenuList width={'200px'} fontSize={'sm'}>
        <MenuOptionGroup
          value={envName}
          onChange={(value) => handleEnvChange(value)}
          type='radio'
        >
          {['default', 'development', 'production'].map((item, index) => (
            <MenuItemOption
              key={index}
              value={item}
              fontSize='sm'
              textTransform={'capitalize'}
            >
              {item}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  )
}

export default EnvFilter
