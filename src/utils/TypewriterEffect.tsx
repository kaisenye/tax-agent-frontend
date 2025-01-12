import React, { useEffect, useState } from 'react';

const TypewriterEffect = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState('');
    
    useEffect(() => {
        let i = 0;
        setDisplayText('');
        
        const intervalId = setInterval(() => {
            setDisplayText(text.slice(0, i));
            i++;
            
            if (i > text.length) {
                clearInterval(intervalId);
            }
        }, 5);
        
        return () => clearInterval(intervalId);
    }, [text]);
    
    return <span>{displayText}</span>;
};

export default TypewriterEffect;
