import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BackgroundLayout = ({ children, style }) => {
    return (
        <LinearGradient
            // Deep Midnight Blue to Black
            colors={['#050A18', '#02040A', '#000000']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <View style={[styles.content, style]}>
                {children}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default BackgroundLayout;
