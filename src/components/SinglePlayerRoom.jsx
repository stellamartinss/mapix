export default function SinglePlayerRoom({hasReachedLimit,realPosition,loading,handleStartGame,attemptsLeft,isSettingsVisible,setIsSettingsVisible,isHowToPlayVisible,setIsHowToPlayVisible,timerActive,handleTimeout,hasTimedOut,distanceKm,t}) {
  return (
     <div className='streetview-fullscreen'>
           {hasReachedLimit ? (
             <div className='overlay-message'>
               <RoundLimitReached />
             </div>
           ) : !realPosition && !loading ? (
             <div className='overlay-message'>
               <StartScreen
                 onStart={handleStartGame}
                 attemptsLeft={attemptsLeft}
                 setIsSettingsVisible={setIsSettingsVisible}
                 isSettingsVisible={isSettingsVisible}
                 setIsHowToPlayVisible={setIsHowToPlayVisible}
                 isHowToPlayVisible={isHowToPlayVisible}
               />
             </div>
           ) : (
             <>
               <StreetView position={realPosition} loading={loading} />
   
               {/* Countdown Timer - Top Left */}
               {timerActive && (
                 <div className='timer-overlay'>
                   <CountdownTimer
                     key={realPosition?.lat + '-' + realPosition?.lng}
                     duration={75}
                     onTimeout={handleTimeout}
                     isActive={timerActive}
                   />
                 </div>
               )}
   
               {/* Timeout Message - Center */}
               {hasTimedOut && distanceKm === null && (
                 <div className='timeout-overlay'>
                   <div className='timeout-message'>{t('timeout')}</div>
                 </div>
               )}
             </>
           )}
         </div>
  );
}