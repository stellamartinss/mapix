import PropTypes from 'prop-types'

function StartScreen({ onStart, isBlocked, attemptsLeft }) {
  return (
    <div className="min-h-[400px] grid place-items-center py-12 px-6">
      <div className="max-w-[600px] text-center flex flex-col gap-6">
        <div className="text-6xl mb-2 md:text-8xl">🗺️</div>
        <h2 className="m-0 text-2xl md:text-3xl text-slate-900 dark:text-slate-100">Bem-vindo ao Mapin!</h2>
        <p className="m-0 text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Teste seus conhecimentos geográficos! Você verá um local aleatório do mundo no Street View
          e precisará adivinhar onde ele está no mapa.
        </p>
        
        {isBlocked ? (
          <div className="p-5 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-900 rounded-xl text-red-900 dark:text-red-300">
            <p className="my-2">Você atingiu o limite de tentativas gratuitas hoje.</p>
            <p className="my-2">Faça upgrade para Premium e jogue ilimitado!</p>
          </div>
        ) : (
          <>
            {attemptsLeft !== null && (
              <div className="py-3 px-5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                <span>Você tem <strong className="text-slate-900 dark:text-slate-100 font-bold">{attemptsLeft}</strong> tentativa{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''} hoje</span>
              </div>
            )}
            <button className="dark:bg-yellow-500 bg-green-500 dark:hover:bg-yellow-600 hover:bg-green-600 rounded-lg px-4 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed" onClick={onStart} type="button">
              🎯 Iniciar Jogo
            </button>
          </>
        )}
        
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800 rounded-xl text-left md:p-8">
          <h3 className="m-0 mb-4 text-lg text-slate-900 dark:text-slate-100 text-center">Como jogar:</h3>
          <ol className="m-0 pl-6 text-slate-600 dark:text-slate-400 leading-relaxed">
            <li className="my-2">Observe o Street View com atenção</li>
            <li className="my-2">Clique no mapa para marcar onde você acha que está o local</li>
            <li className="my-2">Confirme seu palpite</li>
            <li className="my-2">Veja quão perto você estava!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

StartScreen.propTypes = {
  onStart: PropTypes.func.isRequired,
  isBlocked: PropTypes.bool,
  attemptsLeft: PropTypes.number,
}

StartScreen.defaultProps = {
  isBlocked: false,
  attemptsLeft: null,
}

export default StartScreen

