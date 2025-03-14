import { useEffect, useRef } from "react";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { debounce } from "lodash";
import { type RootState, type AppDispatch } from "../../lib/redux/store";
import {
  loadStateFromDatabase,
  saveStateToDatabase,
} from "../../lib/redux/local-storage";
import { initialResumeState, setResume } from "../../lib/redux/resumeSlice";
import {
  initialSettings,
  setSettings,
  type Settings,
} from "../../lib/redux/settingsSlice";
import { deepMerge } from "../../lib/deep-merge";
import type { Resume } from "../../lib/redux/types";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to save store to local storage on store change
 */
export const useSaveStateToDatabaseOnChange = (
  setIsLoading: (isLoading: boolean) => void,
) => {
  const state = useAppSelector((state) => state);
  const prevStateRef = useRef(state);

  useEffect(() => {
    setIsLoading(true);
    const hasStateChanged =
      JSON.stringify(prevStateRef.current) !== JSON.stringify(state);

    if (!hasStateChanged) return setIsLoading(false);

    const debouncedSave = debounce(async () => {
      await saveStateToDatabase(state);
      prevStateRef.current = state;
      setIsLoading(false);
    }, 2000);
    debouncedSave();

    return () => {
      debouncedSave.cancel();
    };
  }, [state]);
};

export const useSetInitialStore = (
  setIsLoading: (isLoading: boolean) => void,
) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const setInitialStore = async () => {
      setIsLoading(true);
      const state = await loadStateFromDatabase();
      if (!state) return setIsLoading(false);
      if (state.resume) {
        // We merge the initial state with the stored state to ensure
        // backward compatibility, since new fields might be added to
        // the initial state over time.
        const mergedResumeState = deepMerge(
          initialResumeState,
          state.resume,
        ) as Resume;
        dispatch(setResume(mergedResumeState));
      }
      if (state.settings) {
        const mergedSettingsState = deepMerge(
          initialSettings,
          state.settings,
        ) as Settings;
        dispatch(setSettings(mergedSettingsState));
      }
      setIsLoading(false);
    };
    setInitialStore();
  }, []);
};
