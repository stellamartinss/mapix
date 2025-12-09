function OpenTab() {
  const handleOpenTab = () => {
    const url = 'https://example.com'; // Replace with your desired URL
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button onClick={handleOpenTab} className="open-tab-button">
      Open Example.com
    </button>
  );
}

export default OpenTab;