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

Pass an `<ng-template #tip>` as projected content. See the [PopoverTipComponent README](../popover-tip/README.md) for full details and examples.

## Accessibility

- The `<label>` is associated with the `<textarea>` via `[for]`/`[id]`
- When `required` is set, a visually hidden asterisk is shown and the native `required` attribute is applied
- `aria-invalid="true"` is set on the textarea when a validation error is present
- `aria-describedby` points to both the error message and the character count span when an error is present, or just the count span when valid
- The character count `<span>` uses `aria-live="polite"` and `aria-atomic="true"` so screen readers announce the updated count after the user pauses typing
- The debounce prevents excessive announcements while the user is actively typing; adjust `debounceMs` to suit your needs
- Call `markDirty()` from a parent submit handler to make validation errors persist after a failed submit attempt

---

## Using this component in another project

### Requirements

- Angular **21+**
- No third-party dependencies beyond `@angular/common`

### 1. Copy the component files

This component depends on `PopoverTipComponent`. Copy both folders into your project:

```
src/app/components/char-count-textarea/
  char-count-textarea.component.ts
  char-count-textarea.component.html
  char-count-textarea.component.css

src/app/components/popover-tip/
  popover-tip.component.ts
  popover-tip.component.html
  popover-tip.component.scss
```

Place them anywhere under your `src/` tree. Just make sure the relative import path inside `char-count-textarea.component.ts` still resolves to `PopoverTipComponent`:

```ts
// char-count-textarea.component.ts
import { PopoverTipComponent } from '../popover-tip/popover-tip.component';
```

Update that path if you put the folders somewhere else.

### 2. `angular.json` — nothing required

Both components are **standalone**, so no `NgModule` declarations are needed and there are no special `angular.json` entries required. The only `angular.json` setting worth checking is your project's `prefix`:

```json
// angular.json
"prefix": "app"
```

The component selector is `app-char-count-textarea`. If your project uses a different prefix (e.g. `my`), either:

- leave the selector as-is and use `<app-char-count-textarea>` in your templates, or
- find-replace `app-char-count-textarea` → `my-char-count-textarea` in the `.ts` and `.html` files.

### 3. `tsconfig.json` — optional path alias

If you want a cleaner import path, add a path alias in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@components/*": ["src/app/components/*"]
    }
  }
}
```

Then import as:

```ts
import { CharCountTextareaComponent } from '@components/char-count-textarea/char-count-textarea.component';
```

Without the alias the standard relative import works fine.

### 4. Import the component

Because it is a standalone component, add it directly to the `imports` array of the consuming component or module:

**Standalone component (recommended)**

```ts
import { CharCountTextareaComponent } from './components/char-count-textarea/char-count-textarea.component';

@Component({
  standalone: true,
  imports: [CharCountTextareaComponent],
  templateUrl: './my-form.component.html',
})
export class MyFormComponent {}
```

**NgModule-based project**

```ts
import { CharCountTextareaComponent } from './components/char-count-textarea/char-count-textarea.component';

@NgModule({
  imports: [CharCountTextareaComponent],
  declarations: [MyFormComponent],
})
export class MyFormModule {}
```

### 5. Use in a template

```html
<app-char-count-textarea
  label="Comments"
  inputId="comments"
  name="comments"
  [maxLength]="300"
  required
/>
```

### 6. Wire up form submission validation (optional)

`@ViewChild` is only needed if you want to call one of the component's public methods from the parent — `validate()`, `markDirty()`, or `reset()`. For basic character-counting usage, none of this is required.

If your form has a submit button that should trigger validation:

```ts
import { ViewChild } from '@angular/core';
import { CharCountTextareaComponent } from './components/char-count-textarea/char-count-textarea.component';

export class MyFormComponent {
  @ViewChild(CharCountTextareaComponent)
  commentsField!: CharCountTextareaComponent;

  onSubmit(): void {
    const valid = this.commentsField.validate();
    if (!valid) return;
    // proceed with submission
  }
}
```

If you have multiple `CharCountTextareaComponent` instances in the same template, use a template reference variable to distinguish them:

```html
<app-char-count-textarea #commentsField ... />
<app-char-count-textarea #notesField ... />
```

```ts
@ViewChild('commentsField') commentsField!: CharCountTextareaComponent;
@ViewChild('notesField')    notesField!: CharCountTextareaComponent;
```

### 7. Styles

The component ships with its own scoped CSS (`char-count-textarea.component.css`). No global stylesheet changes are needed. If you use a design-system CSS custom property for error colours, the component's CSS already targets standard property names — override them at the `:root` or component host level as needed.
