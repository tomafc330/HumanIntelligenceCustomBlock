import React, { useState } from 'react';
import { Box, Button, FormField, Icon, Input, Select, Text, useBase } from '@airtable/blocks/ui';

const SyncBox = (props) => {
  const {
    getStatus, maybeDisplayCompletedTasks
  } = props;

  const base = useBase();

  return (
      <Box padding={3} paddingBottom={4} marginLeft={3} marginRight={3} marginBottom={3} border="default"
           borderRadius={8}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 18,
          padding: 0
        }}>
          <Icon name="time" size={23}/>
          <Text paddingLeft={2} paddingRight={2} size="xsmall">Sync Completed Tasks</Text>
        </div>
        <Button
            marginBottom={3}
            onClick={() => getStatus(base.id)}
            variant="primary"
            size="large"
            icon="time"
            type="submit"
        >
          Retrieve Completed Tasks
        </Button>
        {maybeDisplayCompletedTasks()}
      </Box>
  )
}

export default SyncBox;