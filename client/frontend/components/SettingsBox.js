import React from 'react';
import {
  Box, Button,
  FieldPickerSynced,
  FormField,
  Heading,
  Icon,
  Input,
  Text,
  useGlobalConfig
} from '@airtable/blocks/ui';
import { FieldType } from "@airtable/blocks/models";

const SettingsBox = (props) => {
  const {
    table,
    setIsShowingSettings
  } = props;

  const globalConfig = useGlobalConfig();

  function setGlobalValue(key, value) {
    globalConfig.setAsync(key, value);
  }

  function getGlobalValue(key) {
    return globalConfig.get(key);
  }

  return (
      <Box padding={3} margin={3} border="default" borderRadius={8}>
        <Heading paddingTop={1} size="medium">Welcome to Human Intelligence Block (HIB)</Heading>
        <Heading size="xsmall" textColor="light">Get manual tasks done for you easily on the Amazon
          tasks marketplace! Please
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
              globalConfigKey={`${table.id}_FromFieldId`}
              placeholder="Field to use data from"
              allowedTypes={[FieldType.MULTILINE_TEXT, FieldType.SINGLE_LINE_TEXT, FieldType.RICH_TEXT]}
          />
        </FormField>
        <FormField label="Field to write data to" marginBottom={3}>
          <FieldPickerSynced
              table={table}
              globalConfigKey={`${table.id}_ToFieldId`}
              placeholder="Field to write data to"
              allowedTypes={[FieldType.MULTILINE_TEXT, FieldType.SINGLE_LINE_TEXT, FieldType.RICH_TEXT]}
          />
        </FormField>

        <Button variant="primary" marginLeft={0} marginTop={1}
                onClick={() => setIsShowingSettings(false)}>
          Back
        </Button>
      </Box>
  )
}

export default SettingsBox;