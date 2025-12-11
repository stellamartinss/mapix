import GuessHistory from './GuessHistory.jsx';

function LastGuesses({ history, onHandleDisplayLastGuesses }) {
  return (
    <section className='panel'>
      <div className='grid grid-cols-2 items-center mb-4'>
        <h2 className='m-0 mb-2 text-1xl font-bold dark:text-slate-900'>
          Últimos palpites
        </h2>

        <button
          type='button'
          onClick={() => onHandleDisplayLastGuesses(false)}
          className='justify-self-end text-xs rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1'
        >
          —
        </button>
      </div>
      <GuessHistory entries={history.slice(0, 5)} />
    </section>
  );
}

export default LastGuesses;
