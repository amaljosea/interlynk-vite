import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'

import { Button, Flex, Tooltip } from '@chakra-ui/react'

import { useProductUrlContext } from 'hooks/useProductUrlContext'
import { useThemeColor } from 'hooks/useThemeColors'

import { LuInbox, LuPackage, LuShapes } from 'react-icons/lu'

const EnvironmentButtons = ({
  isGeneralFilter,
  onClick,
  getDefaultCount,
  getDevelopmentCount,
  getProductionCount,
  data,
  variant,
  colorScheme
}) => {
  const params = useParams()
  const resolvedProductId = isGeneralFilter ? true : params.productid

  const { generateProductDetailPageUrlFromCurrentUrl } = useProductUrlContext()
  const { id, projects, defaultProject } = data || {}

  const { secondaryBlueBorder } = useThemeColor(['secondaryBlueBorder'])

  const environments = [
    {
      name: 'default',
      label: 'Default',
      icon: <LuInbox size={16} />,
      count: getDefaultCount,
      project: !isGeneralFilter ? defaultProject?.id : ''
    },
    {
      name: 'development',
      label: 'Development',
      icon: <LuShapes size={16} />,
      count: getDevelopmentCount,
      project: projects?.find((item) => item.name === 'development')?.id
    },
    {
      name: 'production',
      label: 'Production',
      icon: <LuPackage size={16} />,
      count: getProductionCount,
      project: projects?.find((item) => item.name === 'production')?.id
    }
  ]

  return (
    <Flex
      gap={resolvedProductId ? 0 : 2}
      sx={{ borderRadius: resolvedProductId ? '6px' : 0, alignItems: 'center' }}
      border={resolvedProductId ? `1px solid ${secondaryBlueBorder}` : 'none'}
    >
      {environments.map(({ name, label, icon, count, project }) => {
        const button = (
          <Button
            flex='1'
            size='sm'
            leftIcon={icon}
            borderColor={secondaryBlueBorder}
            title={`${label} environment`}
            variant={variant(name)}
            colorScheme={colorScheme(name)}
            onClick={onClick ? () => onClick(name) : ''}
            sx={{ minWidth: '60px', maxW: 'fit-content', fontWeight: 400 }}
          >
            {count}
          </Button>
        )

        return (
          <Tooltip key={name} label={label}>
            {!isGeneralFilter ? (
              <Link
                to={generateProductDetailPageUrlFromCurrentUrl({
                  productgroupid: !isGeneralFilter ? id : '',
                  productid: project
                })}
              >
                {button}
              </Link>
            ) : (
              button
            )}
          </Tooltip>
        )
      })}
    </Flex>
  )
}

export default EnvironmentButtons
