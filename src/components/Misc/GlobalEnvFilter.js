import { useNavigate, useParams } from 'react-router-dom'

import { Button, Flex, IconButton, Tooltip } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useProjectGroup } from 'hooks/useProjectGroup'
import useQueryParam from 'hooks/useQueryParam'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'

const GlobalEnvFilter = () => {
  const params = useParams()
  const navigate = useNavigate()
  const activeTab = useQueryParam('tab')
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { envName, onChangeEnv, setClearSelect } = useGlobalState()

  const { secondaryBlueBorder } = useThemeColor(['secondaryBlueBorder'])

  const { projects } = useProjectGroup({
    projectGroupId: params?.productgroupid
  })

  const borderColor = secondaryBlueBorder
  const variant = (env) => (envName === env ? 'solid' : 'outline')
  const colorScheme = (env) => (envName === env ? 'blue' : 'blue')

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
  }

  return (
    <Flex width='100%' alignItems={'center'} justifyContent={'space-between'}>
      <Button
        size='sm'
        colorScheme='blue'
        textTransform={'capitalize'}
        _hover={{ colorScheme: 'blue' }}
        _active={{ colorScheme: 'blue' }}
      >
        {envName}
      </Button>
      <Flex gap={2} alignItems='center'>
        <Tooltip label='Default' placement='left'>
          <IconButton
            size='sm'
            icon={<FaInbox />}
            sx={{ fontWeight: 400 }}
            borderColor={borderColor}
            title='Default environment'
            variant={variant('default')}
            colorScheme={colorScheme('default')}
            onClick={() => handleEnvChange('default')}
          />
        </Tooltip>
        <Tooltip label='Development' placement='left'>
          <IconButton
            size='sm'
            icon={<FaCode />}
            sx={{ fontWeight: 400 }}
            borderColor={borderColor}
            title='Development environment'
            variant={variant('development')}
            colorScheme={colorScheme('development')}
            onClick={() => handleEnvChange('development')}
          />
        </Tooltip>
        <Tooltip label='Production' placement='left'>
          <IconButton
            size='sm'
            icon={<FaDesktop />}
            sx={{ fontWeight: 400 }}
            borderColor={borderColor}
            title='Production environment'
            variant={variant('production')}
            colorScheme={colorScheme('production')}
            onClick={() => handleEnvChange('production')}
          />
        </Tooltip>
      </Flex>
    </Flex>
  )
}

export default GlobalEnvFilter
