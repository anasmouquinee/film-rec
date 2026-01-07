import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';

const RecommendationScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const API_URL = API_BASE_URL;

    useEffect(() => {
        if (user) {
            fetchRecommendations(user.id);
        }
    }, [user]);

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
        <BackgroundLayout>
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>For You</Text>
                <FlatList
                    data={recommendations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <MovieCard
                            movie={item}
                            onLike={() => { }}
                            onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
                        />
                    )}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Like some movies to get recommendations!</Text>}
                />
            </SafeAreaView>
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
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
        color: '#8899A6',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default RecommendationScreen;
