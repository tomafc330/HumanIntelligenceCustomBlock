import React from 'react';
import {
  Button
} from '@airtable/blocks/ui';

const TaskSelectButton = (props) => {
  const {
    table, recordId, response, doneField,
    completeTask, setCompletedTasksFromServer, completedTasksFromServer
  } = props;

  function onclick() {
    completeTask(recordId).then((value) => {
      table.updateRecordAsync(recordId, {
        [doneField.id]: response,
      });

      setCompletedTasksFromServer(completedTasksFromServer.filter((item) => {
        return item.cell_id !== recordId
      }));
    })
  }

  const permissionCheck = table.checkPermissionsForUpdateRecord(recordId, {
    [doneField.id]: undefined,
  });

  return (
      <Button
          marginLeft={2}
          onClick={onclick}
          size="small"
          icon="check"
          variant="primary"
          disabled={!permissionCheck.hasPermission}
      >
      </Button>
  );
}

export default TaskSelectButton;