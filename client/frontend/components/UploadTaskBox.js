import React, { useState } from 'react';
import {
  Box,
  Button,
  FormField,
  Icon,
  Input,
  Select,
  Text,
  useBase,
  useGlobalConfig
} from '@airtable/blocks/ui';
import { replaceText } from "../utils";

const UploadTaskBox = (props) => {
  const { costPerTask, setCostPerTask, customTemplateText, numTasksRequested, setNumTasksRequested,
    template, setAddingCustomTemplate, setTemplate,
    addingCustomTemplate, setCustomTemplateText, records,
    selectedRecordId, setSelectedRecordId, uploadTask, fromField, currentRecord
  } = props;

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
  const base = useBase();
  const globalConfig = useGlobalConfig();

  function setTemplateOrDialog(newValue) {
    if (newValue === 'custom') {
      setAddingCustomTemplate(true)
    } else {
      setTemplate(newValue)
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

  function populateTemplates() {
    let globalValue = globalConfig.get('customTemplateTexts');
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
          label: "Add a Custom Template..."
        });

    return options;
  }

  function onAddCustomTemplate(event) {
    event.preventDefault();
    const arr = globalConfig.get('customTemplateTexts') || [];
    arr.push(customTemplateText)
    globalConfig.setAsync('customTemplateTexts', arr);
    setAddingCustomTemplate(false)
    setCustomTemplateText('');
  }


  return (
      <Box padding={3} margin={3} border="default" borderRadius={8}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 18,
          padding: 0
        }}>
          <Icon name="bolt" size={23}/>
          <Text paddingLeft={2} size="xsmall">Upload a Task to Human Intelligence</Text>
        </div>

        <FormField label="Enter how much you would like to pay for each task (in USD)">
          <Input
              type="textarea"
              flex="auto"
              value={costPerTask}
              onChange={e => setCostPerTask(e.target.value)}
              placeholder="ie. 0.20"
          />
        </FormField>

        <FormField label="Maximum workers allowed for this task">
          <Input
              type="textarea"
              flex="auto"
              value={numTasksRequested}
              onChange={e => setNumTasksRequested(e.target.value)}
              placeholder="2"
          />
        </FormField>

        <FormField label="Pick a template to use">
          <Select
              options={populateTemplates()}
              value={template}
              onChange={newValue => setTemplateOrDialog(newValue)}
          />
        </FormField>

        <form onSubmit={onAddCustomTemplate}>
          <Box display="flex" padding={0} borderRadius={8}>
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
              options={(records || []).map(record => {
                return {
                  value: record.id,
                  label: record.getCellValueAsString(fromField)
                }
              })}
              value={selectedRecordId}
              onChange={newValue => setSelectedRecordId(newValue)}
          />
        </FormField>
        <FormField label="Review Output" marginBottom={3}>
          {reviewOutputText()}
        </FormField>
        <Button
            onClick={() => uploadTask(base.id, selectedRecordId)}
            variant="primary"
            size="large"
            icon="premium"
            type="submit"
            disabled={!selectedRecordId}
        >
          Upload Task to Human Intelligence
        </Button>
      </Box>
  )
}

export default UploadTaskBox;