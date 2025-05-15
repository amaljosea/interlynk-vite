import { useMemo } from 'react'
import { truncatedValue } from 'utils'

import { CheckCircleIcon, CloseIcon } from '@chakra-ui/icons'
import { Box, Flex, IconButton, Text } from '@chakra-ui/react'

import EditButton from 'components/Icons/EditButton'
import LynkSelect from 'components/LynkSelect'

import { useThemeColor } from 'hooks/useThemeColors'

const AttributionReportsColumns = ({ onEdit }) => {
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
    const sourceOptions = [
      { label: 'SBOM', value: 'sbom', isDisabled: false },
      { label: 'Library', value: 'library', isDisabled: true }
    ]
    return [
      // NAME
      {
        id: 'name',
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
        id: 'version',
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
            <Text fontSize={14} color={primaryTextColor}>
              {truncatedValue(row?.licensesExp || 'N/A', 30)}
            </Text>
            <IconButton
              icon={<EditButton size={16} />}
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'license')}
            />
          </Flex>
        ),
        width: '15%'
      },
      // NOTICE
      {
        id: 'notice',
        name: 'NOTICE',
        selector: (row) => (
          <Flex alignItems='center' gap={2}>
            {row?.notice ? (
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
            <IconButton
              icon={<EditButton size={16} />}
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'notice')}
            />
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
            {row?.copyright ? (
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
            <IconButton
              icon={<EditButton size={16} />}
              size='sm'
              variant='ghost'
              onClick={() => onEdit(row, 'copyright')}
            />
          </Flex>
        ),
        width: '10%'
      },
      // SOURCE
      {
        id: 'source',
        name: 'SOURCE',
        selector: () => (
          <LynkSelect
            options={sourceOptions}
            defaultValue={sourceOptions[0]} // Default is SBOM
            isSearchable={false}
            isClearable={false}
            dropDown={true}
          />
        ),
        width: '25%'
      }
    ]
  }, [
    primaryTextColor,
    primarySuccessColor,
    primaryErrorColor,
    primaryBgColor,
    onEdit
  ])

  return columns
}

export default AttributionReportsColumns
