function PlayAgain({ onPlayAgain, disableConfirm }) {
  return (
    <button
      type='button'
      onClick={onPlayAgain}
      disabled={disableConfirm}
      className='border px-2 py-1 text-xs border-slate-300 dark:border-slate-600 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg px-4 py-3 font-semibold text-slate-900 dark:text-slate-200 transition-all hover:translate-y-[-1px] hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
    >
      Gerar novo ponto
    </button>
  );
}

export default PlayAgain;
