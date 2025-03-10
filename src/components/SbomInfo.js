import { getFullDate, truncatedValue } from 'utils'

import { Flex, Stack, Text } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Tag, TagLabel } from '@chakra-ui/react'

import { useThemeColor } from 'hooks/useThemeColors'

import SupplierTag from './SupplierTag'

const SbomInfo = ({ data }) => {
  const { sameSecondaryText, grayBorderColor } = useThemeColor([
    'sameSecondaryText',
    'grayBorderColor'
  ])

  const label = { color: sameSecondaryText }

  const container = {
    pb: 3,
    gap: 5,
    w: '100%',
    fontSize: 'sm',
    templateColumns: `repeat(12, 1fr)`,
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const sbomData = [
    {
      label: 'Created At',
      value: <Text>{getFullDate(data?.creationAt)}</Text>
    },
    {
      label: 'Creation Tool',
      value: (
        <Flex gap={2} flexWrap={'wrap'} alignItems={'center'}>
          {data?.tools?.length > 0 ? (
            data?.tools.map((item, index) => (
              <Tag key={index} colorScheme='teal'>
                <TagLabel>
                  {item?.name} - {truncatedValue(item?.version, 15)}
                </TagLabel>
              </Tag>
            ))
          ) : (
            <TagLabel>N/A</TagLabel>
          )}
        </Flex>
      )
    },
    {
      label: 'Author',
      value: (
        <Flex gap={2} flexWrap={'wrap'} alignItems={'center'}>
          {data?.authors.length > 0 ? (
            data?.authors.map((item, index) => (
              <Tag key={index} colorScheme='blue' width={'fit-content'}>
                <TagLabel>
                  {item.name} {item?.email && `- ${item.email}`}
                </TagLabel>
              </Tag>
            ))
          ) : (
            <Tag>N/A</Tag>
          )}
        </Flex>
      )
    },
    {
      label: 'Supplier',
      value: (
        <Flex>
          {data?.suppliers?.length > 0 ? (
            data?.suppliers.map((item, index) => (
              <SupplierTag key={index} item={item} editable={false} />
            ))
          ) : (
            <Tag>N/A</Tag>
          )}
        </Flex>
      )
    },
    {
      label: 'Data License',
      value: (
        <Tag
          size={'md'}
          variant='subtle'
          colorScheme='green'
          width={'fit-content'}
        >
          <TagLabel>{data?.licensesExp || 'N/A'}</TagLabel>
        </Tag>
      )
    }
  ]

  return (
    <Stack spacing={3} mt={8}>
      {sbomData?.map((item, index) => (
        <Grid key={index} {...container}>
          <GridItem colSpan={3}>
            <Text {...label}>{item?.label}</Text>
          </GridItem>
          <GridItem colSpan={9}>{item?.value}</GridItem>
        </Grid>
      ))}
    </Stack>
  )
}

export default SbomInfo
