# Prompt Editor Dialog

- Given the Objective, implement every detail of every task.
- document all changes made to the code.
- Only work on the objective, do not implement any other features.

## Objective

- Allow User to edit the generated text of a generated content item and save changes to the database.

- allow user to copy to clipboard the edited generated text by pressing an existing "copy to clipboard" button.

## Context

/add nextjs/components/GenerateStepBody.tsx
/add nextjs/components/GenerateContentStep.tsx

/read-only nextjs/components/ConfirmationModal.tsx
/read-only nextjs/app/api/projects/[projectId]/generated-content/route.ts
/read-only nextjs/components/GenerateStepHeader.tsx
/read-only nextjs/components/templatePromptContainerCard.tsx

## High Level Tasks

- User should be able to edit the text of the content.result  item.
- User should be able to save the edited generated text to the database or cancel the changes made to the text.

- use textarea to allow user to edit the generated text of the selected generated content item.
- use a save button and a cancel button to allow user to save the edited content to the database and cancel the editing.
- text area should be visible only when user is editing.
- save and cancel button should be visible only when user is editing.
- use the same style as the existing buttons in the app.
- use existing edit button to trigger the edit mode.
- use existing "copy to clipboard" button to copy the edited content to the clipboard.

## Low Level Tasks

- add projectId to generatestepBodyProps interface in nextjs/components/GenerateStepBody.tsx and to GenerateStepBody function parameter. as we will need it to save the edited content to the database to a specific project.

- add projectId to GenerateContentStep.tsx component to pass it to GenerateStepBody.tsx component.

- USE state from react: to track if the user is editing the generated text in the GenerateStepBody.tsx component , track the id of the generated content item that is being edited, so that it can be saved to the database to correct record.
- USE state from react: to track the edited changes to the generated text GenerateStepBody.tsx component. so that the content is updated in the GUI component and also ready to be saved to the database, upon user clicking on the save button.
- ADD state to track if we are currently saving the edited content to the database, so that when we save the content to the database we disable the save button and show a loading spinner.

- make GenerateStepBody.tsx component client component.

- create a new function copyToClipboard() that will be used to copy the edited content to the clipboard. use navigator.clipboard.writeText() to copy the text to the clipboard.

- create a onClick={() => copyToClipboard(content.result)} event handler for the copy to clipboard button in the GenerateStepBody.tsx component.

- use toast to indicate success or error messages when copying to clipboard or saving the content to the database. use the same style as the existing toast messages in the app.

- create a new function handleSave() that will be used to save the edited content to the database. use the axios.patch method on api/projects/[projectId]/generated-content/ route to save the content to the database. this is the file: /Users/davramenko/development/aidev/learning/fullstack-ai-marketing-platform/nextjs/app/api/projects/[projectId]/generated-content/route.ts

- create a onClick={() => handleSave()} event handler for the save button in the GenerateStepBody.tsx component.

- create a new function handleEdit() that will be used to edit the generated text of the selected generated content item. pass in the id of the content item to the function and the content of the edited text to the function. set the editing ID state and the edited content state.

- create a onClick={() => handleEdit()} event handler for the edit button in the GenerateStepBody.tsx component.

- create a new function handleCancel() that will be used to cancel the editing of the generated text of the selected generated content item. set the editing ID state and the edited content state to null. this will close the edit dialog and revert the content to the original content. this function will be called when the user clicks on the cancel button in the GenerateStepBody.tsx component.

- create a cancel button that is only showing when the user is editing and use handleCancel() function to handle the click event to restore the original content. 

- create a save button that is only showing when the user is editing and use handleSave() function to handle the click event to save the edited content to the database.

- create a text area that is only showing when the user is editing and use the edited content state to display the content.


