import { Alert, Box, Flex, Heading, Text } from '@chakra-ui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { GetCompDependency } from 'graphQL/Queries'
import { useLocation } from 'react-router-dom'
import Card from 'components/Card/Card'
import { useQuery } from '@apollo/client'
import Tree from 'react-d3-tree'

const containerStyles = { width: '100vw', height: '50vh'}

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

const renderForeignObjectNode = ({ nodeDatum, toggleNode, foreignObjectProps }) => (
  <g>
    <circle strokeOpacity={0.5} r='15' onClick={toggleNode} />
    <foreignObject {...foreignObjectProps}>
      <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'}>
        <Box top={1} p={2} bg={'blue.500'} width={'180px'} position={'relative'} fontWeight={'medium'} colorScheme='blue' wordBreak={'break-all'} borderRadius={5} color={'white'}>
          <Text fontSize={'sm'} wordBreak={'break-all'} lineHeight={1.3}>{nodeDatum?.name}</Text>
          {nodeDatum.attributes?.version && (
            <Text opacity={0.8} mt={2} fontSize='xs' colorScheme='blue'>{nodeDatum.attributes?.version}</Text>
          )}
        </Box>
      </Flex>
    </foreignObject>
  </g>
)

const GraphView = ({ data }) => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const sbomId = queryParams.get('sbom')

  const [treeView, setTreeView] = useState(null)
  const [dimensions, translate, containerRef] = useCenteredTree()

  const nodeSize = { x: 500, y: 200 }
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -25, y: 12 }
  const separation = { siblings: 1.5, nonSiblings: 2 }

  const { data: compDependency } = useQuery(GetCompDependency, {
    skip: data?.nodes?.length > 0 ? false : true,
    variables: { compId: data?.nodes?.length > 0 && data?.nodes[0]?.id, sbomId: sbomId }
  })

  useEffect(() => {
    if (compDependency) {
      // console.log('compDependency', compDependency)
      const dependencyOfNodes = compDependency?.component?.dependencyOf?.map(
        (relation) => ({ name: relation.fromComp.name, attributes: { version: relation.fromComp.version }}) )
      const dependsOnNodes = compDependency?.component?.dependsOn?.map(
        (relation) => ({ name: relation.toComp.name, attributes: { version: relation.toComp.version } }) )
      const data = {
        name: compDependency?.component?.name || compDependency?.component?.version || '----',
        children: [{ name: 'Dependency Of', children: dependencyOfNodes }, { name: 'Depends On', children: dependsOnNodes }]
      }
      setTreeView(data)
    }
  }, [compDependency])

  return (
    <Card overflow='hidden'>
      <Heading size='md' fontWeight={'medium'} mb={6}>Graph View</Heading>
      {data?.nodes?.length === 0 && !compDependency ? (
        <Alert>Relation doesn't exists</Alert>
      ) : (
        <Box style={containerStyles} ref={containerRef}>
          {treeView && (
            <Tree
              data={treeView}
              dimensions={dimensions}
              translate={translate}
              renderCustomNodeElement={(rd3tProps) => renderForeignObjectNode({...rd3tProps, foreignObjectProps })}
              orientation='vertical'
              separation={separation}
            />
          )}
        </Box>
      )}
    </Card>
  )
}

export default GraphView
