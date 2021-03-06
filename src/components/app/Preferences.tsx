import React, { useEffect, useState } from "react";
import Path from "path";
import settings from "electron-settings";
import l10n from "../../lib/helpers/l10n";
import getTmp from "../../lib/helpers/getTmp";
import ThemeProvider from "../ui/theme/ThemeProvider";
import GlobalStyle from "../ui/globalStyle";
import { PreferencesWrapper } from "../ui/preferences/Preferences";
import { FormField, FormRow } from "../ui/form/FormLayout";
import { TextField } from "../ui/form/TextField";
import { Button } from "../ui/buttons/Button";
import { DotsIcon } from "../ui/icons/Icons";
import { FixedSpacer, FlexGrow } from "../ui/spacing/Spacing";
import { AppSelect } from "../ui/form/AppSelect";

const { dialog } = require("electron").remote;

const Preferences = () => {
  const pathError = "";
  const [tmpPath, setTmpPath] = useState<string>("");
  const [imageEditorPath, setImageEditorPath] = useState<string>("");
  const [musicEditorPath, setMusicEditorPath] = useState<string>("");

  useEffect(() => {
    setTmpPath(getTmp(false));
    setImageEditorPath(String(settings.get("imageEditorPath") || ""));
    setMusicEditorPath(String(settings.get("musicEditorPath") || ""));
  }, []);

  const onChangeTmpPath = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPath = e.currentTarget.value;
    setTmpPath(newPath);
    settings.set("tmpDir", newPath);
  };

  const onChangeImageEditorPath = (path: string) => {
    setImageEditorPath(path);
    settings.set("imageEditorPath", path);
  };

  const onChangeMusicEditorPath = (path: string) => {
    setMusicEditorPath(path);
    settings.set("musicEditorPath", path);
  };

  const onSelectTmpFolder = async () => {
    const path = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (path.filePaths[0]) {
      const newPath = Path.normalize(`${path.filePaths[0]}/`);
      setTmpPath(newPath);
      settings.set("tmpDir", newPath);
    }
  };

  const onRestoreDefaultTmpPath = () => {
    settings.delete("tmpDir");
    setTmpPath(getTmp(false));
  };

  return (
    <ThemeProvider>
      <GlobalStyle />

      <PreferencesWrapper>
        <FormRow>
          <TextField
            name="path"
            label={l10n("FIELD_TMP_DIRECTORY")}
            errorLabel={pathError}
            value={tmpPath}
            onChange={onChangeTmpPath}
            additionalRight={
              <Button onClick={onSelectTmpFolder} type="button">
                <DotsIcon />
              </Button>
            }
            info={l10n("FIELD_TMP_DIRECTORY_INFO")}
          />
        </FormRow>
        <FormRow>
          <Button onClick={onRestoreDefaultTmpPath}>
            {l10n("FIELD_RESTORE_DEFAULT")}
          </Button>
        </FormRow>

        <FlexGrow />

        <FormRow>
          <FormField
            name="musicEditorPath"
            label={l10n("FIELD_DEFAULT_IMAGE_EDITOR")}
          >
            <AppSelect
              value={imageEditorPath}
              onChange={onChangeImageEditorPath}
            />
          </FormField>
        </FormRow>
        <FixedSpacer height={10} />

        <FormRow>
          <FormField
            name="musicEditorPath"
            label={l10n("FIELD_DEFAULT_MUSIC_EDITOR")}
          >
            <AppSelect
              value={musicEditorPath}
              onChange={onChangeMusicEditorPath}
            />
          </FormField>
        </FormRow>
      </PreferencesWrapper>
    </ThemeProvider>
  );
};

export default Preferences;
