import React, { useCallback, useState } from 'react';

import { Engine, Scene } from 'react-babylonjs';
import { Color4, Vector3 } from '@babylonjs/core';
import Avatar from './components/Avatar';
import useAvatar from './hooks/useAvatar';
import useQuestion from './hooks/useQuestion';
import InputQuestion from './components/InputQuestion';
import { produce } from 'immer';
// import Select from './components/Select';
// import { PiGlobe } from 'react-icons/pi';
import './i18n';
import { LANGUAGE_OPTIONS } from './i18n';
import { useTranslation } from 'react-i18next';
// import { useTranscribeStreamingState } from './hooks/useTranscribeStreaming';

const App: React.FC = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [language] = useState('日本語');
  const [questionedContents, setQuestionedContents] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);

  // const { recording } = useTranscribeStreamingState();

  const { startThinking, stopThinking, startSpeech } = useAvatar();
  const { answerText, question } = useQuestion();

  const onSendQuestion = useCallback(
    (questionContent: string) => {
      setIsLoading(true);
      setContent('');
      setQuestionedContents(
        produce(questionedContents, (draft) => {
          draft[draft.length - 1] = questionContent;
          draft.push('');
        }),
      );
      startThinking();
      try {
        const prompt = sessionStorage.getItem('systemPrompt') || '';

        question(
          questionContent,
          prompt,
          language,
          LANGUAGE_OPTIONS.filter((l) => l.value === language)[0].code,
          startSpeech,
        ).finally(() => {
          setIsLoading(false);
        });
      } catch (e) {
        console.log(e);
        stopThinking();
      }
    },
    [
      language,
      question,
      questionedContents,
      startSpeech,
      startThinking,
      stopThinking,
    ],
  );

  const onRegisterPrompt = useCallback(() => {
    const systemPrompt = sessionStorage.getItem('systemPrompt');
    console.log(systemPrompt);
  }, []);

  const onRegisterPrompt = useCallback(() => {
    const systemPrompt = sessionStorage.getItem('systemPrompt');
    console.log(systemPrompt);
  }, []);

  return (
    <div className="bg-background-white text-text-black relative">
      <div className="relative h-screen w-screen">
        {/*<div className="absolute right-5 top-5 z-30 flex items-center">*/}
        {/*  <PiGlobe className="mr-2 text-xl" />*/}
        {/*  <Select*/}
        {/*    className="w-36"*/}
        {/*    options={LANGUAGE_OPTIONS}*/}
        {/*    disabled={recording}*/}
        {/*    value={language}*/}
        {/*    onChange={onChangeLanguage}*/}
        {/*  />*/}
        {/*</div>*/}
        <div className=" absolute top-10 z-20 flex w-full flex-col items-center">
          {answerText === '' && (
            <div className="rounded-md mt-20 p-5 text-base"
                 style={{
                   backgroundColor: '#e0f7fa',
                   color: '#000000'
                 }}
            >
              {t('message.initial')
                .split('\n')
                .map((s) => (
                  <div>{s}</div>
                ))}
            </div>
          )}

          <div className="flex w-3/4 flex-col items-center">
            {/*{questionedContents.map((qc, idx) => (*/}
            {/*  <React.Fragment key={idx}>*/}
            {/*    {idx >= questionedContents.length - 2 && (*/}
            {/*      <div*/}
            {/*        className={`${*/}
            {/*          qc === ''*/}
            {/*            ? 'translate-y-[70vh] opacity-0'*/}
            {/*            : 'translate-y-0'*/}
            {/*        } transision border-primary/50  mb-5 w-4/5 rounded-md border-2 bg-white/50 p-3 duration-500`}>*/}
            {/*        {qc}*/}
            {/*      </div>*/}
            {/*    )}*/}
            {/*  </React.Fragment>*/}
            {/*))}*/}

            {answerText !== '' && (
              <>
                <div
                  className="mt-10 ml-60 rounded-md p-5 text-base"
                  style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    backgroundColor: '#e0f7fa',
                    color: '#000000'
                  }}
                >
                  {answerText.split(/\n/).map((line, index) => (
                    line.trim() === '' ? <br key={index} /> : <div key={index}>{line}</div>
                  ))}
                </div>
                {/*<div className="border-t-primary h-8 w-8 border-[20px] border-transparent"></div>*/}
              </>
            )}
          </div>
        </div>
        <div className="absolute h-full w-full flex items-start">
          <div className="w-[600px] h-[600px]">
            <Engine antialias adaptToDeviceRatio width="100%" height="100%">
              <Scene clearColor={new Color4(0.95, 0.95, 0.95)}>
                <arcRotateCamera
                  name="Camera"
                  alpha={1.5}
                  beta={1.5}
                  radius={2}
                  target={Vector3.Zero()}
                />
                <Avatar />
              </Scene>
            </Engine>
          </div>
        </div>
      </div>
      <div className="fixed bottom-16 z-30 m-3 flex w-full justify-center ">
        <InputQuestion
          className="w-4/5"
          transcribeLanguageCode={
            LANGUAGE_OPTIONS.filter((l) => l.value === language)[0]
              .transcribeCode
          }
          content={content}
          disabled={isLoading}
          onChange={setContent}
          onSend={onSendQuestion}
          onRegisterPrompt={onRegisterPrompt}
        />
      </div>
      <div className="bg-primary fixed bottom-0 h-10 w-full" />
    </div>
  );
};

export default App;
