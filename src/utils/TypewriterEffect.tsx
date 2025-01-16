import React, { useEffect, useState } from 'react';
import { MarkdownRenderer } from '../utils/MarkdownRenderer';

interface TypewriterEffectProps {
    text: string;
    speed?: number;
    setIsTyping: (isTyping: boolean) => void;
    onTypingComplete?: () => void;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
    text, 
    speed = 2, 
    setIsTyping,
    onTypingComplete 
}) => {
    const [displayText, setDisplayText] = useState('');
    
    useEffect(() => {
        setIsTyping(true);
        let i = 0;
        setDisplayText('');

        const intervalId = setInterval(() => {
            setDisplayText(text.slice(0, i));
            i++;
            
            if (i > text.length) {
                clearInterval(intervalId);
                setIsTyping(false);
                onTypingComplete?.();
            }
        }, speed);
        
        return () => {
            clearInterval(intervalId);
            setIsTyping(false);
        };
    }, [text, speed]);
    
    return <MarkdownRenderer content={displayText} />;
};

export default TypewriterEffect;
