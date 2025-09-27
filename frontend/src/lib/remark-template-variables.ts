import { visit } from 'unist-util-visit'

export function remarkTemplateVariables() {
  return (tree: any) => {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /\{\{(dataset\.[^}]+)\}\}/g
      const matches = [...node.value.matchAll(regex)]

      if (matches.length > 0 && parent && Array.isArray(parent.children)) {
        const newNodes: any[] = []
        let lastIndex = 0

        matches.forEach((match) => {
          const [fullMatch, variablePath] = match
          const start = match.index ?? 0

          // Add text before the variable
          if (start > lastIndex) {
            newNodes.push({ 
              type: 'text', 
              value: node.value.slice(lastIndex, start) 
            })
          }

          // Parse the variable path
          const pathParts = variablePath.split('.')
          let variableNode: any

          if (process.env.NODE_ENV === 'development') {
            console.log('Remark plugin parsing:', variablePath)
          }

          if (pathParts[1] === 'current') {
            // {{dataset.current.datasetId}} or {{dataset.current.datasetId.jsonPath}}
            const datasetId = pathParts[2]
            const jsonPath = pathParts.slice(3).join('.')
            

            
            // Check if this might be markdown content that needs block treatment
            const isLikelyMarkdown = jsonPath === 'markdown' || jsonPath === 'content' || !jsonPath
            
            variableNode = {
              type: 'templateVariable',
              data: {
                hName: 'template-variable',
                hProperties: {
                  variableType: 'current',
                  datasetId,
                  jsonPath: jsonPath || null,
                  fullPath: variablePath,
                  isBlock: isLikelyMarkdown
                }
              }
            }
          } else if (pathParts[1] === 'pin') {
            // {{dataset.pin.pinId.datasetId}} or {{dataset.pin.pinId.datasetId.jsonPath}}
            const pinId = pathParts[2]
            const datasetId = pathParts[3]
            const jsonPath = pathParts.slice(4).join('.')
            

            
            // Check if this might be markdown content that needs block treatment
            const isLikelyMarkdown = jsonPath === 'markdown' || jsonPath === 'content' || !jsonPath
            
            variableNode = {
              type: 'templateVariable',
              data: {
                hName: 'template-variable',
                hProperties: {
                  variableType: 'pin',
                  pinId,
                  datasetId,
                  jsonPath: jsonPath || null,
                  fullPath: variablePath,
                  isBlock: isLikelyMarkdown
                }
              }
            }
          } else {
            // Invalid format, keep as text
            variableNode = {
              type: 'text',
              value: fullMatch
            }
          }

          newNodes.push(variableNode)
          lastIndex = start + fullMatch.length
        })

        // Add remaining text after the last variable
        if (lastIndex < node.value.length) {
          newNodes.push({ 
            type: 'text', 
            value: node.value.slice(lastIndex) 
          })
        }

        // Check if we have block-level template variables that need special handling
        const hasBlockVariables = newNodes.some(node => 
          node.type === 'templateVariable' && node.data?.hProperties?.isBlock
        )
        
        if (hasBlockVariables && parent.type === 'paragraph' && newNodes.length === 1) {
          // If the paragraph only contains a single block template variable, 
          // replace the paragraph with the template variable to avoid nesting issues
          const blockVariable = newNodes[0]
          parent.type = 'templateVariableBlock'
          parent.data = blockVariable.data
          parent.children = []
        } else {
          // Replace the text node with the new nodes
          parent.children.splice(index, 1, ...newNodes)
        }
      }
    })
  }
}
