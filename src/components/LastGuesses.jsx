import GuessHistory from './GuessHistory.jsx';

function LastGuesses({ history }) {
  return (
    <section className='panel'>
      <div className='panel-header'>
        <h2>Últimos palpites</h2>
        <p className='hint'>Mostrando os 5 mais recentes</p>
      </div>
      <GuessHistory entries={history.slice(0, 5)} />
    </section>
  );
}

export default LastGuesses
