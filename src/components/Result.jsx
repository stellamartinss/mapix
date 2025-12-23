import PropTypes from 'prop-types';

function Result({ onHideToggle }) {
  return (
    <div className='flex justify-end w-full'>
      <button
        type='button'
        onClick={() => onHideToggle()}
        className='px-2 py-1 text-xs rounded-md bg-slate-200 hover:bg-slate-300 
               dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 
               transition-all'
      >
        ×
      </button>
    </div>
  );
}

Result.propTypes = {
  onHideToggle: PropTypes.func.isRequired,
};

export default Result;
