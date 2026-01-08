import GuessHistory from './GuessHistory.jsx';
import { useTranslation } from '../hooks/useTranslation';


function LastGuesses({ history }) {
  const { t } = useTranslation();

  return (
    <section className='panel px-4'>
      <GuessHistory entries={history.slice(0, 5)} />
    </section>
  );
}

export default LastGuesses;
