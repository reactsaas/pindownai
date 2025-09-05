"use client"

import { useState } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function PinsPage() {
  const [markdownTemplate, setMarkdownTemplate] = useState(`# Server Status Report

**Workflow ID:** {{workflow_id}}
**Last Updated:** {{timestamp}}

## System Metrics
- **Uptime:** {{uptime}}%
- **CPU Usage:** {{cpu_usage}}%
- **Memory Usage:** {{memory_usage}}%
- **Response Time:** {{response_time}}ms

## Status
{{#if status_ok}}
✅ All systems operational
{{else}}
⚠️ Issues detected
{{/if}}

---
*Generated automatically from workflow data*`)

  return (
    <MarkdownEditor
      template={markdownTemplate}
      onTemplateChange={setMarkdownTemplate}
      workflowId="wf-001"
    />
  )
}




