import { useMemo } from 'react'
import {
  capitalizeFirstLetter,
  getFullDate,
  timeSince,
  truncatedValue
} from 'utils'
import { getChangelogColor } from 'utils/styleUtils'

import {
  Box,
  Flex,
  Stack,
  Tag,
  TagLabel,
  Text,
  Tooltip
} from '@chakra-ui/react'

import RowComponent from 'components/RowComponent'

import { useThemeColor } from 'hooks/useThemeColors'

const ChangelogColumns = (setActiveRow, onSelect, PURL, checkUser) => {
  const { primaryTextColor, primaryBlueText } = useThemeColor([
    'primaryTextColor',
    'primaryBlueText'
  ])

  return useMemo(() => {
    const columns = [
      // CHANGE TYPE
      {
        id: 'ACTIVITY_LOGS_ACTION',
        name: 'TYPE',
        selector: (row) => {
          const { action } = row
          return (
            <Tooltip
              placement='top'
              label={action}
              textTransform={'capitalize'}
            >
              <Tag
                variant='solid'
                colorScheme={getChangelogColor(action)}
                textTransform={'capitalize'}
                cursor={'pointer'}
              >
                {action.slice(0, 1)}
              </Tag>
            </Tooltip>
          )
        },
        sortable: true,
        wrap: true,
        width: '6%'
      },
      // CHANGED OBJECT
      {
        id: 'ACTIVITY_LOGS_EVENT',
        name: 'CHANGED',
        selector: (row) => {
          const { event, loggablePrefix, loggableType } = row
          const isComponent = loggableType === 'Component'
          return (
            <Stack my={3} spacing={1} direction={'column'}>
              {isComponent && loggablePrefix ? (
                <RowComponent content={loggablePrefix} />
              ) : (
                <Text
                  onClick={() => onSelect(row)}
                  sx={{ cursor: 'pointer', color: primaryBlueText }}
                >
                  {loggableType === 'Sbom' ? 'SBOM' : loggablePrefix}
                </Text>
              )}
              <Text color={primaryTextColor}>{event}</Text>
            </Stack>
          )
        },
        width: '25%',
        wrap: true,
        sortable: true
      },
      // PRIOR VALUE
      {
        id: 'priorValue',
        name: 'PREVIOUS VALUE',
        selector: (row) => {
          const { orig, event } = row
          const license =
            (event === 'licenses' || event === 'cpes') && JSON.parse(orig)
          const urls = event === 'external_urls' && JSON.parse(orig)

          if (event === 'purl') {
            return (
              <Text
                onClick={() => {
                  setActiveRow(orig)
                  PURL.onOpen()
                }}
                sx={{ my: 3, cursor: 'pointer', color: primaryTextColor }}
              >
                {orig || 'N/A'}
              </Text>
            )
          }

          return (
            <Flex flexWrap={'wrap'} gap={2} my={2} whiteSpace={'break-spaces'}>
              <Tooltip
                placement='top'
                label={license ? orig : ''}
                textTransform={'capitalize'}
              >
                <Box textOverflow={'wrap'}>
                  {orig === 'f' ? (
                    <Text color={primaryTextColor}>False</Text>
                  ) : orig === 't' ? (
                    <Text color={primaryTextColor}>True</Text>
                  ) : license?.length > 0 ? (
                    license.map((item, index) => (
                      <Flex
                        key={index}
                        sx={{
                          my: 2,
                          gap: 2,
                          direction: 'column',
                          flexWrap: 'wrap'
                        }}
                      >
                        <Tag
                          size={'sm'}
                          key={index}
                          variant='subtle'
                          colorScheme='red'
                          width={'fit-content'}
                        >
                          <TagLabel pt={1}>{item}</TagLabel>
                        </Tag>
                      </Flex>
                    ))
                  ) : license?.length === 0 ? (
                    <Text color={primaryTextColor}>N/A</Text>
                  ) : urls && urls.length > 0 ? (
                    urls.map((item, index) => (
                      <Flex
                        key={index}
                        sx={{
                          my: 2,
                          gap: 2,
                          direction: 'column',
                          flexWrap: 'wrap'
                        }}
                      >
                        <Tag
                          size={'sm'}
                          key={index}
                          variant='subtle'
                          colorScheme='green'
                          width={'fit-content'}
                        >
                          <TagLabel pt={1}>
                            {item.name} - {truncatedValue(item.url, 15)}
                          </TagLabel>
                        </Tag>
                      </Flex>
                    ))
                  ) : (
                    <Text color={primaryTextColor} whiteSpace={'wrap'}>
                      {orig || 'N/A'}
                    </Text>
                  )}
                </Box>
              </Tooltip>
            </Flex>
          )
        },
        wrap: true
      },
      // UPDATED VALUE
      {
        id: 'updatedValue',
        name: 'UPDATED VALUE',
        selector: (row) => {
          const { updated, event } = row

          const updatedValue =
            (event === 'licenses' || event === 'cpes') && JSON.parse(updated)
          const urls = event === 'external_urls' && JSON.parse(updated)

          if (event === 'purl') {
            return (
              <Text
                onClick={() => {
                  setActiveRow(updated)
                  PURL.onOpen()
                }}
                sx={{ my: 3, color: primaryTextColor, cursor: 'pointer' }}
              >
                {updated || 'N/A'}
              </Text>
            )
          }

          return (
            <Flex flexWrap={'wrap'} gap={2} my={2}>
              <Tooltip
                placement='top'
                label={updatedValue ? updated : ''}
                textTransform={'capitalize'}
                whiteSpace={'wrap'}
              >
                <Box>
                  {updated === 'f' ? (
                    <Text color={primaryTextColor}>False</Text>
                  ) : updated === 't' ? (
                    <Text color={primaryTextColor}>True</Text>
                  ) : updatedValue?.length > 0 ? (
                    <Flex my={2} gap={2} flexDir={'column'} flexWrap={'wrap'}>
                      {updatedValue.map((item, index) => (
                        <Tag
                          key={index}
                          size={'sm'}
                          variant='subtle'
                          colorScheme='green'
                          width={'fit-content'}
                        >
                          <TagLabel>{item}</TagLabel>
                        </Tag>
                      ))}
                    </Flex>
                  ) : updatedValue?.length === 0 ? (
                    <Text color={primaryTextColor}>N/A</Text>
                  ) : urls && urls.length > 0 ? (
                    <Flex my={2} gap={2} flexDir={'column'} flexWrap={'wrap'}>
                      {urls.map((item, index) => (
                        <Tag
                          size={'sm'}
                          key={index}
                          variant='subtle'
                          colorScheme='green'
                          width={'fit-content'}
                        >
                          <TagLabel>
                            {item.name} - {truncatedValue(item.url, 15)}
                          </TagLabel>
                        </Tag>
                      ))}
                    </Flex>
                  ) : (
                    <Text
                      color={primaryTextColor}
                      whiteSpace={'wrap'}
                      cursor={'pointer'}
                      onClick={() => onSelect(row)}
                    >
                      {updated || 'N/A'}
                    </Text>
                  )}
                </Box>
              </Tooltip>
            </Flex>
          )
        },
        wrap: true
      },
      // CHANGED BY
      {
        id: 'ACTIVITY_LOGS_CHANGED_BY',
        name: 'BY',
        selector: (row) => {
          const user = capitalizeFirstLetter(row?.changedBy)
          return (
            <Tooltip placement='top' label={user}>
              <Text
                cursor='pointer'
                color={primaryTextColor}
                onClick={() => checkUser(row)}
              >
                {user}
              </Text>
            </Tooltip>
          )
        },
        sortable: true,
        width: '12%',
        right: 'true',
        wrap: true
      },
      // CHANGED ON
      {
        id: 'ACTIVITY_LOGS_CREATED_AT',
        name: 'CHANGED',
        selector: (row) => (
          <Box width={'fit-content'}>
            <Tooltip label={getFullDate(row.updatedAt)} placement={'top'}>
              <Text
                cursor={'pointer'}
                color={primaryTextColor}
                width={'fit-content'}
              >
                {timeSince(row.updatedAt)}
              </Text>
            </Tooltip>
          </Box>
        ),
        sortable: true,
        sortFunction: (a, b) => {
          const dateA = new Date(a.updatedAt)
          const dateB = new Date(b.updatedAt)
          return dateA - dateB // Sort in descending order
        },
        width: '12%',
        right: 'true',
        wrap: true
      }
    ]

    return columns
  }, [
    setActiveRow,
    onSelect,
    PURL,
    primaryBlueText,
    primaryTextColor,
    checkUser
  ])
}

export default ChangelogColumns
