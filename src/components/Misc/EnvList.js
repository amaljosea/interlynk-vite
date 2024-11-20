import { Link, useParams } from 'react-router-dom'

import { Button, Stack, Tooltip } from '@chakra-ui/react'

import { useGlobalState } from 'hooks/useGlobalState'
import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { FaCode, FaDesktop, FaInbox } from 'react-icons/fa6'

const EnvList = ({ data }) => {
  const params = useParams()
  const productId = params.productid
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

  const borderColor = secondaryBlueBorder
  const variant = (env) =>
    name === env ? 'solid' : productId ? 'ghost' : 'outline'
  const colorScheme = (env) =>
    name === env ? 'blue' : productId ? 'gray' : 'blue'

  return (
    <Stack
      direction={'row'}
      spacing={productId ? 0 : 2}
      sx={{ borderRadius: productId ? '6px' : 0, alignItems: 'center' }}
      border={productId ? `1px solid ${secondaryBlueBorder}` : 'none'}
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
            borderColor={borderColor}
            title='Default environment'
            variant={variant('default')}
            colorScheme={colorScheme('default')}
            sx={{ w: '60px', fontWeight: 400 }}
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
            borderColor={borderColor}
            title='Development environment'
            variant={variant('development')}
            colorScheme={colorScheme('development')}
            sx={{ w: '60px', fontWeight: 400 }}
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
            borderColor={borderColor}
            title='Production environment'
            variant={variant('production')}
            colorScheme={colorScheme('production')}
            sx={{ w: '60px', fontWeight: 400 }}
          >
            {getProjectSbomsCount('production')}
          </Button>
        </Link>
      </Tooltip>
    </Stack>
  )
}

export default EnvList
