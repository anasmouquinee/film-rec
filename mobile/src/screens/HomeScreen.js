import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';

const HomeScreen = ({ navigation }) => {
    const [movies, setMovies] = useState([]);
    const API_URL = 'http://192.168.11.106:3000/api';

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await fetch(`${API_URL}/movies`);
            const data = await response.json();
            setMovies(data);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    };

    const handleLike = async (movie) => {
        try {
            await fetch(`${API_URL}/user/preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'user1', movie }),
            });
            alert('Liked!');
        } catch (error) {
            console.error('Error liking movie:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Trending Now</Text>
            <FlatList
                data={movies}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieCard movie={item} onLike={handleLike} />
                )}
                numColumns={2}
                contentContainerStyle={styles.list}
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
});

export default HomeScreen;
