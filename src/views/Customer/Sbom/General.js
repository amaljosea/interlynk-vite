import { useState } from 'react'
import { getFullDateAndTime } from 'utils'
import { infoData } from 'variables/general'

import { InfoIcon } from '@chakra-ui/icons'
import {
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  Link,
  Skeleton,
  Stack,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import InfoModal from 'components/InfoModal'

const InfoLabel = ({ title, onClick }) => {
  return (
    <Flex flexDirection={'row'} alignItems={'center'} gap={2.5}>
      <Text fontSize={'sm'}>{title}</Text>
      <Icon
        as={InfoIcon}
        color={'blue.500'}
        cursor={'pointer'}
        onClick={onClick}
      />
    </Flex>
  )
}

const General = ({ data, loading, error }) => {
  const { suppliers, licensesExp, licenses, authors, creationAt, tools } =
    data || ''
  const textColor = useColorModeValue('#E2E8F0', '#1A202C')
  const border = `1px solid ${textColor}`

  const [infoHeading, setInfoHeading] = useState('')
  const [infoText, setInfoText] = useState('')
  const [infoUrl, setInfoUrl] = useState('')

  const {
    isOpen: isInfoOpen,
    onOpen: onInfoOpen,
    onClose: onInfoClose
  } = useDisclosure()

  const onCheck = (title) => {
    const result = infoData.find((item) => item?.title === title)
    setInfoHeading(result?.title)
    setInfoText(result?.desc)
    setInfoUrl('')
    onInfoOpen()
  }

  const onCheckDate = () => onCheck(`Created At`)
  const onCheckTool = () => onCheck(`Creation Tool`)
  const onCheckAuthor = () => onCheck(`Authors`)
  const onCheckSupplier = () => onCheck(`Supplier`)

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
    <>
      <CardBody>
        <Grid mt={2} width={'100%'} templateColumns='repeat(2, 1fr)'>
          {/* CREATED AT */}
          <GridItem py={3} borderTop={border} w='100%'>
            <InfoLabel title={`Created At`} onClick={onCheckDate} />
          </GridItem>
          <GridItem py={3} borderTop={border} w='100%'>
            <Text fontSize={'sm'}>{getFullDateAndTime(creationAt)}</Text>
          </GridItem>
          {/* CREATION TOOLS */}
          <GridItem py={3} borderY={border} w='100%'>
            <InfoLabel title={`Creation Tool`} onClick={onCheckTool} />
          </GridItem>
          <GridItem py={3} borderY={border} w='100%'>
            <Flex
              flexDirection={'row'}
              alignItems={'flex-start'}
              flexWrap={'wrap'}
              gap={2.5}
            >
              {tools &&
                tools.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='teal'
                    width={'fit-content'}
                  >
                    <TagLabel>
                      {item.name} - {item.version}
                    </TagLabel>
                  </Tag>
                ))}
            </Flex>
          </GridItem>
          {/* AUTHORS */}
          <GridItem py={3} borderBottom={border} w='100%'>
            <InfoLabel title={`Authors`} onClick={onCheckAuthor} />
          </GridItem>
          <GridItem py={3} borderBottom={border} w='100%'>
            <Stack spacing={2} direction={'column'}>
              {authors &&
                authors.length > 0 &&
                authors.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='blue'
                    width={'fit-content'}
                  >
                    <TagLabel>
                      {item.name} - {item.email}
                    </TagLabel>
                  </Tag>
                ))}
            </Stack>
          </GridItem>
          {/* SUPPLIERS */}
          <GridItem py={3} borderBottom={border} w='100%'>
            <InfoLabel title={`Supplier`} onClick={onCheckSupplier} />
          </GridItem>
          <GridItem py={3} borderBottom={border} w='100%'>
            <HStack spacing={4}>
              {suppliers?.length > 0 &&
                suppliers.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='orange'
                  >
                    <TagLabel>
                      {item?.contactName || ''}
                      {item?.contactEmail && ` (${item.contactEmail})`}
                      {item.url ? (
                        <Link
                          href={
                            item?.url?.startsWith('http')
                              ? item.url
                              : `http://${item.url}`
                          }
                          isExternal
                        >
                          {' '}
                          {item?.name || ''}
                        </Link>
                      ) : (
                        ` ${item?.name || ''}`
                      )}
                    </TagLabel>
                  </Tag>
                ))}
            </HStack>
          </GridItem>
          {/* DATA LICENSES */}
          <GridItem py={3} borderBottom={border} w='100%'>
            <Text fontSize={'sm'}>Data License</Text>
          </GridItem>
          <GridItem py={3} borderBottom={border} w='100%'>
            <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
              {/* SPDX */}
              {licenses?.length > 0 &&
                licenses?.map((item, index) => (
                  <Tag
                    size={'md'}
                    key={index}
                    variant='subtle'
                    colorScheme='green'
                    width={'fit-content'}
                  >
                    <TagLabel>{item}</TagLabel>
                  </Tag>
                ))}
              {/* EXPRESSION */}
              {licensesExp && licensesExp !== '' && (
                <Tag
                  my={2}
                  size={'md'}
                  variant='subtle'
                  colorScheme='green'
                  width={'fit-content'}
                >
                  <TagLabel>{licensesExp}</TagLabel>
                </Tag>
              )}
            </Flex>
          </GridItem>
        </Grid>
      </CardBody>

      {/* INFO MODAL */}
      {isInfoOpen && (
        <InfoModal
          isOpen={isInfoOpen}
          onClose={onInfoClose}
          heading={infoHeading}
          body={infoText}
          url={infoUrl}
        />
      )}
    </>
  )
}

export default General
