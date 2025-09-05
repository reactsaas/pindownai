"use client"

import { useState } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { IntegrationsPage } from "@/components/integrations-page"
import { LogsPage } from "@/components/logs-page"
import { PromptsPage } from "@/components/prompts-page"

export default function WorkflowPlatform() {
  const [currentPage, setCurrentPage] = useState("workflows")
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
    <>
      {currentPage === "integrations" ? (
        <IntegrationsPage />
      ) : currentPage === "logs" ? (
        <LogsPage />
      ) : currentPage === "prompts" ? (
        <PromptsPage />
      ) : (
        <MarkdownEditor
          template={markdownTemplate}
          onTemplateChange={setMarkdownTemplate}
          workflowId="wf-001"
        />
      )}
    </>
  )
}
