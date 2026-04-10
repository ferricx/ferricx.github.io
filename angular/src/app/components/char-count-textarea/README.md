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
| `required` | `boolean` | `false` | Marks the field as required; shows a required indicator and validation error |
| `debounceMs` | `number` | `2000` | Milliseconds to debounce the live count update announced to screen readers |

## Public methods

| Method | Description |
|---|---|
| `markDirty()` | Marks the field as dirty so validation errors persist after a submit attempt |
| `reset()` | Clears the error message, dirty state, and character count |

## Basic usage

```html
<app-char-count-textarea
  label="Description"
  inputId="dependents-description"
  name="description"
/>
```

## Required field

```html
<app-char-count-textarea
  label="Notes"
  inputId="notes"
  name="notes"
  required
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
- When `required` is set, a visually hidden asterisk is shown and the native `required` attribute is applied
- `aria-invalid="true"` is set on the textarea when a validation error is present
- `aria-describedby` points to both the error message and the character count span when an error is present, or just the count span when valid
- The character count `<span>` uses `aria-live="polite"` and `aria-atomic="true"` so screen readers announce the updated count after the user pauses typing
- The debounce prevents excessive announcements while the user is actively typing; adjust `debounceMs` to suit your needs
- Call `markDirty()` from a parent submit handler to make validation errors persist after a failed submit attempt
