import React from 'react';
import { Text } from 'react-native';

const TextComponent = (props) => {
    const { style, children } = props;
    
    // Convert style array to a single object
    const customStyle = Array.isArray(style) ? Object.assign({}, ...style) : { ...style };

    // Determine the correct font
    const fontFamily =
        customStyle.fontWeight === 'bold' || customStyle.fontWeight === '700'
            ? 'Kanit-Bold'
            : 'Kanit-Regular';

    // Remove fontWeight to prevent conflicts
    delete customStyle.fontWeight;

    return <Text {...props} style={[customStyle, { fontFamily }]}>{children}</Text>;
};

export default TextComponent;
