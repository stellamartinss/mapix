import GuessHistory from './GuessHistory.jsx';

function LastGuesses({ history }) {
  return (
    <section className='panel px-4'>
      <div className='grid grid-cols-2 items-center mb-4'>
        <h2 className='m-0 mb-2 mt-4 text-1xl font-bold text-slate-900 dark:text-white'>
          Últimos palpites
        </h2>
      </div>
      <GuessHistory entries={history.slice(0, 5)} />
    </section>
  );
}

export default LastGuesses;
