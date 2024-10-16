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
    <Stack direction={'row'} spacing={2} alignItems={'center'}>
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
            colorScheme='blue'
            leftIcon={<FaInbox />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            variant={name === 'default' ? 'solid' : 'outline'}
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
            colorScheme='blue'
            leftIcon={<FaCode />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            variant={name === 'development' ? 'solid' : 'outline'}
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
            colorScheme='blue'
            leftIcon={<FaDesktop />}
            borderColor={secondaryBlueBorder}
            sx={{ w: '60px', fontWeight: 400 }}
            variant={name === 'production' ? 'solid' : 'outline'}
          >
            {getProjectSbomsCount('production')}
          </Button>
        </Link>
      </Tooltip>
    </Stack>
  )
}

export default EnvList
