const contextOptions = [
    { value: 0, label: 'THJ Focused' }
];

export const contextItems = contextOptions.map((option, index) => {
    return (
        <option key={index} value={option.value}>
            {option.label}
        </option>
    );
});
