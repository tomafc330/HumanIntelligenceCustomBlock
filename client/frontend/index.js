import React, { useState } from 'react';
import { BASE_URL } from './settings';
import {
  Box,
  Button,
  expandRecord,
  FieldPickerSynced,
  FormField,
  Heading,
  Icon,
  initializeBlock,
  Input,
  Select,
  Text,
  useBase,
  useGlobalConfig,
  useRecords
} from '@airtable/blocks/ui';
import { FieldType } from '@airtable/blocks/models';
import { globalConfig } from "@airtable/blocks";


function MTurkBlock() {
  const base = useBase();

  // Read the user's choice for which table and view to use from globalConfig.
  const globalConfig = useGlobalConfig();
  const tableId = globalConfig.get('selectedTableId');
  const fromFieldId = globalConfig.get('selectedFromFieldId');
  const toFieldId = globalConfig.get('selectedToFieldId');

  const table = base.getTableByIdIfExists(tableId);
  const fromField = table ? table.getFieldByIdIfExists(fromFieldId) : null;
  const toField = table ? table.getFieldByIdIfExists(toFieldId) : null;


  function setGlobalValue(key, value) {
    const setCheckResult = globalConfig.setAsync(key, value);
  }

  function getGlobalValue(key) {
    return globalConfig.get(key);
  }

  function replaceText(template, record) {
    return template.replace("{text}", record);
  }

  function setTemplateOrDialog(newValue) {
    if (newValue === 'custom') {
      setAddingCustomTemplate(true)
    } else {
      setTemplate(newValue)
    }
  }

  function onAddCustomTemplate(event) {
    event.preventDefault();
    const arr = getGlobalValue('customTemplateTexts')
    arr.push(customTemplateText)
    setGlobalValue('customTemplateTexts', arr);
    setAddingCustomTemplate(false)
    setCustomTemplateText('');
  }

  function blah() {
    getGlobalValue('customTemplateTexts').map(customText => {
      options.push({
        value: customText,
        label: customText
      })
    })
    options.push(
        {
          value: "custom",
          label: "Custom"
        });

    return options;
  }

  // Don't need to fetch records if doneField doesn't exist (the field or it's parent table may
  // have been deleted, or may not have been selected yet.)
  const records = useRecords(table, { fields: [fromField] });
  const tasks = records
      ? records.map(record => {
        return <Task key={record.id} record={record} table={table} doneField={fromField}/>;
      })
      : null;

  const options = [
    {
      value: "Please translate this text into French - '{text}'",
      label: "Manual Translation To French"
    },
    {
      value: "Please help me find a recent 1-2 lines newsworthy summary for the company {text}.",
      label: "Sales"
    },
  ];

  const [template, setTemplate] = useState(options[0].value);
  const [cellRecord, setCellRecord] = useState('');
  const [addingCustomTemplate, setAddingCustomTemplate] = useState(false);
  const [customTemplateText, setCustomTemplateText] = useState('');

  function settingsBox() {
    return <Box padding={3} margin={3} border="default">
      <Heading paddingTop={1} size="medium">Welcome to Mechanical Turk</Heading>
      <Heading size="xsmall" textColor="light">Get manual tasks done for you, easily! Please
        follow the these instructions to get started.</Heading>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 18,
        padding: 0
      }}>
        <Icon name="ul" size={23}/>
        <Text paddingLeft={2} size="xsmall">Configuration</Text>
      </div>
      <FormField label="AWS Key">
        <Input value={getGlobalValue("aws_key")}
               onChange={e => setGlobalValue("aws_key", e.target.value)}/>
      </FormField>
      <FormField label="AWS Secret">
        <Input value={getGlobalValue("aws_secret")}
               onChange={e => setGlobalValue("aws_secret", e.target.value)}/>
      </FormField>
      <FormField label="Field to use data from" marginBottom={3}>
        <FieldPickerSynced
            table={table}
            globalConfigKey="selectedFromFieldId"
            placeholder="Field to use data from"
            allowedTypes={[FieldType.MULTILINE_TEXT, FieldType.SINGLE_LINE_TEXT, FieldType.RICH_TEXT]}
        />
      </FormField>
      <FormField label="Field to write data to" marginBottom={3}>
        <FieldPickerSynced
            table={table}
            globalConfigKey="selectedToFieldId"
            placeholder="Field to write data to"
            allowedTypes={[FieldType.MULTILINE_TEXT, FieldType.SINGLE_LINE_TEXT, FieldType.RICH_TEXT]}
        />
      </FormField>
    </Box>;
  }

  function createTaskBox() {
    return <Box padding={3} margin={3} border="default">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 18,
        padding: 0
      }}>
        <Icon name="bolt" size={23}/>
        <Text paddingLeft={2} size="xsmall">Send a Task to Mechanical Turk</Text>
      </div>
      <FormField label="Pick a template to use">
        <Select
            options={blah()}
            value={template}
            onChange={newValue => setTemplateOrDialog(newValue)}
        />
      </FormField>

      <form onSubmit={onAddCustomTemplate}>
        <Box display="flex" padding={0}>
          <FormField
              style={{
                display: addingCustomTemplate ? 'block' : 'none'
              }}
              label="Add your own template">
            <Input
                type="textarea"
                flex="auto"
                onChange={e => setCustomTemplateText(e.target.value)}
                placeholder="Custom instruction for task. Use the placeholder {text} to substitute the value to send."
            />
            <Button variant="primary" marginLeft={0} marginTop={1} type="submit">
              Add
            </Button>
          </FormField>
        </Box>
      </form>


      <FormField label="Select the value to use for the task">
        <Select
            options={records.map(record => {
              return {
                value: record.id,
                label: record.getCellValueAsString(fromField)
              }
            })}
            value={cellRecord}
            onChange={newValue => setCellRecord(newValue)}
        />
      </FormField>
      <FormField label="Review Output" marginBottom={3}>
        <Text
            display={cellRecord ? 'block' : 'none'}
            disabled={!cellRecord}
            style={{
              fontStyle: 'italic',
              fontWeight: 'bold'
            }}>{replaceText(template, cellRecord)}</Text>
      </FormField>
      <Button
          onClick={() => uploadTask(base.id, cellRecord)}
          variant="primary"
          size="large"
          icon="premium"
          type="submit"
          disabled={!cellRecord}
      >
        Upload Task To Mechanical Turk
      </Button>
    </Box>;
  }

  function syncBox() {
    return <Box padding={3} marginLeft={3} border="default">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: 18,
        padding: 0
      }}>
        <Icon name="bolt" size={23}/>
        <Text paddingLeft={2} size="xsmall">Sync Completed Tasks</Text>
      </div>
      <Button
          onClick={() => getStatus(base.id)}
          variant="primary"
          size="large"
          icon="premium"
          type="submit"
      >
        Retrieve Completed Tasks
      </Button>
    </Box>;
  }

  return (
      <div>
        {settingsBox()}
        {createTaskBox()}
        {syncBox()}
        {tasks}
        {table && fromField && <AddTaskForm table={table}/>}
      </div>
  );
}

function Task({ record, table, doneField }) {
  return (
      <Box
          fontSize={4}
          paddingX={3}
          paddingY={2}
          marginRight={-2}
          borderBottom="default"
          display="flex"
          alignItems="center"
      >
        <TaskDoneCheckbox table={table} record={record} doneField={doneField}/>
        <a
            style={{ cursor: 'pointer', flex: 'auto', padding: 8 }}
            onClick={() => {
              expandRecord(record);
            }}
        >
          {record.primaryCellValueAsString || 'Unnamed record'}
        </a>
        <TaskDeleteButton table={table} record={record}/>
      </Box>
  );
}

function TaskDoneCheckbox({ table, record, doneField }) {
  function onChange(event) {
    table.updateRecordAsync(record, {
      [doneField.id]: event.currentTarget.checked,
    });
  }

  const permissionCheck = table.checkPermissionsForUpdateRecord(record, {
    [doneField.id]: undefined,
  });

  return (
      <input
          type="checkbox"
          checked={!!record.getCellValue(doneField)}
          onChange={onChange}
          style={{ marginRight: 8 }}
          disabled={!permissionCheck.hasPermission}
      />
  );
}

function TaskDeleteButton({ table, record }) {
  function onClick() {
    table.deleteRecordAsync(record);
  }

  return (
      <Button
          variant="secondary"
          marginLeft={1}
          onClick={onClick}
          disabled={!table.hasPermissionToDeleteRecord(record)}
      >
        <Icon name="x" style={{ display: 'flex' }}/>
      </Button>
  );
}

function AddTaskForm({ table }) {
  const [taskName, setTaskName] = useState('');

  function onInputChange(event) {
    setTaskName(event.currentTarget.value);
  }

  function onSubmit(event) {
    event.preventDefault();
    table.createRecordAsync({
      [table.primaryField.id]: taskName,
    });
    setTaskName('');
  }

  // check whether or not the user is allowed to create records with values in the primary field.
  // if not, disable the form.
  const isFormEnabled = table.hasPermissionToCreateRecord({
    [table.primaryField.id]: undefined,
  });
  return (
      <form onSubmit={onSubmit}>
        <Box display="flex" padding={3}>
          <Input
              flex="auto"
              value={taskName}
              placeholder="New task"
              onChange={onInputChange}
              disabled={!isFormEnabled}
          />
          <Button variant="primary" marginLeft={2} marginTop={1} type="submit"
                  disabled={!isFormEnabled}>
            Add
          </Button>
        </Box>
      </form>
  );
}

async function getStatus(baseId) {
  const requestUrl = `${BASE_URL}.json/?base_id=${baseId}`;
  const result = await (await fetch(requestUrl, {
    cors: true, headers: {
      "Content-Type": "application/json",
      "AWS_KEY": globalConfig.get('aws_key'),
      "AWS_SECRET": globalConfig.get('aws_secret')
    }
  })).json();
  return result;
}

async function uploadTask(baseId, cellId) {
  const opts = {
    base_id: baseId,
    cell_id: cellId,
    question: 'blah2'
  }
  const result = await (await fetch(`${BASE_URL}.json`, {
    method: 'post', body: JSON.stringify(opts), cors: true, headers: {
      "Content-Type": "application/json",
      "AWS_KEY": globalConfig.get('aws_key'),
      "AWS_SECRET": globalConfig.get('aws_secret')
    },
  })).json();
  return result;
}

function delayAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

initializeBlock(() => <MTurkBlock/>);
