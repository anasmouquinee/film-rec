import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const API_URL = API_BASE_URL;

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
        if (!user) {
            alert('Please login to like movies');
            return;
        }
        try {
            await fetch(`${API_URL}/user/preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, movie }),
            });
            alert('Liked!');
        } catch (error) {
            console.error('Error liking movie:', error);
        }
    };

    return (
        <BackgroundLayout>
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>Trending Now</Text>
                <FlatList
                    data={movies}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <MovieCard
                            movie={item}
                            onLike={handleLike}
                            onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
                        />
                    )}
                    numColumns={2}
                    contentContainerStyle={styles.list}
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
});

export default HomeScreen;
