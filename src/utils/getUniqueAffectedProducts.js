export const getUniqueAffectedProducts = (nodes) => {
  if (!nodes) return []

  const uniqueNodes = new Map()

  nodes.forEach((node) => {
    const projectGroupName = node?.component?.sbom?.project?.projectGroup?.name
    if (projectGroupName && !uniqueNodes.has(projectGroupName)) {
      uniqueNodes.set(projectGroupName, node)
    }
  })

  return [...uniqueNodes.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}
