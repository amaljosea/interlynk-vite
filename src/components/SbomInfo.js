import { getFullDateAndTime } from 'utils'

import {
  Flex,
  HStack,
  Link,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react'

const SbomInfo = ({ data }) => {
  return (
    <TableContainer overflowY={'scroll'}>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody fontSize={'sm'}>
          {/* CREATION TOOLS */}
          <Tr>
            <Td pl={0}>Creation Tool</Td>
            <Td>
              <Flex
                flexDirection={'row'}
                alignItems={'flex-start'}
                flexWrap={'wrap'}
                gap={2.5}
              >
                {data?.tools &&
                  data?.tools.map((item, index) => (
                    <Text key={index}>
                      {item.name} - {item.version}
                    </Text>
                  ))}
              </Flex>
            </Td>
          </Tr>
          {/* CREATED AT */}
          <Tr>
            <Td pl={0}>Created At</Td>
            <Td>{getFullDateAndTime(data?.creationAt)}</Td>
          </Tr>
          {/* AUTHOR */}
          <Tr>
            <Td pl={0}>Author</Td>
            <Td>
              <Stack spacing={2} direction={'column'}>
                {data?.authors.length > 0 &&
                  data?.authors.map((item, index) => (
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
            </Td>
          </Tr>
          {/* SUPPLOER */}
          <Tr>
            <Td pl={0}>Supplier</Td>
            <Td>
              <HStack spacing={4}>
                {data?.suppliers?.length > 0 &&
                  data?.suppliers.map((item, index) => (
                    <Tag
                      size={'md'}
                      key={index}
                      variant='subtle'
                      colorScheme='orange'
                    >
                      <TagLabel>
                        {item.contactName}
                        {item.contactEmail && ` (${item.contactEmail})`}
                        {item.url ? (
                          <Link
                            href={
                              item?.url?.startsWith('http')
                                ? item.url
                                : `http://${item.url}`
                            }
                            isExternal
                          >
                            {item.name}
                          </Link>
                        ) : (
                          ` ${item.name}`
                        )}
                      </TagLabel>
                    </Tag>
                  ))}
              </HStack>
            </Td>
          </Tr>
          {/* DATA LICENSE */}
          <Tr>
            <Td pl={0}>Data License</Td>
            <Td>
              <Flex alignItems={'center'} gap={2} flexWrap={'wrap'}>
                {/* SPDX */}
                {data.licenses?.length > 0 &&
                  data.licenses?.map((item, index) => (
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
                {data.licensesExp && data.licensesExp !== '' && (
                  <Tag
                    size={'md'}
                    variant='subtle'
                    colorScheme='green'
                    width={'fit-content'}
                  >
                    <TagLabel>{data.licensesExp}</TagLabel>
                  </Tag>
                )}
                {/* CUSTOM */}
                {data.licensesCustom?.length > 0 &&
                  data.licensesCustom.map((item, index) => (
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
              </Flex>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default SbomInfo
