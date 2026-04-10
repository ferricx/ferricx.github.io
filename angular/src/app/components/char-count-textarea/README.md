# CharCountTextareaComponent

A self-contained textarea with a live character count. Keeps the label, input, and count announcement in one DOM unit for proper screen reader reading order.

## Selector

```
app-char-count-textarea
```

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `''` | Visible label text rendered in a `<label>` element |
| `inputId` | `string` | `''` | `id` applied to the `<textarea>`. Must be unique on the page |
| `name` | `string` | `''` | `name` attribute used in form submission |
| `rows` | `number` | `4` | Number of visible text rows |
| `maxLength` | `number` | `500` | Maximum character limit enforced via the native `maxlength` attribute |
| `debounceMs` | `number` | `2000` | Milliseconds to debounce the live count update announced to screen readers |

## Basic usage

```html
<app-char-count-textarea
  label="Description"
  inputId="dependents-description"
  name="description"
/>
```

## With custom limits

```html
<app-char-count-textarea
  label="Bio"
  inputId="user-bio"
  name="bio"
  [rows]="6"
  [maxLength]="250"
  [debounceMs]="1000"
/>
```

## With a popover tip

Pass an `<ng-template #tip>` as content. Any HTML is supported. The popover button only renders when a tip template is provided.

```html
<app-char-count-textarea
  label="Description"
  inputId="dependents-description"
  name="description"
>
  <ng-template #tip>
    <strong>Keep it brief.</strong> Describe the dependent in 500 characters or fewer.
  </ng-template>
</app-char-count-textarea>
```

## Accessibility

- The `<label>` is associated with the `<textarea>` via `[for]`/`[id]`
- The character count `<span>` uses `aria-live="polite"` and `aria-atomic="true"` so screen readers announce the updated count after the user pauses typing
- The `aria-describedby` on the textarea points to the count span so the limit is surfaced when the field receives focus
- The debounce prevents excessive announcements while the user is actively typing; adjust `debounceMs` to suit your needs
