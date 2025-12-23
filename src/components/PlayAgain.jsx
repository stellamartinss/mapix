function PlayAgain({ onPlayAgain, disableConfirm }) {
  return (
    <button
      type='button'
      onClick={onPlayAgain}
      disabled={disableConfirm}
      className='dark:bg-yellow-500 bg-green-500 dark:hover:bg-yellow-600 hover:bg-green-600 rounded-lg px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed'
    >
      Descobrir outro lugar
    </button>
  );
}

export default PlayAgain;
