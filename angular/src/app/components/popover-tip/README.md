# PopoverTipComponent

A trigger button that opens a contextual popover panel. Supports hover, focus, and click interactions. Automatically detects whether its content contains interactive elements and sets `role="tooltip"` or `role="dialog"` accordingly. Position is detected at open time and adjusted to stay within the viewport.

## Selector

```
app-popover-tip
```

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `buttonLabel` | `string` | `'?'` | Visible text inside the trigger button |
| `ariaLabel` | `string` | `'Show tip'` | Accessible label for the trigger button |
| `closeDelay` | `number` | `0` | Milliseconds to wait before closing on hover/focus leave |

## Content projection

All content placed inside `<app-popover-tip>` is rendered in the popover body via `<ng-content>`. Plain text, HTML, and interactive elements (links, buttons) are all supported.

If the projected content contains any interactive element, the popover's `role` is automatically set to `"dialog"` instead of `"tooltip"` so assistive technologies handle it correctly.

## Basic usage — plain text

```html
<app-popover-tip ariaLabel="Show tip for Email">
  We'll only use this to send a confirmation.
</app-popover-tip>
```

## Rich HTML content

```html
<app-popover-tip ariaLabel="Show tip for SSN">
  <strong>Why we ask:</strong> Your SSN is used to verify your identity.
  Only the last 4 digits will be stored.
</app-popover-tip>
```

## With a link (auto-upgrades to dialog role)

```html
<app-popover-tip ariaLabel="Show tip for Phone">
  We support US numbers only. <a href="/help/phone">Learn more</a>.
</app-popover-tip>
```

## Used inside another component

`PopoverTipComponent` is used by `FormGroupComponent` and `CharCountTextareaComponent` via a `@ContentChild('tip')` template slot:

```html
<app-form-group label="Email" field-id="email">
  <ng-template #tip>
    <strong>Why we need this:</strong> We'll send a confirmation to this address.
  </ng-template>
</app-form-group>
```

## Accessibility

- The trigger button has an `aria-label` and an `aria-describedby` pointing to the popover panel
- `role` is set to `"tooltip"` for text-only content and `"dialog"` for content containing interactive elements
- Opens on hover, focus, and click; closes on outside click, focus loss, and `Escape` (via the native `popover="auto"` behavior)
- Auto-positions the panel to avoid viewport overflow
