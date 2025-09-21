# Embed Setup Implementation TODO

## Overview
Currently, the SharePopover component generates embed code pointing to `/share/pin/${templateId}/embed`, but this route doesn't exist. We need to implement a complete embedding system.

## Common Embedding Approaches

### 1. **Separate Embed Route** (Recommended)
- **Route**: `/share/pin/[pinId]/embed`
- **Pros**: Clean separation, embed-specific optimizations, better SEO
- **Cons**: Duplicate code, maintenance overhead
- **Used by**: YouTube, Vimeo, Twitter, GitHub Gists

### 2. **Query Parameter Detection**
- **Route**: `/share/pin/[pinId]?embed=true`
- **Pros**: Single route, less code duplication
- **Cons**: Mixed concerns, harder to optimize for embed-specific needs
- **Used by**: Some smaller platforms

### 3. **Iframe Detection**
- **Route**: `/share/pin/[pinId]` (same route)
- **Pros**: Automatic detection, no URL changes needed
- **Cons**: Less reliable, harder to test, SEO issues
- **Used by**: Rarely used as primary method

## Implementation Plan

### Phase 1: Backend API Updates
- [ ] **Verify public API endpoint** - Ensure `/api/public/pins/:pid` works for embed requests
- [ ] **Add embed-specific headers** - Consider CORS headers for iframe embedding
- [ ] **Add embed metadata** - Include embed-specific data in API response (optional)

### Phase 2: Frontend Embed Route Creation
- [ ] **Create embed route** - `/share/pin/[pinId]/embed/page.tsx`
- [ ] **Create embed layout** - Minimal layout without header/footer
- [ ] **Implement embed component** - Stripped-down version of share page
- [ ] **Add iframe detection** - Detect when loaded in iframe for additional optimizations

### Phase 3: Embed-Specific Features
- [ ] **Responsive design** - Ensure content works in various iframe sizes
- [ ] **Embed styling** - Custom CSS for embed mode (no scrollbars, proper margins)
- [ ] **Loading states** - Optimized loading experience for embeds
- [ ] **Error handling** - Embed-specific error messages

### Phase 4: Security & Performance
- [ ] **CORS configuration** - Allow embedding from external domains
- [ ] **Content Security Policy** - Ensure embed pages work with CSP
- [ ] **Performance optimization** - Lazy loading, minimal JavaScript for embeds
- [ ] **Analytics tracking** - Track embed usage separately from regular shares

### Phase 5: Testing & Documentation
- [ ] **Cross-browser testing** - Test embeds in different browsers
- [ ] **Iframe size testing** - Test various iframe dimensions
- [ ] **External domain testing** - Test embedding from different domains
- [ ] **Documentation** - Create embed usage documentation
- [ ] **Example implementations** - Provide code examples for common platforms

## Technical Implementation Details

### Embed Route Structure
```
frontend/src/app/share/pin/[pinId]/
├── page.tsx (existing share page)
├── embed/
│   └── page.tsx (new embed page)
└── layout.tsx (shared layout)
```

### Embed Page Features
- **Minimal HTML structure** - No navigation, footer, or branding
- **Responsive content** - Adapts to iframe width
- **Clean styling** - No external dependencies that might conflict
- **Fast loading** - Optimized for quick embed rendering

### Security Considerations
- **X-Frame-Options** - Allow embedding from any origin (or specific domains)
- **Content Security Policy** - Ensure inline styles and scripts work
- **Data validation** - Validate pin data before rendering in embed

### Performance Optimizations
- **Minimal bundle size** - Only load necessary components for embed
- **Lazy loading** - Load content progressively
- **Caching** - Implement proper cache headers for embed content
- **CDN optimization** - Ensure embed assets are CDN-friendly

## Files to Create/Modify

### New Files
- [ ] `frontend/src/app/share/pin/[pinId]/embed/page.tsx`
- [ ] `frontend/src/components/embed-pin-viewer.tsx`
- [ ] `frontend/src/styles/embed.css` (if needed)

### Files to Modify
- [ ] `frontend/src/app/share/pin/[pinId]/page.tsx` - Add embed detection
- [ ] `backend-api/src/routes/public/pins.ts` - Add embed headers (optional)
- [ ] `frontend/src/components/share-popover.tsx` - Update embed code generation

## Testing Checklist
- [ ] Embed works in different iframe sizes (300px, 600px, 800px, 100% width)
- [ ] Embed loads correctly from external domains
- [ ] Embed content is responsive and readable
- [ ] No JavaScript errors in embed mode
- [ ] Embed respects user's theme preferences
- [ ] Embed loads quickly (< 2 seconds)
- [ ] Embed works on mobile devices
- [ ] Embed content is accessible (screen readers, keyboard navigation)

## Success Criteria
- [ ] Embed code from SharePopover works without 404 errors
- [ ] Embedded content displays properly in iframes
- [ ] Embed page loads in under 2 seconds
- [ ] Embed works across major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Embed is responsive and works in various container sizes
- [ ] No security vulnerabilities introduced

## Future Enhancements
- [ ] **Interactive embeds** - Allow commenting/interaction within embeds
- [ ] **Embed analytics** - Track embed views and interactions
- [ ] **Custom embed themes** - Allow users to customize embed appearance
- [ ] **Embed API** - Provide API for programmatic embed generation
- [ ] **Embed preview** - Show embed preview in SharePopover before copying code
