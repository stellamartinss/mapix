import PropTypes from 'prop-types'

function StartScreen({ onStart, isBlocked, attemptsLeft }) {
  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <div className="start-screen-icon">🗺️</div>
        <h2>Bem-vindo ao Mapix!</h2>
        <p className="start-screen-description">
          Teste seus conhecimentos geográficos! Você verá um local aleatório do mundo no Street View
          e precisará adivinhar onde ele está no mapa.
        </p>
        
        {isBlocked ? (
          <div className="start-screen-blocked">
            <p>Você atingiu o limite de tentativas gratuitas hoje.</p>
            <p>Faça upgrade para Premium e jogue ilimitado!</p>
          </div>
        ) : (
          <>
            {attemptsLeft !== null && (
              <div className="start-screen-attempts">
                <span>Você tem <strong>{attemptsLeft}</strong> tentativa{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''} hoje</span>
              </div>
            )}
            <button className="primary large" onClick={onStart} type="button">
              🎯 Iniciar Jogo
            </button>
          </>
        )}
        
        <div className="start-screen-instructions">
          <h3>Como jogar:</h3>
          <ol>
            <li>Observe o Street View com atenção</li>
            <li>Clique no mapa para marcar onde você acha que está o local</li>
            <li>Confirme seu palpite</li>
            <li>Veja quão perto você estava!</li>
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

