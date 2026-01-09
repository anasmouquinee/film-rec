import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';
import ChatScreen from './ChatScreen';

const HomeScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [movies, setMovies] = useState([]);
    const [chatVisible, setChatVisible] = useState(false);
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

                {/* Floating Chat Button */}
                <TouchableOpacity
                    style={styles.fabContainer}
                    onPress={() => setChatVisible(true)}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#00C2FF', '#0066FF']}
                        style={styles.fab}
                    >
                        <Ionicons name="chatbubbles" size={26} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                {/* Chat Modal */}
                <Modal
                    visible={chatVisible}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setChatVisible(false)}
                >
                    <ChatScreen
                        onClose={() => setChatVisible(false)}
                        onMoviePress={(movieId) => {
                            setChatVisible(false);
                            navigation.navigate('MovieDetail', { movieId });
                        }}
                    />
                </Modal>
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
        paddingBottom: 100,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        shadowColor: '#00C2FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;

