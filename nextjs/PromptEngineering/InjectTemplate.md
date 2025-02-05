#  Prompt Editor Dialog
> Given the Objective, implement every detail of every task.

## Objective

- Allow User to INJECT template promts already created by the User into a list of project prompts for the same user.  
- Alert user if injection failed with proper message and log the error.
- INJECT means to read from database all prompts for a specfic user selected teamplate and create a copy of the template prompts in the project prompts list.
- User should be able to select a template name from a list of templates created by the User in the TemplateSelectionPopup.tsx component. 
- User is able to Confirm or Cancel the injection, before injection is done. 
- User is able to select from a pull down menu of the TemplateSelectionPopup.tsx component only one template name at a time.

## Context

/ add nextjs/components/TemplateSelectionPopup.tsx
/add nextjs/components/ConfigurePromptsStep.tsx
/read-only nextjs/components/PromptEditorDialog.tsx
/read-only nextjs/components/PromptsList.tsx
/add app/(dashboard)/templates/page.tsx
/add app/(dashboard)/templates/[templateId]/page.tsx
/add nextjs/components/TemplateDetailBody.tsx
/add nextjs/components/TemplatePromptsList.tsx

/read-only nextjs/components/ConfirmationModal.tsx
/read-only nextjs/components/PromptContainerCard.tsx

/read-only nextjs/app/api/projects/[projectId]/prompts/route.ts
/read-only nextjs/server/queries.ts
/read-only nextjs/utils/logger.ts
/read-only nextjs/utils/timeUtils.ts
/read-only nextjs/utils/toastUtils.ts
/read-only nextjs/utils/validationUtils.ts
/read-only nextjs/utils/databaseUtils.ts


## High Level Tasks
- create code for  < TemplateSelectionPopup/> inside already created file TemplateSelectionPopup.tsx 
- The component user will see is a Dialog with a header , title and footer and selector pull down menu listing all template names created by the User.
- User will open the TemplateSelectionPopup by clicking on a "Load Template" button in the ConfigurePromptsStepHeader.tsx component. 




## Low Level Tasks

- The TemplateSelectionPopup should open as a modal dialog.
- The TemplateSelectionPopup should have a close button to close the dialog.
- The TemplateSelectionPopup should have a pull down menu to select a template name.
- The TemplateSelectionPopup should have a "Load Template" button to load the selected template prompts text from database in template_prompts table and save a copy of those prompts into the project prompts table. Project ID is added to the injected prompts to identify the prompts belong to which project and tempalte_id is discarded as it does not exist in project prompts table. 

- prompts list for the project is dynamicall updated with new injected prompts once they are saved to the project prompts table. 
- use existing POST  method in route.ts to save prompts to the project prompts table. 

- The TemplateSelectionPopup should have a "Cancel" button to close the dialog.

- use existing getTemplatesForUser method from queries.ts to get the list of templates for the User to populate the pull down menu. 
- use the ConfirmationModal component to confirm changes to user before saving changes to database.
- display confirmtion/failed toast to user when injected template prompts are saved successfully or failed.
- use useEffects to handle real time of fetching templates from database when the TemplateSelectionPopup is opened.

- document the code with comments and markdown.
- use the same styles, fonts, colors, spacing, etc as already done in the project.
- consider best practices for react, typescript, nextjs, shadcn, tailwind, radix ui, etc.
- make sure to use the correct types for the data and functions.
- use already created logging utility logger.ts to log errors and info and debug messages.

- follow the same style and structure as already done in the project including using shadcn components and tailwind css classes. 

- evaluate the code before making any changes and ask questions before proceeding.

- provide step by step instructions and thought process before proceeding with the code.

- provide at least 3 different ways to solve the problem and evaluate the pros and cons of each way before proceeding with the best solution.

```
