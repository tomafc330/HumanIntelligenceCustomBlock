import React from 'react';
import SettingsBox from "./SettingsBox";

const SettingsComponent = (props) => {
  const {
    table,
    setIsShowingSettings
  } = props;

  return (
      <SettingsBox table={table} setIsShowingSettings={setIsShowingSettings}/>
  )
}

export default SettingsComponent;