import { useQuery } from '@apollo/client'
import React, { useCallback, useEffect, useState } from 'react'
import Tree from 'react-d3-tree'
import { useParams } from 'react-router-dom'

import {
  Alert,
  Box,
  Flex,
  IconButton,
  Stack,
  Tag,
  Text,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'

import { GetCompDependency } from 'graphQL/Queries'
import { GetShareCompDependency } from 'graphQL/Queries'

import { BiZoomIn, BiZoomOut } from 'react-icons/bi'

const containerStyles = { width: '100vw', height: '80vh' }

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

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
  activeComp,
  bgColor,
  textColor
}) => {
  console.log('nodeDatum', nodeDatum)
  return (
    <g transform="translate(-56,-50)">
      <svg xmlns='http://www.w3.org/2000/svg'>
        <circle cx='50' cy='50' r='25' fill='dodgerBlue' stroke='transparent' />
        <text
          x='50'
          y='52'
          stroke='white'
          fontSize={20}
          strokeWidth={0.9}
          textAnchor='middle'
          fontFamily='inherit'
          dominantBaseline='middle'
        >
          {nodeDatum?.children?.length || 0}
        </text>
      </svg>
      <foreignObject {...foreignObjectProps} x={40} y={24}>
        <Flex width={'100%'} flexDirection={'column'} alignItems={'flex-start'}>
          <Box
            p={3}
            left={12}
            bg={bgColor}
            minW={'fit-content'}
            maxW={'300px'}
            position={'relative'}
            fontWeight={'medium'}
            colorScheme='blue'
            wordBreak={'break-all'}
            borderRadius={5}
            color={textColor}
          >
            <Stack direction={'column'}>
              <Text
                fontSize={20}
                fontWeight={'semibold'}
                wordBreak={'break-all'}
                lineHeight={1.3}
              >
                {nodeDatum?.name}
              </Text>
              {activeComp === null && !nodeDatum?.attributes?.version && (
                <Tag size='sm' width={'fit-content'}>
                  Primary
                </Tag>
              )}
            </Stack>
            {nodeDatum.attributes?.version && (
              <Text opacity={0.8} mt={1} fontSize={16} colorScheme='blue'>
                {nodeDatum.attributes?.version}
              </Text>
            )}
          </Box>
        </Flex>
      </foreignObject>
    </g>
  )
}

const GraphView = ({ data, activeComp }) => {
  const params = useParams()
  const sbomId = params.sbomid
  const signedUrlParams = sessionStorage.getItem('signedUrlParams')

  const bgColor = useColorModeValue('gray.100', 'gray.800')
  const textColor = useColorModeValue('blue.500', 'gray.100')

  const [treeView, setTreeView] = useState(null)
  const [zoom, setZoom] = useState(Number(0.6))
  const position = { x: 20, y: 250 }
  const [containerRef] = useCenteredTree()

  const nodeSize = { x: 1000, y: 500 }
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -10,
    y: 12
  }

  const { data: compDependency } = useQuery(
    signedUrlParams ? GetShareCompDependency : GetCompDependency,
    {
      skip: data?.nodes?.length > 0 || activeComp ? false : true,
      fetchPolicy: 'network-only',
      variables: {
        compId: activeComp?.id || data?.nodes[0]?.id,
        sbomId: signedUrlParams ? undefined : sbomId
      }
    }
  )

  const handleZoomIn = () => setZoom(zoom + Number(0.1))
  const handleZoomOut = () => setZoom(zoom - Number(0.1))

  useEffect(() => {
    if (compDependency) {
      if (signedUrlParams) {
        const dependsOnNodes =
          compDependency?.shareLynkQuery?.component?.dependsOn?.map(
            (relation) => ({
              name: relation.toComp.name,
              attributes: { version: relation.toComp.version }
            })
          )
        const data = {
          name:
            compDependency?.shareLynkQuery?.component?.name ||
            compDependency?.shareLynkQuery?.component?.version ||
            '----',
          children: dependsOnNodes
        }
        setTreeView(data)
      } else {
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
    }
  }, [compDependency, signedUrlParams])

  return (
    <Flex flexDir={'column'} gap={6} overflow='hidden'>
      <Flex
        gap={2}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'flex-end'}
      >
        <Tooltip label='Zoom In'>
          <IconButton
            size='sm'
            variant='outline'
            onClick={handleZoomIn}
            isDisabled={zoom > 0.8}
            icon={<BiZoomIn size={20} />}
          />
        </Tooltip>
        <Tooltip label='Zoom Out'>
          <IconButton
            size='sm'
            variant='outline'
            onClick={handleZoomOut}
            isDisabled={zoom < 0.2}
            icon={<BiZoomOut size={20} />}
          />
        </Tooltip>
      </Flex>
      {data?.nodes?.length === 0 && !compDependency ? (
        <Alert>No relationship found</Alert>
      ) : (
        <Box style={containerStyles} ref={containerRef}>
          {treeView && (
            <Tree
              data={treeView}
              translate={position}
              zoom={Number(zoom)}
              initialDepth='2'
              separation={{ nonSiblings: 1, siblings: 1 }}
              depthFactor='650'
              enableLegacyTransitions={true}
              pathFunc={'step'}
              renderCustomNodeElement={(rd3tProps) =>
                renderForeignObjectNode({
                  ...rd3tProps,
                  foreignObjectProps,
                  activeComp,
                  bgColor,
                  textColor
                })
              }
            />
          )}
        </Box>
      )}
    </Flex>
  )
}

export default GraphView
