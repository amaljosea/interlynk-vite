// Chakra imports
import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useColorModeValue
} from '@chakra-ui/react'
// Custom components
import Card from 'components/Card/Card.js'
import CardBody from 'components/Card/CardBody.js'
import ProductVersionsRow from 'components/Tables/ProductVersionsRow.js'
import React from 'react'

const ProductVersions = ({
  captions,
  allProjects,
  handlePreviousPage,
  handleNextPage,
  fetchProjects,
  isLoading
}) => {
  const textColor = useColorModeValue('gray.700', 'white')

  return (
    <Card my='22px' overflowX={{ sm: 'scroll', xl: 'hidden' }}>
      <CardBody>
        <Table variant='simple' color={textColor} size='sm'>
          <Thead>
            <Tr my='.8rem'>
              {captions.map((caption, idx) => {
                return (
                  <Th color='gray.800' key={idx} pl={0}>
                    <Box>{caption}</Box>
                  </Th>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {allProjects.projects.nodes.length > 0 &&
              allProjects.projects.nodes.map((pv, index) => {
                return (
                  <ProductVersionsRow
                    key={index}
                    id={pv.id}
                    sbomId={pv.sboms}
                    name={pv.name}
                    description={pv.description}
                    updatedAt={pv.updatedAt}
                    allProjects={allProjects}
                    fetchProjects={fetchProjects}
                    isLoading={isLoading}
                  />
                )
              })}
          </Tbody>
        </Table>
      </CardBody>

      {allProjects && (
        <Flex
          flexDir={'row'}
          gap={4}
          alignItems={'center'}
          mt={6}
          justifyContent={'flex-start'}
        >
          <Button
            colorScheme='blue'
            onClick={handlePreviousPage}
            isDisabled={!allProjects.projects.pageInfo.hasPreviousPage}
          >
            Previous
          </Button>
          <Button
            colorScheme='blue'
            onClick={handleNextPage}
            isDisabled={!allProjects.projects.pageInfo.hasNextPage}
          >
            Next
          </Button>
        </Flex>
      )}
    </Card>
  )
}

export default ProductVersions

// filterData.length !== 0 &&
