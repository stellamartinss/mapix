function Logout({ handleLogout }) {
  return (
    <button
      className='text-slate-700 dark:text-white text-xs hover:text-red-500 transition-all'
      type='button'
      onClick={handleLogout}
    >
      Sair
    </button>
  );
}

export default Logout;
