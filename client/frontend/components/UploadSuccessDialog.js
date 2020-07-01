import React from 'react';
import {
  Button,
  Dialog,
  Heading,
  Text,
} from '@airtable/blocks/ui';

const UploadSuccessDialog = (props) => {
  const {
    isDialogOpen, setIsDialogOpen
  } = props;

  return (
      <React.Fragment>
        {isDialogOpen && (
            <Dialog onClose={() => setIsDialogOpen(false)} width="320px">
              <Dialog.CloseButton/>
              <Heading>Task Uploaded!</Heading>
              <Text variant="paragraph">
                Hooray! We have created the manual Mechanical Turk task for you. Check back later
                to see the submissions!
              </Text>
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            </Dialog>)}
      </React.Fragment>
  )
}

export default UploadSuccessDialog;