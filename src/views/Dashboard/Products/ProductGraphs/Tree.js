import * as d3 from 'd3'
import bugIcon from 'assets/svg/bug.svg'
import { useEffect, useRef } from 'react'

import { useThemeColor } from 'hooks/useThemeColors'

const Tree = ({ data, targetComponent, targetVulnerability }) => {
  const svgRef = useRef()
  const {
    contrastTextColor,
    vibrantBlue,
    primaryErrorColor,
    secondaryTextColor,
    primaryBlueText,
    primaryBgColor
  } = useThemeColor([
    'contrastTextColor',
    'vibrantBlue',
    'primaryErrorColor',
    'secondaryTextColor',
    'primaryBlueText',
    'primaryBgColor'
  ])
  useEffect(() => {
    function collapsibleIndent(
      data,
      targetComponent,
      targetVulnerability,
      options = {}
    ) {
      const {
        indentSpacing = 22,
        lineSpacing = 32,
        duration = 300,
        radius = 6,
        minHeight = 20,
        boxSize = 12.5,
        ease = d3.easeQuadInOut,
        marginLeft = Math.round(boxSize / 2) + 1,
        marginRight = 120,
        marginTop = 10,
        marginBottom = 10
      } = options
      let plus = {
        shapeFill: primaryBlueText,
        shapeStroke: primaryBlueText,
        textFill: primaryBgColor,
        text: '+'
      }
      let minus = {
        shapeFill: primaryBgColor,
        shapeStroke: primaryBlueText,
        textFill: primaryBlueText,
        text: '−'
      }
      let tree = d3.tree().nodeSize([lineSpacing, indentSpacing])
      let root = d3.hierarchy(data)
      root.x0 = 0
      root.y0 = 0
      root.descendants().forEach((d, i) => {
        d.id = i
        d._children = d.children
        d.children = null // Collapse all nodes initially
      })
      // Find paths to all nodes containing the targetComponent or targetVulnerability
      function findPaths(node, target, paths = []) {
        if (node.data.name === target) {
          paths.push([node])
        }
        if (node._children) {
          for (let child of node._children) {
            let childPaths = findPaths(child, target)
            if (childPaths.length > 0) {
              childPaths.forEach((path) => path.unshift(node))
              paths.push(...childPaths)
            }
          }
        }
        return paths
      }
      const pathsToTargets = findPaths(root, targetComponent)
      const pathsToVulnerabilities = findPaths(root, targetVulnerability)
      // Expand paths to target components and vulnerabilities
      const expandPaths = (paths) => {
        paths.forEach((path) => {
          path.forEach((d) => {
            d.children = d._children
          })
        })
      }
      if (pathsToTargets) {
        expandPaths(pathsToTargets)
      }
      if (pathsToVulnerabilities) {
        expandPaths(pathsToVulnerabilities)
      }
      let index = -1
      root.eachBefore(() => {
        ++index
      })
      const width = 250
      const svg = d3.select(svgRef.current)
      svg.selectAll('*').remove()
      svg
        .attr('viewBox', [
          -marginLeft,
          -marginTop,
          width,
          Math.max(minHeight, index * lineSpacing + marginTop + marginBottom)
        ])
        // .style('font', '13px sans-serif')
        .style('user-select', 'none')
      const gLink = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.75)
      const gNode = svg
        .append('g')
        .attr('cursor', 'pointer')
        .attr('pointer-events', 'all')
      let indexLast
      function update(source) {
        const nodes = root.descendants().reverse()
        const links = root.links()
        tree(root)
        index = -1
        root.eachBefore(function (n) {
          n.x = ++index * lineSpacing
          n.y = n.depth * indentSpacing
        })
        const height = Math.max(
          minHeight,
          index * lineSpacing + marginTop + marginBottom
        )
        svg
          .transition()
          .delay(indexLast < index ? 0 : duration)
          .duration(0)
          .attr('viewBox', [-marginLeft, -marginTop, width, height])
        const node = gNode.selectAll('g').data(nodes, (d) => d.id)
        const nodeEnter = node
          .enter()
          .append('g')
          .attr('transform', (d) => `translate(${d.y},${source.x0})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .on('click', (event, d) => {
            d.children = d.children ? null : d._children
            update(d)
            charge
              .attr('fill', (d) =>
                d._children
                  ? d.children
                    ? minus.textFill
                    : plus.textFill
                  : 'none'
              )
              .text((d) =>
                d._children ? (d.children ? minus.text : plus.text) : ''
              )
            box.attr('fill', (d) =>
              d._children
                ? d.children
                  ? minus.shapeFill
                  : plus.shapeFill
                : 'none'
            )
          })
        let box = nodeEnter
          .append('rect')
          .attr('width', boxSize)
          .attr('height', boxSize)
          .attr('x', -boxSize / 2)
          .attr('y', -boxSize / 2)
          .attr('fill', (d) =>
            d._children
              ? d.children
                ? minus.shapeFill
                : plus.shapeFill
              : 'none'
          )
          .attr('stroke', (d) => (d._children ? primaryBlueText : 'none'))
          .attr('stroke-width', 0.9)
          .attr('rx', 1)
          .attr('ry', 1)
        let charge = nodeEnter
          .append('text')
          .attr('x', 0)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'central')
          .attr('fill', (d) =>
            d._children ? (d.children ? minus.textFill : plus.textFill) : 'none'
          )
          .text((d) => (d._children ? (d.children ? '−' : '+') : ''))
        let label = nodeEnter
          .append('text')
          .attr('x', 5 + boxSize / 2)
          .attr('text-anchor', 'start')
          .attr('dy', '0.32em')
          .attr('font-size', '14px')
          .attr('fill', (d) => {
            if (d.data.name === targetComponent) return primaryErrorColor
            if (d.data.name === targetVulnerability) return vibrantBlue
            return contrastTextColor
          })
          .attr('font-weight', (d) => {
            if (d.depth === 0) return '500'
            if (
              d.data.name === targetComponent ||
              d.data.name === targetVulnerability
            )
              return '400'
            return '300'
          })
          .text((d) => d.data.name)
        const iconSize = 20
        const iconMarginLeft = 18
        nodeEnter
          .filter((d) => d.data.name === targetVulnerability)
          .append('image')
          .attr(
            'x',
            (d) => label.node().getComputedTextLength() + iconMarginLeft
          )
          .attr('y', -iconSize / 2)
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('href', bugIcon)

        const nodeUpdate = node
          .merge(nodeEnter)
          .transition()
          .duration(duration)
          .ease(ease)
          .attr('transform', (d) => `translate(${d.y},${d.x})`)
          .attr('fill-opacity', 1)
          .attr('stroke-opacity', 1)

        const nodeExit = node
          .exit()
          .transition()
          .duration(duration)
          .ease(ease)
          .remove()
          .attr('transform', (d) => `translate(${d.y},${source.x})`)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)

        const link = gLink.selectAll('path').data(links, (d) => d.target.id)

        const linkEnter = link
          .enter()
          .append('path')
          .attr('stroke-opacity', 0)
          .attr(
            'd',
            (d) => `M${d.source.y},${source.x}V${d.target.x}h${indentSpacing}`
          )
        link
          .merge(linkEnter)
          .transition()
          .duration(duration)
          .ease(ease)
          .attr('stroke-opacity', 1)
          .attr('stroke', (d) =>
            pathsToTargets.some((path) => path.includes(d.target)) ||
            pathsToVulnerabilities.some((path) => path.includes(d.target))
              ? pathsToTargets.some((path) => path.includes(d.target))
                ? primaryErrorColor
                : vibrantBlue
              : secondaryTextColor
          ) // stroke color for paths to targets and vulnerabilities
          .attr('stroke-width', (d) =>
            pathsToTargets.some((path) => path.includes(d.target)) ||
            pathsToVulnerabilities.some((path) => path.includes(d.target))
              ? '1.2px'
              : '1px'
          )
          .attr(
            'd',
            (d) => `M${d.source.y},${d.source.x}V${d.target.x}h${indentSpacing}`
          )
        link
          .exit()
          .transition()
          .duration(duration)
          .ease(ease)
          .remove()
          .attr('stroke-opacity', 0)
          .attr(
            'd',
            (d) => `M${d.source.y},${source.x}V${d.target.x}h${indentSpacing}`
          )
        const targetPaths = links.filter(
          (d) =>
            pathsToTargets.some((path) => path.includes(d.target)) ||
            pathsToVulnerabilities.some((path) => path.includes(d.target))
        )
        const targetLink = gLink
          .selectAll('path.target')
          .data(targetPaths, (d) => d.target.id)
        const targetLinkEnter = targetLink
          .enter()
          .append('path')
          .attr('class', 'target')
          .attr('stroke-opacity', 0)
          .attr(
            'd',
            (d) => `M${d.source.y},${source.x}V${d.target.x}h${indentSpacing}`
          )
        targetLink
          .merge(targetLinkEnter)
          .transition()
          .duration(duration)
          .ease(ease)
          .attr('stroke-opacity', 1)
          .attr('stroke', (d) =>
            pathsToTargets.some((path) => path.includes(d.target))
              ? primaryErrorColor
              : vibrantBlue
          )
          .attr('stroke-width', '1.2px')
          .attr(
            'd',
            (d) => `M${d.source.y},${d.source.x}V${d.target.x}h${indentSpacing}`
          )
        targetLink
          .exit()
          .transition()
          .duration(duration)
          .ease(ease)
          .remove()
          .attr('stroke-opacity', 0)
          .attr(
            'd',
            (d) => `M${d.source.y},${source.x}V${d.target.x}h${indentSpacing}`
          )
        root.eachBefore((d) => {
          d.x0 = d.x
          d.y0 = d.y
        })
        indexLast = index
      }
      update(root)
      return svg.node()
    }
    collapsibleIndent(data, targetComponent, targetVulnerability)
  }, [data, targetComponent, targetVulnerability])
  return <svg ref={svgRef} width='100%' height='100%' />
}
export default Tree
