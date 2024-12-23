import { getFullDateAndTime } from 'utils'
import { infoData } from 'variables/general'

import { Grid, GridItem } from '@chakra-ui/react'
import { Flex, Skeleton, Stack, Tag, TagLabel, Text } from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import InfoLabel from 'components/Misc/InfoLabel'
import SupplierTag from 'components/SupplierTag'

const General = ({ data, loading, error }) => {
  const { suppliers, licensesExp, authors, creationAt, tools } = data || ''

  const tagStyle = { width: 'fit-content', size: 'md', variant: 'subtle' }

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    return result?.desc
  }

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
      <Grid
        width={'100%'}
        alignItems={'center'}
        templateColumns='repeat(12, 1fr)'
      >
        {/* CREATED AT */}
        <GridItem colSpan={2} py={3} w='100%'>
          <InfoLabel title={`Created At`} onCheck={onCheck('Created At')} />
        </GridItem>
        <GridItem colSpan={10} py={3} w='100%'>
          <Text fontSize={'sm'}>
            {creationAt ? getFullDateAndTime(creationAt) : 'N/A'}
          </Text>
        </GridItem>
        {/* CREATION TOOLS */}
        <GridItem colSpan={2} py={3} w='100%'>
          <InfoLabel
            title={`Creation Tool`}
            onCheck={onCheck('Creation Tool')}
          />
        </GridItem>
        <GridItem colSpan={10} py={3} w='100%'>
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
        </GridItem>
        {/* AUTHORS */}
        <GridItem colSpan={2} py={3} w='100%'>
          <InfoLabel title={`Authors`} onCheck={onCheck('Authors')} />
        </GridItem>
        <GridItem colSpan={10} py={3} w='100%'>
          <Stack spacing={2} direction={'column'}>
            {authors?.length > 0 ? (
              authors.map((item, index) => (
                <Tag key={index} colorScheme='blue' sx={tagStyle}>
                  <TagLabel>
                    {item?.name} - {item?.email}
                  </TagLabel>
                </Tag>
              ))
            ) : (
              <Tag sx={tagStyle}>N/A</Tag>
            )}
          </Stack>
        </GridItem>
        {/* SUPPLIERS */}
        <GridItem colSpan={2} py={3} w='100%'>
          <InfoLabel title={`Supplier`} onCheck={onCheck('Supplier')} />
        </GridItem>
        <GridItem colSpan={10} py={3} w='100%'>
          {suppliers?.length > 0 ? (
            suppliers.map((item, index) => (
              <SupplierTag key={index} item={item} editable={false} />
            ))
          ) : (
            <Tag sx={tagStyle}>N/A</Tag>
          )}
        </GridItem>
        {/* DATA LICENSES */}
        <GridItem colSpan={2} py={3} w='100%'>
          <Text fontSize={'sm'}>Data License</Text>
        </GridItem>
        <GridItem colSpan={10} py={3} w='100%'>
          {licensesExp && licensesExp !== '' ? (
            <Tag my={2} colorScheme='green' sx={tagStyle}>
              <TagLabel>{licensesExp}</TagLabel>
            </Tag>
          ) : (
            <Tag sx={tagStyle}>N/A</Tag>
          )}
        </GridItem>
      </Grid>
    </CardBody>
  )
}

export default General
