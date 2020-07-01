import React, { useEffect, useState } from 'react';
import { BASE_URL } from './settings';
import {
  Box,
  Button,
  colors,
  Dialog,
  FieldPickerSynced,
  FormField,
  Heading,
  Icon,
  initializeBlock,
  Input,
  registerRecordActionDataCallback,
  Text,
  useBase,
  useRecordById,
  useRecords,
  useWatchable,
  useGlobalConfig
} from '@airtable/blocks/ui';
import { FieldType } from '@airtable/blocks/models';
import { cursor } from '@airtable/blocks';
import { replaceText } from './utils';
import UploadTaskBox from "./components/UploadTaskBox";
import SettingsBox from "./components/SettingsBox";

function HumanIntelligenceBlock() {
  const base = useBase();

  useWatchable(cursor, ['activeTableId', 'activeViewId']);

  const globalConfig = useGlobalConfig();
  const tableId = cursor.activeTableId;
  const fromFieldId = getGlobalValue('selectedFromFieldId');
  const toFieldId = getGlobalValue('selectedToFieldId');

  const table = base.getTableByIdIfExists(tableId);
  const fromField = table ? table.getFieldByIdIfExists(fromFieldId) : null;
  const toField = table ? table.getFieldByIdIfExists(toFieldId) : null;

  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [addingCustomTemplate, setAddingCustomTemplate] = useState(false);
  const [customTemplateText, setCustomTemplateText] = useState('');
  const [costPerTask, setCostPerTask] = useState(0.20);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completedTasksFromServer, setCompletedTasksFromServer] = useState([]);

  const currentRecord = useRecordById(table, selectedRecordId ? selectedRecordId : "");

  // Don't need to fetch records if doneField doesn't exist (the field or it's parent table may
  // have been deleted, or may not have been selected yet.)
  const records = useRecords(table, { fields: [fromField] });

  const options = [
    {
      value: "Please translate this text into French - '{text}'",
      label: "Manual Translation To French"
    },
    {
      value: "Please find a recent 1-2 lines newsworthy summary for the company {text}.",
      label: "Sales"
    },
  ];
  const [template, setTemplate] = useState(options[0].value);

  recordActionBlock();

  function setGlobalValue(key, value) {
    globalConfig.setAsync(key, value);
  }

  function getGlobalValue(key) {
    return globalConfig.get(key);
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

  function populateTemplates() {
    let globalValue = getGlobalValue('customTemplateTexts');
    if (globalValue) {
      globalValue.map(customText => {
        options.push({
          value: customText,
          label: customText
        })
      })
    }
    options.push(
        {
          value: "custom",
          label: "Custom"
        });

    return options;
  }

  async function getStatus(baseId) {
    const requestUrl = `${BASE_URL}.json/?base_id=${baseId}`;
    const completedTasks = await (await fetch(requestUrl, {
      cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": getGlobalValue('aws_key'),
        "AWS_SECRET": getGlobalValue('aws_secret')
      }
    })).json();
    setCompletedTasksFromServer(completedTasks);
  }

  async function completeTask(cellId) {
    const opts = {
      base_id: base.id,
      cell_id: cellId,
    }
    const result = await (await fetch(`${BASE_URL}/complete.json`, {
      method: 'post', body: JSON.stringify(opts), cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": getGlobalValue('aws_key'),
        "AWS_SECRET": getGlobalValue('aws_secret')
      },
    })).json();
  }

  async function uploadTask() {
    let questionRaw = currentRecord.getCellValueAsString(fromField);
    const question = replaceText(template, questionRaw)
    const opts = {
      base_id: base.id,
      cell_id: selectedRecordId,
      question_raw: questionRaw,
      question: question,
      cost: costPerTask
    }
    const result = await (await fetch(`${BASE_URL}.json`, {
      method: 'post', body: JSON.stringify(opts), cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": getGlobalValue('aws_key'),
        "AWS_SECRET": getGlobalValue('aws_secret')
      },
    })).json();

    if (result) {
      setIsDialogOpen(true);
    }
  }

  function reviewOutputText() {
    return (currentRecord ? <Text
        display={selectedRecordId ? 'block' : 'none'}
        disabled={!selectedRecordId}
        style={{
          fontStyle: 'italic',
          fontWeight: 'bold'
        }}>{replaceText(template, currentRecord.getCellValueAsString(fromField))}</Text> : null);
  }

  function maybeDisplayCompletedTasks() {
    return completedTasksFromServer
        ? completedTasksFromServer.map(task => {
          return <div>
            <div style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              fontSize: 18,
              padding: 0
            }}>
              <Icon name="checklist" size={23}/>
              <Text paddingLeft={2} size="xsmall">{task.question_raw}</Text>
            </div>
            <CompletedTask key={task.cell_id} task={task} table={table} doneField={toField}/>
          </div>;
        })
        : null;
  }

  function syncBox() {
    return <Box padding={3} paddingBottom={4} marginLeft={3} marginBottom={3} border="default"
                borderRadius={8}>
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
          marginBottom={3}
          onClick={() => getStatus(base.id)}
          variant="primary"
          size="large"
          icon="premium"
          type="submit"
      >
        Retrieve Completed Tasks
      </Button>
      {maybeDisplayCompletedTasks()}
    </Box>;
  }

  function recordActionBlock() {
    const [recordActionData, setRecordActionData] = useState(null);
    const callback = (data) => {
      console.log('Record action received', data);
      setRecordActionData(data);
      setSelectedRecordId(data.recordId);
    }
    useEffect(() => {
      // Return the unsubscribe function so it's run on cleanup.
      return registerRecordActionDataCallback(callback);
    }, [callback]);
    if (recordActionData === null) {
      return null;
    }
  }

  function uploadSuccessDialog() {
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

  function TaskSelectButton({ table, recordId, doneField, response }) {
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
            disabled={!permissionCheck.hasPermission}
        >
          select
        </Button>
    );
  }

  function CompletedTask({ task, table, doneField }) {
    return (
        <div>
          {responses(task, table, doneField)}
        </div>
    );
  }

  function responses(task, table, doneField) {
    return task.responses.map(response => {
      return <Box overflowX="auto" padding={2} marginTop={2} backgroundColor={colors.GREEN}
                  border="thick"
                  borderRadius={8}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: 0
        }}>
          <Text paddingLeft={2} size="large" textColor={"white"}>{response}</Text>
          <TaskSelectButton table={table} recordId={task.cell_id} doneField={doneField}
                            response={response}/>
        </div>
      </Box>
    })
  }

  return (
      <div>
        {<SettingsBox table={table}/>}
        {fromField && toField ? <UploadTaskBox fromField={fromField} costPerTask={costPerTask}
                                               setCostPerTask={setCostPerTask}
                                               populateTemplates={populateTemplates}
                                               template={template}
                                               setTemplateOrDialog={setTemplateOrDialog}
                                               onAddCustomTemplate={onAddCustomTemplate}
                                               addingCustomTemplate={addingCustomTemplate}
                                               records={records}
                                               setSelectedRecordId={setSelectedRecordId}
                                               selectedRecordId={selectedRecordId}
                                               setCustomTemplateText={setCustomTemplateText}
                                               uploadTask={uploadTask}
                                               reviewOutputText={reviewOutputText}/> : null}
        {fromField && toField ? syncBox() : null}
        {uploadSuccessDialog()}
      </div>
  );
}


initializeBlock(() => <HumanIntelligenceBlock/>);
