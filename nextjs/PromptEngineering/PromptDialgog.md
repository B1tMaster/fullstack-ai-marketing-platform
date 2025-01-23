```
#  Prompt Editor Dialog
> Given the Objective, implement every detail of every task.

## Objective

- Allow User to ADD/CHANGE/SAVE promt text to database.
- Alert user if tokens exxceeded. not allowed to save if tokens exxceeded.
- compute tokens used in real time as user types in prompt text.


## Context

/add nextjs/components/ConfigurePromptsStep.tsx
/add nextjs/components/PromptEditorDialog.tsx
/add nextjs/components/PromptsList.tsx

/read-only nextjs/components/ConfirmationModal.tsx
/read-only nextjs/components/PromptContainerCard.tsx
/read-only nextjs/package.json
/read-only nextjs/app/api/projects/[projectId]/prompts/route.ts

## High Level Tasks
- add the Prompt Editor Dialog <PromptEditorDialog /> at the bottom of DIV the ConfigurePromptsStep.tsx component.
-- PromptEditorDialog should open when user double clicks on a prompt in the PromptsList.tsx component.
--

## Low Level Tasks
- CREATE new file PromptEditorDialog.tsx under components folder
- use the Dialog component for PromptEditorDialog from Radix UI.
- use the Textarea component from Radix UI for prompt text editor.
- use the Button component from Radix UI for save and cancel buttons.
- calculate tokens used in real time as user types in prompt text in the same way as already done in PromptContainerCard.tsx
- alert user if tokens exceeded in the footer of the dialog, show current tokens count and total tokens allowed at the footer of the dialog.
- not allowed to save prompt, if tokens exceeded. save button should be disabled, if user exceeds tokens allowed
- user can save prompt, if tokens are within allowed limit. use PATCH method to save prompt in database. PATCH method is already implemented in nextjs/app/api/projects/[projectId]/prompts/route.ts
- use the ConfirmationModal component to confirm changes to user before saving changes to database.
-use the ConfirmationModal component to confirm cancel changes to prompt to alert user changes will be lost.
- display confirmtion/failed toast to user when prompt is saved successfully or failed.
- use useEffects to handle real time token count and token limit commpuation .
- document the code with comments and markdown.
- use the same styles, fonts, colors, spacing, etc as already done in the project.
- consider best practices for react, typescript, nextjs, shadcn, tailwind, radix ui, etc.

```
