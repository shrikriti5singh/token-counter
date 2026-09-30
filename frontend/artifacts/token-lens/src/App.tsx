import { type CSSProperties, type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Activity,
  Check,
  ChevronDown,
  CircleAlert,
  Clipboard,
  Code2,
  Command,
  RotateCcw,
  ScanLine,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { setBaseUrl, useTokeniseText, type TokeniseResult } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import './index.css';

const queryClient = new QueryClient();
// Generated paths already include /api; an empty base keeps same-app requests on /api.
setBaseUrl(import.meta.env.VITE_API_BASE_URL || '');

const MODEL_OPTIONS = [
  // ─────────────────────────────────────────────
  // OpenAI
  // ─────────────────────────────────────────────
  { value: 'gpt-5', label: 'GPT-5', detail: 'o200k_base' },
  { value: 'gpt-5-mini', label: 'GPT-5 mini', detail: 'o200k_base' },
  { value: 'gpt-5-nano', label: 'GPT-5 nano', detail: 'o200k_base' },

  { value: 'gpt-4.1', label: 'GPT-4.1', detail: 'o200k_base' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini', detail: 'o200k_base' },
  { value: 'gpt-4.1-nano', label: 'GPT-4.1 nano', detail: 'o200k_base' },

  { value: 'gpt-4o', label: 'GPT-4o', detail: 'o200k_base' },
  { value: 'gpt-4o-mini', label: 'GPT-4o mini', detail: 'o200k_base' },

  { value: 'gpt-4.5', label: 'GPT-4.5', detail: 'o200k_base' },
  { value: 'gpt-4', label: 'GPT-4', detail: 'cl100k_base' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', detail: 'cl100k_base' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', detail: 'cl100k_base' },

  // OpenAI reasoning
  { value: 'o1', label: 'o1', detail: 'o200k_base' },
  { value: 'o1-mini', label: 'o1 mini', detail: 'o200k_base' },
  { value: 'o1-preview', label: 'o1 preview', detail: 'o200k_base' },
  { value: 'o3', label: 'o3', detail: 'o200k_base' },
  { value: 'o3-mini', label: 'o3 mini', detail: 'o200k_base' },
  { value: 'o4-mini', label: 'o4 mini', detail: 'o200k_base' },

  // OpenAI embeddings / older
  { value: 'text-embedding-3-large', label: 'text-embedding-3-large', detail: 'cl100k_base' },
  { value: 'text-embedding-3-small', label: 'text-embedding-3-small', detail: 'cl100k_base' },
  { value: 'text-embedding-ada-002', label: 'text-embedding-ada-002', detail: 'cl100k_base' },
  { value: 'text-davinci-003', label: 'text-davinci-003', detail: 'p50k_base' },
  { value: 'text-davinci-002', label: 'text-davinci-002', detail: 'p50k_base' },
  { value: 'code-davinci-002', label: 'code-davinci-002', detail: 'p50k_base' },
  { value: 'davinci', label: 'Davinci', detail: 'r50k_base' },
  { value: 'curie', label: 'Curie', detail: 'r50k_base' },
  { value: 'babbage', label: 'Babbage', detail: 'r50k_base' },
  { value: 'ada', label: 'Ada', detail: 'r50k_base' },

  // ─────────────────────────────────────────────
  // Anthropic
  // ─────────────────────────────────────────────
  { value: 'claude-4.5-opus', label: 'Claude 4.5 Opus', detail: 'Anthropic' },
  { value: 'claude-4.5-sonnet', label: 'Claude 4.5 Sonnet', detail: 'Anthropic' },
  { value: 'claude-4-opus', label: 'Claude 4 Opus', detail: 'Anthropic' },
  { value: 'claude-4-sonnet', label: 'Claude 4 Sonnet', detail: 'Anthropic' },
  { value: 'claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', detail: 'Anthropic' },
  { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', detail: 'Anthropic' },
  { value: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku', detail: 'Anthropic' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', detail: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', detail: 'Anthropic' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku', detail: 'Anthropic' },

  // ─────────────────────────────────────────────
  // Meta Llama
  // ─────────────────────────────────────────────
  { value: 'meta-llama/Llama-4-Scout', label: 'Llama 4 Scout', detail: 'Meta' },
  { value: 'meta-llama/Llama-4-Maverick', label: 'Llama 4 Maverick', detail: 'Meta' },

  { value: 'meta-llama/Llama-3.3-70B-Instruct', label: 'Llama 3.3 70B Instruct', detail: 'Meta' },
  { value: 'meta-llama/Llama-3.2-90B-Vision-Instruct', label: 'Llama 3.2 90B Vision', detail: 'Meta' },
  { value: 'meta-llama/Llama-3.2-11B-Vision-Instruct', label: 'Llama 3.2 11B Vision', detail: 'Meta' },
  { value: 'meta-llama/Llama-3.2-3B-Instruct', label: 'Llama 3.2 3B Instruct', detail: 'Meta' },
  { value: 'meta-llama/Llama-3.2-1B-Instruct', label: 'Llama 3.2 1B Instruct', detail: 'Meta' },

  { value: 'meta-llama/Meta-Llama-3.1-405B-Instruct', label: 'Llama 3.1 405B Instruct', detail: 'Meta' },
  { value: 'meta-llama/Meta-Llama-3.1-70B-Instruct', label: 'Llama 3.1 70B Instruct', detail: 'Meta' },
  { value: 'meta-llama/Meta-Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B Instruct', detail: 'Meta' },

  { value: 'meta-llama/Meta-Llama-3-70B-Instruct', label: 'Llama 3 70B Instruct', detail: 'Meta' },
  { value: 'meta-llama/Meta-Llama-3-8B-Instruct', label: 'Llama 3 8B Instruct', detail: 'Meta' },

  // ─────────────────────────────────────────────
  // Qwen
  // ─────────────────────────────────────────────
  { value: 'Qwen/Qwen3-0.6B', label: 'Qwen3 0.6B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-1.7B', label: 'Qwen3 1.7B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-4B', label: 'Qwen3 4B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-8B', label: 'Qwen3 8B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-14B', label: 'Qwen3 14B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-32B', label: 'Qwen3 32B', detail: 'Qwen' },
  { value: 'Qwen/Qwen3-30B-A3B', label: 'Qwen3 30B-A3B', detail: 'Qwen' },

  { value: 'Qwen/Qwen2.5-0.5B', label: 'Qwen2.5 0.5B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-1.5B', label: 'Qwen2.5 1.5B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-3B', label: 'Qwen2.5 3B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-7B', label: 'Qwen2.5 7B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-14B', label: 'Qwen2.5 14B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-32B', label: 'Qwen2.5 32B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-72B', label: 'Qwen2.5 72B', detail: 'Qwen' },

  // Qwen Coder
  { value: 'Qwen/Qwen2.5-Coder-0.5B', label: 'Qwen2.5 Coder 0.5B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-Coder-1.5B', label: 'Qwen2.5 Coder 1.5B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-Coder-3B', label: 'Qwen2.5 Coder 3B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-Coder-7B', label: 'Qwen2.5 Coder 7B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-Coder-14B', label: 'Qwen2.5 Coder 14B', detail: 'Qwen' },
  { value: 'Qwen/Qwen2.5-Coder-32B', label: 'Qwen2.5 Coder 32B', detail: 'Qwen' },

  // ─────────────────────────────────────────────
  // DeepSeek
  // ─────────────────────────────────────────────
  { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1', detail: 'DeepSeek' },
  { value: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', detail: 'DeepSeek' },
  { value: 'deepseek-ai/DeepSeek-V3.1', label: 'DeepSeek V3.1', detail: 'DeepSeek' },
  { value: 'deepseek-ai/DeepSeek-Coder-V2', label: 'DeepSeek Coder V2', detail: 'DeepSeek' },
  { value: 'deepseek-ai/deepseek-coder-33b-instruct', label: 'DeepSeek Coder 33B', detail: 'DeepSeek' },

  // ─────────────────────────────────────────────
  // Mistral
  // ─────────────────────────────────────────────
  { value: 'mistralai/Mistral-7B-v0.3', label: 'Mistral 7B v0.3', detail: 'Mistral' },
  { value: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B Instruct', detail: 'Mistral' },
  { value: 'mistralai/Mistral-Small-3.1-24B-Instruct', label: 'Mistral Small 3.1 24B', detail: 'Mistral' },
  { value: 'mistralai/Mistral-Large-Instruct-2411', label: 'Mistral Large', detail: 'Mistral' },
  { value: 'mistralai/Mixtral-8x7B-v0.1', label: 'Mixtral 8x7B', detail: 'Mistral' },
  { value: 'mistralai/Mixtral-8x22B-v0.1', label: 'Mixtral 8x22B', detail: 'Mistral' },
  { value: 'mistralai/Codestral-22B-v0.1', label: 'Codestral 22B', detail: 'Mistral' },

  // ─────────────────────────────────────────────
  // Google Gemma
  // ─────────────────────────────────────────────
  { value: 'google/gemma-3-1b-it', label: 'Gemma 3 1B', detail: 'Google' },
  { value: 'google/gemma-3-4b-it', label: 'Gemma 3 4B', detail: 'Google' },
  { value: 'google/gemma-3-12b-it', label: 'Gemma 3 12B', detail: 'Google' },
  { value: 'google/gemma-3-27b-it', label: 'Gemma 3 27B', detail: 'Google' },
  { value: 'google/gemma-2-2b-it', label: 'Gemma 2 2B', detail: 'Google' },
  { value: 'google/gemma-2-9b-it', label: 'Gemma 2 9B', detail: 'Google' },
  { value: 'google/gemma-2-27b-it', label: 'Gemma 2 27B', detail: 'Google' },

  // ─────────────────────────────────────────────
  // Microsoft Phi
  // ─────────────────────────────────────────────
  { value: 'microsoft/Phi-4-mini-instruct', label: 'Phi-4 Mini', detail: 'Microsoft' },
  { value: 'microsoft/phi-4', label: 'Phi-4', detail: 'Microsoft' },
  { value: 'microsoft/Phi-3.5-mini-instruct', label: 'Phi-3.5 Mini', detail: 'Microsoft' },
  { value: 'microsoft/Phi-3-mini-4k-instruct', label: 'Phi-3 Mini', detail: 'Microsoft' },
  { value: 'microsoft/Phi-3-small-8k-instruct', label: 'Phi-3 Small', detail: 'Microsoft' },
  { value: 'microsoft/Phi-3-medium-4k-instruct', label: 'Phi-3 Medium', detail: 'Microsoft' },

  // ─────────────────────────────────────────────
  // Cohere
  // ─────────────────────────────────────────────
  { value: 'CohereForAI/c4ai-command-r-plus', label: 'Command R+', detail: 'Cohere' },
  { value: 'CohereForAI/c4ai-command-r-v01', label: 'Command R', detail: 'Cohere' },

  // ─────────────────────────────────────────────
  // IBM Granite
  // ─────────────────────────────────────────────
  { value: 'ibm-granite/granite-3.3-8b-instruct', label: 'Granite 3.3 8B', detail: 'IBM' },
  { value: 'ibm-granite/granite-3.2-8b-instruct', label: 'Granite 3.2 8B', detail: 'IBM' },

  // ─────────────────────────────────────────────
  // Zhipu / GLM
  // ─────────────────────────────────────────────
  { value: 'zai-org/GLM-4.5', label: 'GLM-4.5', detail: 'Zhipu AI' },
  { value: 'zai-org/GLM-4.5-Air', label: 'GLM-4.5 Air', detail: 'Zhipu AI' },
  { value: 'THUDM/GLM-4-9B-Chat', label: 'GLM-4 9B', detail: 'Zhipu AI' },

  // ─────────────────────────────────────────────
  // Falcon
  // ─────────────────────────────────────────────
  { value: 'tiiuae/falcon-7b-instruct', label: 'Falcon 7B Instruct', detail: 'TII' },
  { value: 'tiiuae/falcon-40b-instruct', label: 'Falcon 40B Instruct', detail: 'TII' },

  // ─────────────────────────────────────────────
  // GPT-2 / BERT — useful tokenizer references
  // ─────────────────────────────────────────────
  { value: 'gpt2', label: 'GPT-2', detail: 'OpenAI / BPE' },
  { value: 'google-bert/bert-base-uncased', label: 'BERT Base Uncased', detail: 'BERT / WordPiece' },
  { value: 'google-bert/bert-base-cased', label: 'BERT Base Cased', detail: 'BERT / WordPiece' },
  { value: 'google-bert/bert-large-uncased', label: 'BERT Large Uncased', detail: 'BERT / WordPiece' },
  { value: 'google-bert/bert-base-multilingual-cased', label: 'BERT Multilingual Cased', detail: 'BERT / WordPiece' },
];

function PanelHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/75">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
          {eyebrow}
        </div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-slate-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Header() {
  return (
    <header className="topbar">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="brand-mark" aria-hidden="true">
            <ScanLine size={16} strokeWidth={1.8} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-extrabold tracking-[-0.04em] text-slate-100">token lens</span>
            <span className="hidden font-mono text-[10px] tracking-[0.08em] text-slate-500 sm:inline">/ inspection bench</span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          <span className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            api ready
          </span>
          <span className="h-4 w-px bg-slate-700" />
          <span className="flex items-center gap-1.5"><Command size={12} /> v0.1</span>
        </div>
      </div>
    </header>
  );
}

function InputPanel({
  inputText,
  modelName,
  onInputChange,
  onModelChange,
  onSubmit,
  onClear,
  isPending,
  hasResult,
}: {
  inputText: string;
  modelName: string;
  onInputChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  isPending: boolean;
  hasResult: boolean;
}) {
  const selectedModel = MODEL_OPTIONS.find((option) => option.value === modelName) ?? MODEL_OPTIONS[0];

  return (
    <section className="bench-panel rounded-xl p-5 sm:p-6" data-testid="panel-input">
      <PanelHeading eyebrow="01 / specimen" title="Prepare an input">
        <div className="hidden items-center gap-2 rounded-md border border-slate-700/70 bg-slate-950/20 px-2.5 py-1.5 font-mono text-[10px] text-slate-500 sm:flex">
          <Terminal size={12} />
          POST /api/tokenise
        </div>
      </PanelHeading>
      <form onSubmit={onSubmit}>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500" htmlFor="token-input">
          Text to inspect
        </label>
        <div className="input-surface rounded-lg">
          <textarea
            id="token-input"
            data-testid="input-token-text"
            value={inputText}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Type or paste text here..."
            spellCheck={false}
            rows={8}
            className="block min-h-[190px] w-full resize-y bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-slate-200 outline-none placeholder:text-slate-600"
          />
          <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2.5 font-mono text-[10px] text-slate-600">
            <span data-testid="text-input-length">{inputText.length} characters</span>
            <span>whitespace preserved</span>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500" htmlFor="model-select">
              <SlidersHorizontal size={12} />
              Tokenizer model
            </label>
            <div className="relative">
              <select
                id="model-select"
                data-testid="select-token-model"
                value={modelName}
                onChange={(event) => onModelChange(event.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-700/80 bg-slate-950/40 px-3.5 py-3 pr-10 text-[13px] text-slate-200 outline-none transition-colors focus:border-cyan-300/70"
              >
                {MODEL_OPTIONS.map((option) => (
                  <option key={option.value || 'default'} value={option.value}>
                    {option.label}{option.value ? `  ·  ${option.detail}` : `  ·  ${option.detail}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            </div>
            <p className="mt-2 font-mono text-[10px] text-slate-600">{selectedModel.detail} · null uses the service default</p>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <button
              type="button"
              data-testid="button-clear-input"
              onClick={onClear}
              disabled={!inputText && !hasResult}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700/80 px-3.5 py-3 text-[12px] font-semibold text-slate-400 transition-colors hover:border-slate-500 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <RotateCcw size={14} />
              Clear
            </button>
            <button
              type="submit"
              data-testid="button-tokenise"
              disabled={!inputText.trim() || isPending}
              className="inline-flex min-w-[136px] items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-[12px] font-bold text-slate-950 transition-all hover:bg-cyan-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {isPending ? <Activity className="animate-pulse" size={15} /> : <Sparkles size={15} />}
              {isPending ? 'Inspecting…' : 'Inspect tokens'}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

function LoadingResult() {
  return (
    <section className="bench-panel rounded-xl p-5 sm:p-6" aria-live="polite" data-testid="status-loading">
      <PanelHeading eyebrow="02 / sequence" title="Reading response">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-300/70">awaiting API</span>
      </PanelHeading>
      <div className="space-y-2.5">
        <div className="loading-line h-12 rounded-lg bg-slate-800/80" />
        <div className="loading-line h-12 rounded-lg bg-slate-800/60 [animation-delay:120ms]" />
        <div className="loading-line h-12 w-4/5 rounded-lg bg-slate-800/40 [animation-delay:240ms]" />
      </div>
    </section>
  );
}

function EmptyResult() {
  return (
    <section className="bench-panel rounded-xl p-5 sm:p-6" data-testid="empty-token-result">
      <PanelHeading eyebrow="02 / sequence" title="Token sequence">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600">no response</span>
      </PanelHeading>
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/70 bg-slate-950/20 px-6 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/5 text-cyan-300/80">
          <Code2 size={19} strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-semibold text-slate-300">Your token boundaries will land here</p>
        <p className="mt-2 max-w-[310px] font-mono text-[10px] leading-5 text-slate-600">
          Enter a specimen above. The API response is shown exactly as returned — no client-side splitting.
        </p>
      </div>
    </section>
  );
}

function ErrorResult({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <section className="bench-panel rounded-xl p-5 sm:p-6" aria-live="assertive" data-testid="status-error">
      <PanelHeading eyebrow="02 / response" title="Inspection interrupted">
        <CircleAlert size={16} className="text-red-300" />
      </PanelHeading>
      <div className="rounded-lg border border-red-300/20 bg-red-300/[0.045] p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-red-200/70">API error</p>
        <p className="mt-2 text-[13px] leading-6 text-red-100/85" data-testid="text-error-message">{error}</p>
        <button
          type="button"
          data-testid="button-retry-tokenise"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-red-200/25 px-3 py-2 text-[11px] font-semibold text-red-100 transition-colors hover:bg-red-200/10"
        >
          <RotateCcw size={13} />
          Retry inspection
        </button>
      </div>
    </section>
  );
}

function TokenResult({ result }: { result: TokeniseResult }) {
  const tokenCountLabel = `${result.tokenCount} ${result.tokenCount === 1 ? 'token' : 'tokens'}`;
  const [copied, setCopied] = useState(false);
  const TOKEN_ACCENTS = ['#66e5ec', '#f6c76d', '#b3a3ff', '#74e7ad', '#ff9bb4'];

  const copyTokens = async () => {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="bench-panel rounded-xl p-5 sm:p-6" data-testid="panel-token-result">
      <PanelHeading eyebrow="02 / sequence" title="Token sequence">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300/80" data-testid="status-success">
            response received
          </span>
          <button
            type="button"
            data-testid="button-copy-result"
            onClick={copyTokens}
            title="Copy reconstructed text"
            className="rounded-md border border-slate-700/80 p-1.5 text-slate-500 transition-colors hover:border-cyan-300/50 hover:text-cyan-200"
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
          </button>
        </div>
      </PanelHeading>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.045] p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-200/60">authoritative count</p>
          <p className="mt-1 text-[27px] font-bold tracking-[-0.04em] text-cyan-200" data-testid="text-token-count">{tokenCountLabel}</p>
        </div>
        <div className="rounded-lg border border-slate-700/70 bg-slate-950/20 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600">source length</p>
          <p className="mt-1 text-[23px] font-bold tracking-[-0.04em] text-slate-300" data-testid="text-result-length">{result.text.length}<span className="ml-1 text-[11px] font-medium text-slate-600">chars</span></p>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600">
        <span>index / exact value</span>
        <span>{result.text.length > 0 ? 'leading spaces visible' : 'empty response'}</span>
      </div>
      <div className="max-h-[540px] overflow-y-auto rounded-lg border border-slate-800/90 bg-[#0b0f15]/65 p-3" data-testid="list-token-sequence">
        {result.tokens.length > 0 ? (
          <div className="token-cloud">
            {result.tokens.map((token, index) => (
              <span
                key={`${index}-${token}`}
                className="token-chip group"
                style={{
                  '--token-index': index,
                  '--token-accent': TOKEN_ACCENTS[index % TOKEN_ACCENTS.length],
                } as CSSProperties}
                data-testid={`row-token-${index}`}
              >
                <span className="token-index">{String(index).padStart(3, '0')}</span>
                <span className="token-value" data-testid={`text-token-${index}`}>
                  {token === '' ? <span className="text-slate-600">∅ empty string</span> : token}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center font-mono text-[11px] text-slate-600" data-testid="empty-token-sequence">
            The service returned zero tokens.
          </div>
        )}
      </div>
      <p className="mt-3 flex items-center gap-2 font-mono text-[10px] leading-5 text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300/75" />
        Hover a row to isolate a boundary. Values above are rendered with whitespace intact.
      </p>
    </section>
  );
}

function Home() {
  const mutation = useTokeniseText();
  const [inputText, setInputText] = useState('');
  const [modelName, setModelName] = useState('');
  const [result, setResult] = useState<TokeniseResult | null>(null);
  const [lastRequest, setLastRequest] = useState<{ inputText: string; modelName: string | null } | null>(null);

  const errorMessage = useMemo(() => {
    const raw = mutation.error as { data?: { error?: string }; response?: { data?: { error?: string } }; message?: string } | null;
    return raw?.data?.error || raw?.response?.data?.error || raw?.message || 'The tokenization service could not complete this inspection.';
  }, [mutation.error]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const request = { inputText, modelName: modelName || null };
    setLastRequest(request);
    setResult(null);
    mutation.mutate({ data: request }, {
      onSuccess: (data) => setResult(data),
    });
  };

  const clear = () => {
    setInputText('');
    setModelName('');
    setResult(null);
    setLastRequest(null);
    mutation.reset();
  };

  const retry = () => {
    if (!lastRequest) return;
    mutation.mutate({ data: lastRequest }, {
      onSuccess: (data) => setResult(data),
    });
  };

  return (
    <div className="app-shell noise bench-grid bg-background">
      <Header />
      <main className="relative z-[1] mx-auto w-full max-w-[1440px] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pt-14">
        <div className="mb-9 max-w-3xl">
          <div className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300/75">
            <span className="h-px w-8 bg-cyan-300/70" />
            deterministic inspection
          </div>
          <h1 className="max-w-2xl text-[clamp(2.25rem,5vw,4.35rem)] font-extrabold leading-[0.98] tracking-[-0.065em] text-slate-100">
            See what the model
            <span className="text-cyan-300"> actually reads.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[14px] leading-7 text-slate-400">
            A quiet bench for inspecting token boundaries, whitespace, and special characters — returned by the tokenizer, not guessed by the interface.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <InputPanel
            inputText={inputText}
            modelName={modelName}
            onInputChange={setInputText}
            onModelChange={setModelName}
            onSubmit={submit}
            onClear={clear}
            isPending={mutation.isPending}
            hasResult={Boolean(result)}
          />
          <div>
            {mutation.isPending ? <LoadingResult /> : null}
            {!mutation.isPending && mutation.isError ? <ErrorResult error={errorMessage} onRetry={retry} /> : null}
            {!mutation.isPending && !mutation.isError && result ? <TokenResult result={result} /> : null}
            {!mutation.isPending && !mutation.isError && !result ? <EmptyResult /> : null}
          </div>
        </div>

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-800/80 pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:flex-row">
          <span>token lens / inspect without distortion</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300/75" /> every boundary matters</span>
        </footer>
      </main>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;