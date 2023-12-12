
const startOptions = [
  { value: 0, title: 'THJ Focus', body: 'Create general content about The Honey Jar' }
];

// startItems.js
export default function startItems({ context_id, onClick }) {
  return (
    <>
      {startOptions.map((option, index) => {
        const box = (
          <div className={`box ${context_id === option.value ? 'active' : ''}`} key={option.value}>
            <h3>{option.title}</h3>
            <div className="box-content">
              <p>{option.body}</p>
              {context_id === option.value && context_id === 0 && (
                <p>THJ Focused Content</p>
              )}

              {context_id !== option.value && (
                <button value={option.value} onClick={onClick}>
                  Go There
                </button>
              )}
            </div>
            {context_id === option.value && (
              (() => {
                  return <div className="active-banner">ACTIVE - Start Typing!</div>
              })()
            )}
          </div>
        );

        return box;
      })}
    </>
  );
}
