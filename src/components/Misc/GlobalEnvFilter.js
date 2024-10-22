import { useNavigate, useParams } from 'react-router-dom'

import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup
} from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import useQueryParam from 'hooks/useQueryParam'

import { FaCode, FaInbox, FaSquareArrowUpRight } from 'react-icons/fa6'

const envIcon = (env) => {
  switch (env) {
    case 'default':
      return <FaInbox />
    case 'development':
      return <FaCode />
    case 'production':
      return <FaSquareArrowUpRight />
  }
}

const GlobalEnvFilter = () => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { envName, onChangeEnv, setClearSelect, setSelectedSbom } =
    useGlobalState()

  const { projects } = useProjectGroup({
    projectGroupId: params?.productgroupid
  })

  const handleEnvChange = (value) => {
    if (params.productgroupid) {
      const project = projects.find((p) => p.name === value)
      const currentTab = { tab: activeTab }
      navigate(
        generateProductDetailPageUrlFromCurrentUrl({
          productid: project.id,
          paramsObj: activeTab ? currentTab : {}
        })
      )
    }
    onChangeEnv(value)
    setClearSelect(true)
    setSelectedSbom([])
  }

  return (
    <Menu closeOnSelect={true}>
      <MenuButton
        as={Button}
        fontSize='sm'
        colorScheme='blue'
        fontWeight='medium'
        className='environments'
        textTransform='capitalize'
        leftIcon={envIcon(envName)}
        data-testid='global_env_filter'
        rightIcon={<ChevronDownIcon />}
      >
        {envName || 'Default'}
      </MenuButton>
      <MenuList width={'200px'}>
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

export default GlobalEnvFilter
