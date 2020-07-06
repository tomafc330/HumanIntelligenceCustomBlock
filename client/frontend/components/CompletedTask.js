import React from 'react';
import {
  Box,
  colors,
  Text,
} from '@airtable/blocks/ui';
import TaskSelectButton from "./TaskSelectButton";

const CompletedTask = (props) => {
  const {
    task, table, doneField, completeTask, setCompletedTasksFromServer, completedTasksFromServer
  } = props;

  function responses(task, table, doneField) {
    return task.responses.map(response => {
      return <Box overflowX="auto" padding={1} marginTop={2}
                  border="thick"
                  borderRadius={8}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: 0
        }}>
          <Text paddingLeft={2} size="default" >{response}</Text>
          <TaskSelectButton table={table} recordId={task.cell_id} doneField={doneField}
                            response={response} completeTask={completeTask} setCompletedTasksFromServer={setCompletedTasksFromServer} completedTasksFromServer={completedTasksFromServer} />
        </div>
      </Box>
    })
  }

  return (
      <div>
        {responses(task, table, doneField)}
      </div>
  )
}

export default CompletedTask;