import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';

const RecommendationScreen = ({ userId }) => {
    const [recommendations, setRecommendations] = useState([]);
    const API_URL = 'http://192.168.11.106:3000/api';

    useEffect(() => {
        // In a real app, userId would come from context or props
        // For now, we hardcode 'user1' or use the prop if passed
        const uid = userId || 'user1';
        fetchRecommendations(uid);
    }, [userId]);

    const fetchRecommendations = async (uid) => {
        try {
            const response = await fetch(`${API_URL}/recommendations/${uid}`);
            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>For You</Text>
            <FlatList
                data={recommendations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieCard movie={item} onLike={() => { }} />
                )}
                numColumns={2}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>Like some movies to get recommendations!</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        padding: 15,
    },
    list: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    empty: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default RecommendationScreen;
