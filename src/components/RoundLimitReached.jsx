export default function RoundLimitReached() {
  return (
    <div className='flex flex-col items-center justify-center gap-6 p-8 md:p-12 text-center'>
      <div className='text-6xl md:text-8xl'>🎮</div>
      <div>
        <h2 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2'>
          Limite de rodadas grátis atingido!
        </h2>
        <p className='text-slate-600 dark:text-slate-300 text-lg'>
          Você jogou 5 rodadas hoje. Volte amanhã para continuar jogando!
        </p>
      </div>
      <div className='flex flex-col gap-3 w-full md:w-auto'>
        <button
          onClick={() => window.location.reload()}
          className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-xl'
        >
          🔄 Tentar novamente amanhã
        </button>
        <button
          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:shadow-xl'
        >
          ⭐ Fazer upgrade (em breve)
        </button>
      </div>
      <div className='text-sm text-slate-500 dark:text-slate-400'>
        Suas rodadas resetam automaticamente todos os dias às 00:00
      </div>
    </div>
  );
}
