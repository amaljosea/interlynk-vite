import { AddIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Select,
  Stack,
  Table,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr
} from '@chakra-ui/react'
import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import NodeElement from 'components/NodeElement'
import { useState } from 'react'
import Tree from 'react-d3-tree'

const RelationshipDrawer = ({ isOpen, onClose, data }) => {
  const { name, version } = data

  const [createRelation, setCreateRelation] = useState(false)
  const [relation, setRelation] = useState('')
  const [component, setComponent] = useState('')

  const [dependencyOf, setDependencyOf] = useState([
    'Microsoft.Graph.Core 2.0.8'
  ])

  const [dependsOn, setDependsOn] = useState([
    'Microsoft.Bcl.AsyncInterfaces 1.1.1',
    'System.Diagnostics.DiagnosticSource 6.0.0',
    'System.Memory.Data 1.0.2'
  ])

  const handleSubmit = () => {
    if (relation === 'Dependency Of') {
      setDependencyOf((prevData) => [component, ...prevData])
    }
    if (relation === 'Depends On') {
      setDependsOn((prevData) => [component, ...prevData])
    }

    setCreateRelation(false)
  }

  const handleRemove = (relation, comp) => {
    if (relation === 'Dependency Of') {
      const compData = dependencyOf.filter((_, index) => index !== comp)
      setDependencyOf(compData)
    }
    if (relation === 'Depends On') {
      const compData = dependsOn.filter((_, index) => index !== comp)
      setDependsOn(compData)
    }
  }

  const orgChart = {
    name: 'Azure.Core',
    children: [
      {
        name: 'Dependency Of',
        children: [
          {
            name: 'Microsoft.Graph.Core 2.0.8'
          },
          {
            name: 'Azure.Identity'
          }
        ]
      },
      {
        name: 'Depends On',
        children: [
          {
            name: 'Microsoft.Bcl.AsyncInterfaces 1.1.1'
          },
          {
            name: 'System.Diagnostics.DiagnosticSource 6.0.0'
          },
          {
            name: 'System.Memory.Data 1.0.2'
          }
        ]
      }
    ]
  }

  const [appState] = useState({
    data: orgChart,
    orientation: 'horizontal',
    dimensions: undefined,
    centeringTransitionDuration: 800,
    translateX: 200,
    translateY: 300,
    collapsible: true,
    shouldCollapseNeighborNodes: false,
    initialDepth: 1,
    depthFactor: undefined,
    zoomable: true,
    draggable: true,
    zoom: 1,
    scaleExtent: { min: 0.1, max: 1 },
    separation: { siblings: 2, nonSiblings: 2 },
    nodeSize: { x: 200, y: 100 },
    enableLegacyTransitions: false,
    transitionDuration: 500,
    styles: {
      nodes: {
        node: {
          circle: {
            fill: '#52e2c5'
          },
          attributes: {
            stroke: '#000'
          }
        },
        leafNode: {
          circle: {
            fill: 'transparent'
          },
          attributes: {
            stroke: '#000'
          }
        }
      }
    }
  })

  return (
    <Drawer
      size='xl'
      isOpen={isOpen}
      placement='right'
      onClose={onClose}
      closeOnOverlayClick={true}
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth='1px' color='gray.600'>
          Edit Relationship
        </DrawerHeader>
        <DrawerBody>
          <Card px={0} mx={0}>
            <CardHeader>
              <Stack
                width='100%'
                direction={'row'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <Text fontSize={'lg'} fontWeight={'medium'}>
                  {name} - {version}
                </Text>
                <Tooltip placement='left' label='Add Relationship'>
                  <IconButton
                    icon={<AddIcon />}
                    colorScheme='blue'
                    variant='solid'
                    fontWeight='normal'
                    size='md'
                    onClick={() => {
                      setCreateRelation(true)
                      setRelation('')
                      setComponent('')
                    }}
                  />
                </Tooltip>
              </Stack>
            </CardHeader>
            <CardBody>
              <Flex
                flexDir={'column'}
                alignItems={'flex-start'}
                width={'100%'}
                gap={4}
              >
                {/* CREATE RELATIONSHIP */}
                {createRelation && (
                  <Stack
                    width={'100%'}
                    direction={'column'}
                    alignItems={'flex-start'}
                    gap={2}
                    mt={6}
                  >
                    <FormControl>
                      <FormLabel htmlFor='relation' color='gray.600'>
                        Relation
                      </FormLabel>
                      <Select
                        id='relation'
                        size='sm'
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                      >
                        <option value=''>-- Select --</option>
                        {['Dependency Of', 'Depends On'].map((item, idx) => (
                          <option key={idx} value={item.relation}>
                            {item}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor='component' color='gray.600'>
                        Component
                      </FormLabel>
                      <Select
                        id='component'
                        size='sm'
                        value={component}
                        onChange={(e) => setComponent(e.target.value)}
                      >
                        <option value=''>-- Select --</option>
                        {[
                          'System.Xml.XDocument',
                          'System.Xml.ReaderWriter',
                          'System.Windows.Extensions',
                          'System.Text.Encoding',
                          'System.Text.Encodings.Web'
                        ].map((item, idx) => (
                          <option key={idx} value={item}>
                            {item}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      size='md'
                      mt={2}
                      width={'fit-content'}
                      colorScheme='blue'
                      onClick={handleSubmit}
                    >
                      Add
                    </Button>
                  </Stack>
                )}
                <Box
                  width={'100%'}
                  height={'100vh'}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Tree
                    rootNodeClassName='demo-node'
                    branchNodeClassName='demo-node'
                    data={appState.data}
                    orientation={appState.orientation}
                    dimensions={appState.dimensions}
                    centeringTransitionDuration={
                      appState.centeringTransitionDuration
                    }
                    translate={{
                      x: appState.translateX,
                      y: appState.translateY
                    }}
                    pathFunc={appState.pathFunc}
                    collapsible={appState.collapsible}
                    initialDepth={appState.initialDepth}
                    zoomable={appState.zoomable}
                    draggable={appState.draggable}
                    zoom={appState.zoom}
                    scaleExtent={appState.scaleExtent}
                    nodeSize={appState.nodeSize}
                    separation={appState.separation}
                    enableLegacyTransitions={appState.enableLegacyTransitions}
                    transitionDuration={appState.transitionDuration}
                    depthFactor={appState.depthFactor}
                    styles={appState.styles}
                    shouldCollapseNeighborNodes={
                      appState.shouldCollapseNeighborNodes
                    }
                    renderCustomNodeElement={(rd3tProps) => (
                      <NodeElement
                        nodeDatum={rd3tProps.nodeDatum}
                        toggleNode={rd3tProps.toggleNode}
                        orientation={appState.orientation}
                      />
                    )}
                  />
                </Box>
                {/* COMONENT RELATIONSIP DATA */}
                {/* <Table mt={6} width={'100%'}>
                  <Thead>
                    <Tr>
                      {['Relation', 'Component'].map((item, index) => (
                        <Th key={index} pl={0} width={'100px'}>
                          <Box>{item}</Box>
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td pl={0}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Dependency Of
                        </Text>
                      </Td>
                      <Td pl={0}>
                        <Stack direction={'column'}>
                          {dependencyOf.map((comp, index) => (
                            <Tag
                              size={'sm'}
                              key={index}
                              variant='subtle'
                              colorScheme='blue'
                              width={'fit-content'}
                            >
                              <TagLabel>{comp}</TagLabel>
                              <TagCloseButton
                                onClick={() =>
                                  handleRemove('Dependency Of', index)
                                }
                              />
                            </Tag>
                          ))}
                        </Stack>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td pl={0}>
                        <Text fontSize='xs' fontWeight={'medium'}>
                          Depends On
                        </Text>
                      </Td>
                      <Td pl={0}>
                        <Stack direction={'column'}>
                          {dependsOn.map((comp, index) => (
                            <Tag
                              size={'sm'}
                              key={index}
                              variant='subtle'
                              colorScheme='blue'
                              width={'fit-content'}
                            >
                              <TagLabel>{comp}</TagLabel>
                              <TagCloseButton
                                onClick={() =>
                                  handleRemove('Depends On', index)
                                }
                              />
                            </Tag>
                          ))}
                        </Stack>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table> */}
              </Flex>
            </CardBody>
          </Card>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default RelationshipDrawer
