import { Alert, Box, Flex, IconButton, Stack, Tag, Text, Tooltip } from '@chakra-ui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { GetCompDependency } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import Card from 'components/Card/Card'
import { useQuery } from '@apollo/client'
import Tree from 'react-d3-tree'
import CardHeader from 'components/Card/CardHeader'
import { BiZoomIn, BiZoomOut } from 'react-icons/bi'

const containerStyles = { width: '100vw', height: '60vh' }

export const useCenteredTree = (defaultTranslate = { x: 0, y: 0 }) => {
  const [translate, setTranslate] = useState(defaultTranslate)
  const [dimensions, setDimensions] = useState()
  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width, height } = containerElem.getBoundingClientRect()
      setDimensions({ width, height })
      setTranslate({ x: width / 2, y: height / 2 })
    }
  }, [])
  return [dimensions, translate, containerRef]
}

const renderForeignObjectNode = ({ nodeDatum, toggleNode, foreignObjectProps, activeComp }) => {
  // console.log('nodeDatum', nodeDatum)
  return (
    <g>
      <circle fill={'dodgerblue'} r='20' onClick={toggleNode} />
      <foreignObject {...foreignObjectProps} y={-20}>
        <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'}>
          <Box p={3} left={12} bg={'blue.500'} minW={'fit-content'} maxW={'300px'} position={'relative'} fontWeight={'medium'} colorScheme='blue' wordBreak={'break-all'} borderRadius={5} color={'white'}>
            <Stack direction={'column'}>
              <Text wordBreak={'break-all'} lineHeight={1.3}>{nodeDatum?.name}</Text>
              {activeComp === null && !nodeDatum?.attributes?.version && (
                <Tag size='sm' width={'fit-content'}>Primary</Tag>
              )}
            </Stack>
            {nodeDatum.attributes?.version && (
              <Text opacity={0.8} mt={1} fontSize='sm' colorScheme='blue'>{nodeDatum.attributes?.version}</Text>
            )}
          </Box>
        </Flex>
      </foreignObject>
    </g>
  )
}

const GraphView = ({ data, activeComp }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')

  const [treeView, setTreeView] = useState(null)
  const [zoom, setZoom] = useState(Number(1))
  const [position, setPosition] = useState({ x: 100, y: 250 })
  const [dimensions, translate, containerRef] = useCenteredTree()

  const nodeSize = { x: 1000, y: 200 }
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -10,
    y: 12
  }
  const separation = { siblings: 1.5, nonSiblings: 2 }

  const { data: compDependency } = useQuery(GetCompDependency, {
    skip: data?.nodes?.length > 0 ? false : true,
    variables: {
      compId: activeComp?.id || data?.nodes[0]?.id,
      sbomId: sbomId
    }
  })

  const handleZoomIn = () => setZoom(zoom + Number(0.1))
  const handleZoomOut = () => setZoom(zoom - Number(0.1))

  useEffect(() => {
    if (compDependency) {
      // console.log('compDependency', compDependency)
      const dependencyOfNodes = compDependency?.component?.dependencyOf?.map(
        (relation) => ({
          name: relation.fromComp.name,
          attributes: { version: relation.fromComp.version }
        })
      )
      const dependsOnNodes = compDependency?.component?.dependsOn?.map(
        (relation) => ({
          name: relation.toComp.name,
          attributes: { version: relation.toComp.version }
        })
      )
      const data = {
        name:
          compDependency?.component?.name ||
          compDependency?.component?.version ||
          '----',
        children: dependsOnNodes
      }
      setTreeView(data)
    }
  }, [compDependency])

  return (
    <Card overflow='hidden'>
      <CardHeader mb={6}>
        <Flex width={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
          <Flex alignItems={'center'} gap={2}>
            <Tooltip label='Zoom In'>
              <IconButton colorScheme='blue' onClick={handleZoomIn} isDisabled={zoom > 0.8} icon={<BiZoomIn size={20} />} />
            </Tooltip>
            <Tooltip label='Zoom Out'>
              <IconButton colorScheme='blue' onClick={handleZoomOut} isDisabled={zoom < 0.2} icon={<BiZoomOut size={20} />} />
            </Tooltip>
          </Flex>
        </Flex>
      </CardHeader>
      {data?.nodes?.length === 0 && !compDependency ? (
        <Alert>Relation doesn't exists</Alert>
      ) : (
        <Box style={containerStyles} ref={containerRef}>
          {treeView && (
            <Tree
              data={treeView}
              translate={position}
              zoom={Number(zoom)}
              initialDepth='2'
              separation={{ nonSiblings: 1, siblings: 1 }}
              depthFactor='600'
              enableLegacyTransitions={true}
              pathFunc={'step'}
              renderCustomNodeElement={(rd3tProps) =>
                renderForeignObjectNode({
                  ...rd3tProps,
                  foreignObjectProps,
                  activeComp
                })
              }
            />
          )}
        </Box>
      )}
    </Card>
  )
}

export default GraphView
