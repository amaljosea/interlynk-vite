import { useMemo } from 'react'
import { truncatedValue } from 'utils'

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Select, Text } from '@chakra-ui/react'

import EditButton from 'components/Icons/EditButton'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuEye } from 'react-icons/lu'

const AttributionReportsColumns = ({
  onEdit,
  sourcePreferences,
  setSourcePreferences
}) => {
  const {
    primaryErrorColor,
    primarySuccessColor,
    primaryTextColor,
    primaryBgColor
  } = useThemeColor([
    'primaryErrorColor',
    'primarySuccessColor',
    'primaryTextColor',
    'primaryBgColor'
  ])

  const columns = useMemo(() => {
    const handleSourceChange = (componentId, value) => {
      setSourcePreferences((prev) => ({
        ...prev,
        [componentId]: value
      }))
    }

    const getValueFromSource = (row, field) => {
      const source = sourcePreferences[row.id] || 'sbom'
      if (source === 'sbom') {
        return row[field]
      }

      if (field === 'licensesExp') {
        const libraryLicense = row.enrichedContent?.packageVersion?.licenseExp
        if (
          !libraryLicense ||
          libraryLicense.startsWith(' OR') ||
          libraryLicense.startsWith('OR')
        ) {
          return 'N/A'
        }
        return libraryLicense
      }

      const value = row.enrichedContent?.packageVersion?.[field]
      return value
    }
    return [
      // NAME
      {
        id: 'COMPONENTS_NAME',
        name: 'NAME',
        selector: (row) => {
          const { name } = row

          return (
            <Flex sx={{ alignItems: 'center', gap: 2, my: 4 }}>
              <Text
                fontSize={14}
                fontWeight={'medium'}
                color={primaryTextColor}
                aria-label='component_name'
              >
                {truncatedValue(name, 40)}
              </Text>
            </Flex>
          )
        },
        width: '25%',
        wrap: true,
        sortable: true
      },
      // VERSION
      {
        id: 'COMPONENTS_VERSION',
        name: 'VERSION',
        selector: (row) => (
          <Text my={4} fontSize={14} color={primaryTextColor}>
            {row?.version || 'N/A'}
          </Text>
        ),
        width: '10%',
        sortable: true
      },
      // LICENSES
      {
        id: 'licenses',
        name: 'LICENSES',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            <IconButton
              icon={
                sourcePreferences[row.id] === 'library' ? (
                  <LuEye size={16} />
                ) : (
                  <EditButton size={16} />
                )
              }
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'license')}
            />
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(
                getValueFromSource(row, 'licensesExp') || 'N/A',
                30
              )}
            </Text>
          </Flex>
        ),
        width: '20%'
      },
      // NOTICE
      {
        id: 'notice',
        name: 'NOTICE',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            <IconButton
              icon={
                sourcePreferences[row.id] === 'library' ? (
                  <LuEye size={16} />
                ) : (
                  <EditButton size={16} />
                )
              }
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'notice')}
            />
            {getValueFromSource(row, 'notice') ? (
              <CheckCircleIcon color={primarySuccessColor} w={4} h={4} />
            ) : (
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                bg={primaryErrorColor}
                borderRadius='full'
                width='16px'
                height='16px'
              >
                <CloseIcon color={primaryBgColor} boxSize='8px' />
              </Box>
            )}
          </Flex>
        ),
        width: '10%'
      },
      // COPYRIGHT
      {
        id: 'copyright',
        name: 'COPYRIGHT',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            <IconButton
              icon={
                sourcePreferences[row.id] === 'library' ? (
                  <LuEye size={16} />
                ) : (
                  <EditButton size={16} />
                )
              }
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'copyright')}
            />
            {getValueFromSource(row, 'copyright') ? (
              <CheckCircleIcon color={primarySuccessColor} w={4} h={4} />
            ) : (
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                bg={primaryErrorColor}
                borderRadius='full'
                width='16px'
                height='16px'
              >
                <CloseIcon color={primaryBgColor} boxSize='8px' />
              </Box>
            )}
          </Flex>
        ),
        width: '10%'
      },
      // SOURCE
      {
        id: 'source',
        name: 'SOURCE',
        selector: (row) => (
          <Select
            value={sourcePreferences[row.id]}
            onChange={(e) => handleSourceChange(row.id, e.target.value)}
            isDisabled={false}
            isReadOnly={false}
            color={primaryTextColor}
          >
            <option value='sbom'>SBOM</option>
            <option value='library'>Library</option>
          </Select>
        ),
        width: '20%'
      }
    ]
  }, [
    primaryTextColor,
    primarySuccessColor,
    primaryErrorColor,
    primaryBgColor,
    onEdit,
    sourcePreferences,
    setSourcePreferences
  ])

  return columns
}

export default AttributionReportsColumns
