"use client"

import { useState } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function PinBlocksPage() {
  const [markdownTemplate, setMarkdownTemplate] = useState(`# User Onboarding Template

**Template ID:** {{template_id}}
**Last Updated:** {{timestamp}}

## Welcome Message
Welcome to our platform! We're excited to have you on board.

## User Information
- **Name:** {{user_name}}
- **Email:** {{user_email}}
- **Registration Date:** {{registration_date}}

## Next Steps
{{#if email_verified}}
✅ Email verified - proceed to dashboard
{{else}}
📧 Please verify your email address
{{/if}}

---
*Automated user onboarding workflow*`)

  return (
    <MarkdownEditor
      template={markdownTemplate}
      onTemplateChange={setMarkdownTemplate}
      workflowId="wf-002"
      initialView="blocks" // Force blocks view
    />
  )
}
