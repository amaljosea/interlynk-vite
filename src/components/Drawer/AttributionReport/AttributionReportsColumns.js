import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { truncatedValue } from 'utils'

import { Box, Flex, IconButton, Select, Text, Tooltip } from '@chakra-ui/react'

import EditButton from 'components/Icons/EditButton'
import LynkBadge from 'components/LynkBadge'

import { useThemeColor } from 'hooks/useThemeColors'

import { LuCircleCheck, LuCircleX, LuEye } from 'react-icons/lu'

const AttributionReportsColumns = ({
  onEdit,
  sourcePreferences,
  setSourcePreferences
}) => {
  const params = useParams()
  const { primaryErrorColor, primarySuccessColor, primaryTextColor } =
    useThemeColor([
      'primaryErrorColor',
      'primarySuccessColor',
      'primaryTextColor'
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
          const { name, sbomId, sbom } = row
          const { projectVersion, project } = sbom || {}
          const { projectGroup } = project || {}
          const isPart = sbomId !== params?.sbomid

          return (
            <Flex sx={{ alignItems: 'center', gap: 2, my: 4 }}>
              <Text
                fontSize={14}
                fontWeight={'medium'}
                color={primaryTextColor}
                aria-label='component_name'
              >
                {truncatedValue(name, 30)}
              </Text>
              {isPart && (
                <Tooltip
                  label={`${projectGroup?.name} : ${projectVersion || 'N/A'}`}
                >
                  <Box>
                    <LynkBadge color='blue' title='Part' />
                  </Box>
                </Tooltip>
              )}
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
              <LuCircleCheck fontSize={20} color={primarySuccessColor} />
            ) : (
              <LuCircleX fontSize={20} color={primaryErrorColor} />
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
              <LuCircleCheck fontSize={20} color={primarySuccessColor} />
            ) : (
              <LuCircleX fontSize={20} color={primaryErrorColor} />
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
    setSourcePreferences,
    sourcePreferences,
    params?.sbomid,
    primaryTextColor,
    onEdit,
    primarySuccessColor,
    primaryErrorColor
  ])

  return columns
}

export default AttributionReportsColumns
