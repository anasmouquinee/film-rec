import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';

const MovieDetailScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const { movieId } = route.params;
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const API_URL = API_BASE_URL;

    const handleLike = async () => {
        if (!user) {
            alert('Please login to like movies');
            return;
        }
        try {
            setLiked(true);
            await fetch(`${API_URL}/user/preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, movie }),
            });
        } catch (error) {
            console.error('Error liking movie:', error);
            setLiked(false);
        }
    };

    useEffect(() => {
        fetchMovieDetails();
    }, [movieId]);

    const fetchMovieDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/movie/${movieId}`);
            const data = await response.json();
            setMovie(data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C2FF" />
            </View>
        );
    }

    if (!movie) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.text}>Movie not found</Text>
            </View>
        );
    }

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : null;

    const trailer = movie.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    return (
        <BackgroundLayout>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
                    <LinearGradient
                        colors={['transparent', 'rgba(5, 10, 24, 0.8)', '#050A18']}
                        style={styles.gradient}
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Content Part */}
                <View style={styles.content}>
                    <Text style={styles.title}>{movie.title}</Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.match}>98% Match</Text>
                        <Text style={styles.year}>{movie.release_date?.split('-')[0]}</Text>
                        <View style={styles.ratingBadge}>
                            <Text style={styles.ratingText}>{movie.adult ? '18+' : '12+'}</Text>
                        </View>
                        <Text style={styles.duration}>{movie.runtime}m</Text>
                    </View>

                    {/* Action Buttons Part */}
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => trailer && Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`)}
                    >
                        <Ionicons name="play" size={24} color="#050A18" />
                        <Text style={styles.playText}>Play</Text>
                    </TouchableOpacity>

                    <Text style={styles.overview}>{movie.overview}</Text>

                    <Text style={styles.castLabel}>Cast: <Text style={styles.castText}>
                        {movie.credits?.cast.slice(0, 5).map(c => c.name).join(', ')}...
                    </Text></Text>

                    <Text style={styles.castLabel}>Genres: <Text style={styles.castText}>
                        {movie.genres?.map(g => g.name).join(' • ')}
                    </Text></Text>

                    {/* Actions Row Part */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={handleLike}
                        >
                            <Ionicons name={liked ? "checkmark" : "add"} size={24} color="white" />
                            <Text style={styles.actionText}>My List</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Ionicons name="thumbs-up-outline" size={24} color="white" />
                            <Text style={styles.actionText}>Rate</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#050A18',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    hero: {
        height: 450,
        position: 'relative',
    },
    backdrop: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(5, 10, 24, 0.5)',
        borderRadius: 20,
        padding: 8,
    },
    content: {
        padding: 20,
        marginTop: -100, // Pull up over gradient
    },
    title: {
        color: 'white',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    match: {
        color: '#00C2FF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    year: {
        color: '#8899A6',
        fontSize: 16,
    },
    ratingBadge: {
        backgroundColor: '#151F38',
        paddingHorizontal: 5,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#2A3B55',
    },
    ratingText: {
        color: '#E2E8F0',
        fontSize: 14,
    },
    duration: {
        color: '#8899A6',
        fontSize: 16,
    },
    playButton: {
        backgroundColor: '#00C2FF',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#00C2FF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    playText: {
        color: '#050A18',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    overview: {
        color: '#E2E8F0',
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 15,
    },
    castLabel: {
        color: '#8899A6',
        fontSize: 14,
        marginBottom: 5,
    },
    castText: {
        color: '#CBD5E1',
        fontSize: 14,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: 30,
        justifyContent: 'space-around',
    },
    actionItem: {
        alignItems: 'center',
    },
    actionText: {
        color: '#8899A6',
        marginTop: 5,
        fontSize: 12,
    },
    text: {
        color: 'white',
    },
});

export default MovieDetailScreen;
