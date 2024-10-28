import { Link, useParams } from 'react-router-dom'

import { Button, Stack, Tooltip } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'

const EnvList = ({ data }) => {
  const params = useParams()
  const { id, projects, defaultProject } = data || ''
  const { onChangeEnv, dispatch } = useGlobalState()
  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()

  const { prodDispatch } = dispatch

  const activeEnv = projects?.find((item) => item?.id === params?.productid)
  const { name } = activeEnv || ''

  const { secondaryBlueBorder } = useThemeColor(['secondaryBlueBorder'])

  const handleClick = (value) => {
    const env = projects?.find((item) => item.name === value)
    onChangeEnv(env?.name)
    prodDispatch({
      type: 'SET_CURRENT_PRODUCT',
      payload: { id: env?.id }
    })
  }

  const getProjectSbomsCount = (name) => {
    const project = projects?.find((item) => item.name === name)
    return project ? project.sbomsCount : 0
  }

  return (
    <Stack
      direction={'row'}
      spacing={0}
      border={`1px solid ${secondaryBlueBorder}`}
      sx={{ borderRadius: '6px', alignItems: 'center' }}
    >
      <Tooltip label='Default'>
        <Link
          to={generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: id,
            productid: defaultProject?.id
          })}
          onClick={() => handleClick('default')}
        >
          <Button
            size='sm'
            leftIcon={<FaInbox />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            variant={name === 'default' ? 'solid' : 'ghost'}
            colorScheme={name === 'default' ? 'blue' : 'gray'}
          >
            {getProjectSbomsCount('default')}
          </Button>
        </Link>
      </Tooltip>
      <Tooltip label='Development'>
        <Link
          to={generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: id,
            productid: projects?.find((item) => item.name === 'development').id
          })}
          onClick={() => handleClick('development')}
        >
          <Button
            size='sm'
            leftIcon={<FaCode />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            colorScheme={name === 'development' ? 'blue' : 'gray'}
            variant={name === 'development' ? 'solid' : 'ghost'}
          >
            {getProjectSbomsCount('development')}
          </Button>
        </Link>
      </Tooltip>
      <Tooltip label='Production'>
        <Link
          to={generateProductDetailPageUrlFromCurrentUrl({
            productgroupid: id,
            productid: projects?.find((item) => item.name === 'production').id
          })}
          onClick={() => handleClick('production')}
        >
          <Button
            size='sm'
            leftIcon={<FaDesktop />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            colorScheme={name === 'production' ? 'blue' : 'gray'}
            variant={name === 'production' ? 'solid' : 'ghost'}
          >
            {getProjectSbomsCount('production')}
          </Button>
        </Link>
      </Tooltip>
    </Stack>
  )
}

export default EnvList
