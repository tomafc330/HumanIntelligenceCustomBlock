import React, { useEffect, useState } from 'react';
import { BASE_URL } from './settings';
import {
  Icon,
  Box,
  initializeBlock,
  registerRecordActionDataCallback,
  Text,
  useBase,
  useGlobalConfig,
  useRecordById,
  useRecords,
  useWatchable,
  useSettingsButton
} from '@airtable/blocks/ui';
import { cursor } from '@airtable/blocks';
import { replaceText } from './utils';
import UploadTaskBox from "./components/UploadTaskBox";
import SyncBox from "./components/SyncBox";
import UploadSuccessDialog from "./components/UploadSuccessDialog";
import CompletedTask from "./components/CompletedTask";
import SettingsComponent from "./components/SettingsComponent";

function HumanIntelligenceBlock() {
  const base = useBase();

  useWatchable(cursor, ['activeTableId', 'activeViewId']);

  const tableId = cursor.activeTableId;

  const globalConfig = useGlobalConfig();
  const fromFieldId = globalConfig.get(`${tableId}_FromFieldId`);
  const toFieldId = globalConfig.get(`${tableId}_ToFieldId`);

  const table = base.getTableByIdIfExists(tableId);
  const fromField = table ? table.getFieldByIdIfExists(fromFieldId) : null;
  const toField = table ? table.getFieldByIdIfExists(toFieldId) : null;

  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [addingCustomTemplate, setAddingCustomTemplate] = useState(false);
  const [customTemplateText, setCustomTemplateText] = useState('');
  const [costPerTask, setCostPerTask] = useState(0.20);
  const [numTasksRequested, setNumTasksRequested] = useState(2);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completedTasksFromServer, setCompletedTasksFromServer] = useState(null);
  const [isShowingSettings, setIsShowingSettings] = useState(false);

  const currentRecord = useRecordById(table, selectedRecordId ? selectedRecordId : "");

  // Don't need to fetch records if doneField doesn't exist (the field or it's parent table may
  // have been deleted, or may not have been selected yet.)
  const records = useRecords(table, { fields: [fromField] });

  const [template, setTemplate] = useState('');

  watchButtonClicks();

  function watchButtonClicks() {
    const [recordActionData, setRecordActionData] = useState(null);
    const callback = (data) => {
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

  async function getStatus(baseId) {
    setCompletedTasksFromServer(null);

    const requestUrl = `${BASE_URL}.json/?base_id=${baseId}`;
    const completedTasks = await (await fetch(requestUrl, {
      cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": globalConfig.get('aws_key'),
        "AWS_SECRET": globalConfig.get('aws_secret')
      }
    })).json();
    setCompletedTasksFromServer(completedTasks);
  }

  async function completeTask(cellId) {
    const opts = {
      base_id: base.id,
      cell_id: cellId,
    }
    await (await fetch(`${BASE_URL}/complete.json`, {
      method: 'post', body: JSON.stringify(opts), cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": globalConfig.get('aws_key'),
        "AWS_SECRET": globalConfig.get('aws_secret')
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
      cost: costPerTask,
      num_tasks_requested: numTasksRequested
    }
    const result = await (await fetch(`${BASE_URL}.json`, {
      method: 'post', body: JSON.stringify(opts), cors: true, headers: {
        "Content-Type": "application/json",
        "AWS_KEY": globalConfig.get('aws_key'),
        "AWS_SECRET": globalConfig.get('aws_secret')
      },
    })).json();

    if (result) {
      setIsDialogOpen(true);
    }
  }

  function maybeDisplayCompletedTasks() {
    if (completedTasksFromServer == null) {
      return null;
    }

    return completedTasksFromServer.length > 0
        ? completedTasksFromServer.map(task => {
          return <Box
              border="default"
              borderRadius={8}
              backgroundColor="white"
              padding={3}
          >
            <div style={{
              marginTop: 3,
              marginLeft: 3,
              display: 'flex',
              alignItems: 'center',
              fontSize: 12,
              padding: 0
            }}>
              <Icon name="checklist" size={23}/>
              <Text paddingLeft={2} size="xsmall" as="strong">Completed Task</Text>
            </div>
            <Text  size="xsmall">{task.question_raw}</Text>
            <CompletedTask key={task.cell_id}
                           task={task}
                           table={table}
                           doneField={toField}
                           completeTask={completeTask}
                           setCompletedTasksFromServer={setCompletedTasksFromServer}
                           completedTasksFromServer={completedTasksFromServer}
            />
          </Box>;
        })
        : <Text>There are no completed tasks yet! Please come back later and try again.</Text>;
  }

  useSettingsButton(function () {
    setIsShowingSettings(!isShowingSettings);
  });

  if (isShowingSettings) {
    return <SettingsComponent table={table} setIsShowingSettings={setIsShowingSettings}/>
  }

  return (
      <div>
        {fromField && toField ? <UploadTaskBox fromField={fromField}
                                               costPerTask={costPerTask}
                                               setCostPerTask={setCostPerTask}
                                               numTasksRequested={numTasksRequested}
                                               setNumTasksRequested={setNumTasksRequested}
                                               template={template}
                                               customTemplateText={customTemplateText}
                                               addingCustomTemplate={addingCustomTemplate}
                                               records={records}
                                               setSelectedRecordId={setSelectedRecordId}
                                               selectedRecordId={selectedRecordId}
                                               setCustomTemplateText={setCustomTemplateText}
                                               setAddingCustomTemplate={setAddingCustomTemplate}
                                               setTemplate={setTemplate}
                                               uploadTask={uploadTask}
                                               currentRecord={currentRecord}
        /> : null}
        {fromField && toField ? <SyncBox getStatus={getStatus}
                                         maybeDisplayCompletedTasks={maybeDisplayCompletedTasks}/> : null}
        {<UploadSuccessDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}/>}
      </div>
  );
}

initializeBlock(() => <HumanIntelligenceBlock/>);
