import { getFullDate } from 'utils'
import { infoData } from 'variables/general'

import { Grid, GridItem, Tooltip } from '@chakra-ui/react'
import { Flex, Skeleton, Stack, Tag, TagLabel, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import AuthorInfo from 'components/Misc/AuthorInfo'
import InfoLabel from 'components/Misc/InfoLabel'
import SupplierTag from 'components/SupplierTag'

import { useThemeColor } from 'hooks/useThemeColors'

const General = ({ data, loading, error }) => {
  const { suppliers, licensesExp, authors, creationAt, tools } = data || ''

  const { grayBorderColor } = useThemeColor(['grayBorderColor'])

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

  const tagStyle = { width: 'fit-content', size: 'md', variant: 'subtle' }

  const container = {
    pb: 3,
    gap: 5,
    w: '100%',
    fontSize: 'sm',
    alignItems: 'center',
    templateColumns: `repeat(12, 1fr)`,
    borderBottom: `1px solid ${grayBorderColor}`
  }

  const sbomData = [
    {
      label: 'Created At',
      value: <Text>{getFullDate(creationAt)}</Text>
    },
    {
      label: 'Creation Tool',
      value: (
        <Flex
          flexDirection={'row'}
          alignItems={'flex-start'}
          flexWrap={'wrap'}
          gap={2.5}
        >
          {tools?.length > 0 ? (
            tools.map((item, index) => (
              <Tag key={index} colorScheme='teal' sx={tagStyle}>
                <TagLabel>
                  {item.name} - {item.version}
                </TagLabel>
              </Tag>
            ))
          ) : (
            <Tag sx={tagStyle}>N/A</Tag>
          )}
        </Flex>
      )
    },
    {
      label: 'Authors',
      value: (
        <Stack spacing={2} direction={'column'}>
          {authors?.length > 0 ? (
            authors.map((item, index) => (
              <Tooltip key={index} label={<AuthorInfo item={item} />}>
                <Tag colorScheme='blue' sx={tagStyle}>
                  <TagLabel cursor={'pointer'}>
                    {item?.name} {item?.email && `- ${item?.email}`}
                  </TagLabel>
                </Tag>
              </Tooltip>
            ))
          ) : (
            <Tag sx={tagStyle}>N/A</Tag>
          )}
        </Stack>
      )
    },
    {
      label: 'Supplier',
      value:
        suppliers?.length > 0 ? (
          suppliers.map((item, index) => (
            <SupplierTag key={index} item={item} editable={false} />
          ))
        ) : (
          <Tag sx={tagStyle}>N/A</Tag>
        )
    },
    {
      label: 'Data License',
      value:
        licensesExp && licensesExp !== '' ? (
          <Tag my={2} colorScheme='green' sx={tagStyle}>
            <TagLabel>{licensesExp}</TagLabel>
          </Tag>
        ) : (
          <Tag sx={tagStyle}>N/A</Tag>
        )
    }
  ]

  if (loading) {
    return (
      <Flex mt={4} width={'100%'} flexDir={'column'} gap={4}>
        {[1, 2].map((_, index) => (
          <Skeleton key={index} width={'100%'} height='20px' />
        ))}
      </Flex>
    )
  }

  if (error) {
    return (
      <Card>
        <Text>Something went wrong</Text>
      </Card>
    )
  }

  return (
    <CardBody>
      <Stack w={'100%'} spacing={3} mt={2}>
        {sbomData?.map((item, index) => (
          <Grid key={index} {...container}>
            <GridItem colSpan={3}>
              <InfoLabel title={item?.label} onCheck={onCheck(item?.label)} />
            </GridItem>
            <GridItem colSpan={9}>{item?.value}</GridItem>
          </Grid>
        ))}
      </Stack>
    </CardBody>
  )
}

export default General
