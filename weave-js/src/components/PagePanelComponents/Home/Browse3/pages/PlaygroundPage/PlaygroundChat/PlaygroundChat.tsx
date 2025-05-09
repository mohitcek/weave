import {Box, CircularProgress, Divider} from '@mui/material';
import {MOON_200, MOON_500, WHITE} from '@wandb/weave/common/css/color.styles';
import {hexToRGB} from '@wandb/weave/common/css/utils';
import {TargetBlank} from '@wandb/weave/common/util/links';
import {Button} from '@wandb/weave/components/Button';
import {Tailwind} from '@wandb/weave/components/Tailwind';
import getConfig from '@wandb/weave/config';
import React, {Dispatch, SetStateAction, useMemo, useState} from 'react';

import {CallChat} from '../../CallPage/CallChat';
import {Empty} from '../../common/Empty';
import {EMPTY_PROPS_NO_LLM_PROVIDERS} from '../../common/EmptyContent';
import {TraceCallSchema} from '../../wfReactInterface/traceServerClientTypes';
import {PlaygroundContext} from '../PlaygroundContext';
import {PlaygroundMessageRole, PlaygroundState} from '../types';
import {useConfiguredProviders} from '../useConfiguredProviders';
import {PlaygroundCallStats} from './PlaygroundCallStats';
import {PlaygroundChatInput} from './PlaygroundChatInput';
import {PlaygroundChatTopBar} from './PlaygroundChatTopBar';
import {useChatCompletionFunctions} from './useChatCompletionFunctions';
import {
  SetPlaygroundStateFieldFunctionType,
  useChatFunctions,
} from './useChatFunctions';

const EmptyWithSettingsButton: React.FC<{
  emptyProps: typeof EMPTY_PROPS_NO_LLM_PROVIDERS;
  onSettingsClick: () => void;
  entity: string;
  project: string;
}> = ({emptyProps, onSettingsClick, entity, project}) => {
  const {urlPrefixed} = getConfig();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
      <Empty {...emptyProps} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
        <Box sx={{display: 'flex', gap: '8px'}}>
          <Button
            variant="secondary"
            onClick={() => {
              window.open(
                urlPrefixed(`/${entity}/${project}/overview/providers`)
              );
            }}
            size="medium">
            View project providers
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open(urlPrefixed(`/${entity}/settings`), '_blank');
              onSettingsClick();
            }}
            icon="key-admin"
            size="medium">
            Configure secrets
          </Button>
        </Box>
        <Tailwind>
          <div
            className="mt-[16px] max-w-[400px] text-center text-sm"
            style={{color: MOON_500}}>
            Example setup:
            <br />
            Find your OpenAI API key in your{' '}
            <TargetBlank href="https://platform.openai.com/api-keys">
              OpenAI dashboard
            </TargetBlank>
            . <br /> Use <code className="mx-1.5 text-sm">OPENAI_API_KEY</code>{' '}
            as your team's secret.
          </div>
        </Tailwind>
      </Box>
    </Box>
  );
};

export type PlaygroundChatProps = {
  entity: string;
  project: string;
  setPlaygroundStates: Dispatch<SetStateAction<PlaygroundState[]>>;
  playgroundStates: PlaygroundState[];
  setPlaygroundStateField: SetPlaygroundStateFieldFunctionType;
  setSettingsTab: (callIndex: number | null) => void;
  settingsTab: number | null;
};

export const PlaygroundChat = ({
  entity,
  project,
  setPlaygroundStates,
  playgroundStates,
  setPlaygroundStateField,
  setSettingsTab,
  settingsTab,
}: PlaygroundChatProps) => {
  const [chatText, setChatText] = useState('');
  const {result: configuredProviders, loading: configuredProvidersLoading} =
    useConfiguredProviders(entity);

  const {handleRetry, handleSend} = useChatCompletionFunctions(
    setPlaygroundStates,
    setPlaygroundStateField,
    playgroundStates,
    entity,
    project,
    setChatText
  );

  const {deleteMessage, editMessage, deleteChoice, editChoice, addMessage} =
    useChatFunctions(setPlaygroundStateField);

  const handleAddMessage = (role: PlaygroundMessageRole, text: string) => {
    for (let i = 0; i < playgroundStates.length; i++) {
      addMessage(i, {role, content: text});
    }
    setChatText('');
  };

  // Check if any chat is loading
  const isAnyLoading = useMemo(
    () => playgroundStates.some(state => state.loading),
    [playgroundStates]
  );

  // Check if there are any configured providers
  const hasConfiguredProviders = useMemo(() => {
    if (configuredProvidersLoading) {
      return true;
    } // Don't show empty state while loading
    return Object.values(configuredProviders).some(({status}) => status);
  }, [configuredProviders, configuredProvidersLoading]);

  if (!hasConfiguredProviders) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            maxHeight: 'calc(100% - 130px)',
            display: 'flex',
            position: 'relative',
          }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
            <Box
              sx={{
                backgroundColor: 'white',
                borderBottom: `1px solid ${MOON_200}`,
                position: 'absolute',
                top: '0',
                width: '100%',
                paddingTop: '8px',
                paddingBottom: '8px',
                paddingLeft: '16px',
                paddingRight: '16px',
                zIndex: 10,
              }}>
              <PlaygroundChatTopBar
                idx={0}
                settingsTab={settingsTab}
                setSettingsTab={setSettingsTab}
                setPlaygroundStateField={setPlaygroundStateField}
                setPlaygroundStates={setPlaygroundStates}
                playgroundStates={playgroundStates}
                entity={entity}
                project={project}
              />
            </Box>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '48px',
              }}>
              <EmptyWithSettingsButton
                emptyProps={EMPTY_PROPS_NO_LLM_PROVIDERS}
                onSettingsClick={() => setSettingsTab(0)}
                entity={entity}
                project={project}
              />
            </Box>
          </Box>
        </Box>
        <PlaygroundChatInput
          chatText={chatText}
          setChatText={setChatText}
          isLoading={isAnyLoading}
          onSend={handleSend}
          onAdd={handleAddMessage}
          settingsTab={settingsTab}
          hasConfiguredProviders={hasConfiguredProviders}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden', // Rely on inner overflows, not outer page
      }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: 'calc(100% - 130px)',
          display: 'flex',
          position: 'relative',
        }}>
        {playgroundStates.map((state, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  height: '100%',
                  borderRight: `1px solid ${MOON_200}`,
                }}
              />
            )}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}>
              {state.loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: hexToRGB(WHITE, 0.7),
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <CircularProgress />
                </Box>
              )}
              <Box
                sx={{
                  backgroundColor: 'white',
                  borderBottom: `1px solid ${MOON_200}`,
                  position: 'absolute',
                  top: '0',
                  width: '100%',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  zIndex: 10,
                }}>
                <PlaygroundChatTopBar
                  idx={idx}
                  settingsTab={settingsTab}
                  setSettingsTab={setSettingsTab}
                  setPlaygroundStateField={setPlaygroundStateField}
                  setPlaygroundStates={setPlaygroundStates}
                  playgroundStates={playgroundStates}
                  entity={entity}
                  project={project}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  overflow: 'scroll',
                  paddingTop: '48px', // Height of the top bar
                  paddingX: '16px',
                  flexGrow: 1,
                }}>
                <Tailwind>
                  <div className=" mx-auto mt-[32px] h-full min-w-[400px] max-w-[800px] pb-8">
                    {state.traceCall && (
                      <PlaygroundContext.Provider
                        value={{
                          isPlayground: true,
                          deleteMessage: (messageIndex, responseIndexes) =>
                            deleteMessage(idx, messageIndex, responseIndexes),
                          editMessage: (messageIndex, newMessage) =>
                            editMessage(idx, messageIndex, newMessage),
                          deleteChoice: (messageIndex, choiceIndex) =>
                            deleteChoice(idx, choiceIndex),
                          addMessage: newMessage => addMessage(idx, newMessage),
                          editChoice: (choiceIndex, newChoice) =>
                            editChoice(idx, choiceIndex, newChoice),
                          retry: (messageIndex: number, choiceIndex?: number) =>
                            handleRetry(idx, messageIndex, choiceIndex),
                          sendMessage: (
                            role: PlaygroundMessageRole,
                            content: string,
                            toolCallId?: string
                          ) => {
                            handleSend(
                              role,
                              chatText,
                              idx,
                              content,
                              toolCallId
                            );
                          },
                          setSelectedChoiceIndex: (choiceIndex: number) =>
                            setPlaygroundStateField(
                              idx,
                              'selectedChoiceIndex',
                              choiceIndex
                            ),
                        }}>
                        <CallChat call={state.traceCall as TraceCallSchema} />
                      </PlaygroundContext.Provider>
                    )}
                  </div>
                  {/* Spacer used for leaving room for the input */}
                  <div className="h-[125px] w-full" />
                </Tailwind>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '800px',
                  padding: '8px',
                  paddingLeft: '12px',
                  marginX: 'auto',
                  marginBottom: '16px',
                }}>
                {state.traceCall.summary && (
                  <PlaygroundCallStats
                    call={state.traceCall as TraceCallSchema}
                  />
                )}
              </Box>
            </Box>
          </React.Fragment>
        ))}
      </Box>
      <PlaygroundChatInput
        chatText={chatText}
        setChatText={setChatText}
        isLoading={isAnyLoading}
        onSend={handleSend}
        onAdd={handleAddMessage}
        settingsTab={settingsTab}
        hasConfiguredProviders={hasConfiguredProviders}
      />
    </Box>
  );
};
