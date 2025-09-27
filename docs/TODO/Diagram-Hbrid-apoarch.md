# Hybrid Strategy Decision Flow

Here’s a simple decision flow you can use when deciding how to render a template variable inside ReactMarkdown.

```
                ┌───────────────────────┐
                │ Encounter {{variable}}│
                └───────────┬──────────┘
                            │
                 ┌───────────▼───────────┐
                 │  Is this variable      │
                 │  plain text / number?  │
                 └───────────┬───────────┘
                             │Yes
                             ▼
                    ┌───────────────────┐
                    │ Render <span> with │
                    │ live updates via   │
                    │ state subscription │
                    └───────────────────┘
                             │No
                             ▼
              ┌────────────────────────────────┐
              │ Variable contains markdown text │
              └─────────────────┬──────────────┘
                                │
                                ▼
                  ┌────────────────────────────────┐
                  │ Render nested <ReactMarkdown>  │
                  │ inside <TemplateVariable />     │
                  │ Live updates trigger only this │
                  │ block to re-parse              │
                  └────────────────────────────────┘
```

---

## Key Points

1. **Inline values** (`string`, `number`, short text)

   * Render with `<span>`.
   * Updates are cheap, React only re-renders that component.
   * Parent markdown tree stays intact.

2. **Markdown values** (`# Headings`, lists, formatted text)

   * Render with a nested `<ReactMarkdown>` inside `<TemplateVariable>`.
   * Only that block re-parses when updated.

3. **Parent Markdown Stability**

   * The parent `<ReactMarkdown>` is parsed once.
   * Variable components are placeholders that reactively update.

---

✅ This flow ensures maximum performance while keeping both inline values and markdown snippets live-updating without forcing a global re-render.
