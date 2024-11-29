import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FaEllipsis,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPaperPlane,
  FaMoon,
} from 'react-icons/fa6';
import useTranscribeStreaming from '../hooks/useTranscribeStreaming';
import ButtonIcon from './ButtonIcon';

const IDENTITY_POOL_ID = import.meta.env.VITE_APP_IDENTITY_POOL_ID!;
const REGION = import.meta.env.VITE_APP_REGION!;

type Props = {
  className?: string;
  content: string;
  transcribeLanguageCode?: string;
  disabled?: boolean;
  onChange: (s: string) => void;
  onSend: (content: string) => void;
  onRegisterPrompt: () => void;
};

const InputQuestion: React.FC<Props> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [textareaValue, setTextareaValue] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const { t } = useTranslation();
  const disabledSend = useMemo(() => {
    return props.content === '' || props.disabled;
  }, [props.content, props.disabled]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const listener = (e: DocumentEventMap['keypress']) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();

        if (!disabledSend) {
          props.onSend(props.content);
        }
      }
    };
    const element = inputRef.current;
    element?.addEventListener('keypress', listener);

    return () => {
      element?.removeEventListener('keypress', listener);
    };
  });

  const { transcripts, recording, startRecording, stopRecording } =
    useTranscribeStreaming({
      languageCode: props.transcribeLanguageCode ?? '',
      identityPoolId: IDENTITY_POOL_ID,
      region: REGION,
    });

  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    for (const t of transcripts) {
      if (!t.isPartial) {
        props.onSend(t.transcripts.join(' '));
        setTranscript('');
      } else {
        setTranscript(t.transcripts.join(' '));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcripts]);

  return (
    <div className={`${props.className ?? ''} relative`}>
      <div className="border-primary/50 flex h-20 items-center justify-between rounded-3xl border-2 bg-white">
        <div className="mx-5">
          {recording ? (
            <ButtonIcon onClick={stopRecording}>
              <FaMicrophoneSlash />
            </ButtonIcon>
          ) : (
            <div>
              <ButtonIcon
                onClick={startRecording}
                disabled={(props.transcribeLanguageCode ?? '') === ''}>
                <FaMicrophone />
              </ButtonIcon>
            </div>
          )}
        </div>

        {recording ? (
          <div className="flex w-full items-end">
            {transcript === '' ? (
              <>
                {t('message.transcribing')}
                <FaEllipsis className="text-primary ml-1  animate-bounce" />
              </>
            ) : (
              <div>{transcript}</div>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            className="h-full w-full outline-none"
            placeholder={t('inputPlaceholder')}
            value={props.content}
            onChange={(e) => {
              props.onChange(e.target.value);
            }}
          />
        )}

        <ButtonIcon
          className="mx-5"
          // disabled={disabledSend}
          square
          onClick={() => {
            handleOpenModal();
          }}>
          <FaMoon />
        </ButtonIcon>

        <ButtonIcon
          className="mx-5"
          disabled={disabledSend}
          square
          onClick={() => {
            props.onSend(props.content);
          }}>
          <FaPaperPlane />
        </ButtonIcon>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50"
               style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
            <div className="bg-white p-5 rounded-lg shadow-lg max-w-screen-md w-full">
              <textarea
                className="w-full mt-4 p-2 border rounded resize-none"
                placeholder="プロンプトを入力してください（最大1200文字）"
                rows={15}
                maxLength={1200}
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
              />
              <div className="flex justify-end mt-4">
                <button
                  className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-700 bg-primary text-text-white"
                  onClick={() => {
                    // props.onSend(props.content);
                    sessionStorage.setItem('systemPrompt', textareaValue)
                    handleCloseModal();
                    props.onRegisterPrompt();
                  }}
                >
                  登録
                </button>
                <button
                  className="ml-2 bg-gray-500 px-4 py-2 rounded hover:bg-gray-700 bg-primary text-text-white"
                  onClick={handleCloseModal}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputQuestion;
