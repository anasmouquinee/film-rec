import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config';

const MovieDetailScreen = ({ route, navigation }) => {
    const { movieId } = route.params;
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const API_URL = API_BASE_URL;

    const handleLike = async () => {
        try {
            setLiked(true); // Optimistic
            await fetch(`${API_URL}/user/preference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'user1', movie }),
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
                <ActivityIndicator size="large" color="#E50914" />
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
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                        style={styles.gradient}
                    />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
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

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => trailer && Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`)}
                    >
                        <Ionicons name="play" size={24} color="black" />
                        <Text style={styles.playText}>Play</Text>
                    </TouchableOpacity>

                    <Text style={styles.overview}>{movie.overview}</Text>

                    <Text style={styles.castLabel}>Cast: <Text style={styles.castText}>
                        {movie.credits?.cast.slice(0, 5).map(c => c.name).join(', ')}...
                    </Text></Text>

                    <Text style={styles.castLabel}>Genres: <Text style={styles.castText}>
                        {movie.genres?.map(g => g.name).join(' • ')}
                    </Text></Text>

                    {/* Actions Row */}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
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
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 15,
    },
    match: {
        color: '#46d369',
        fontWeight: 'bold',
        fontSize: 16,
    },
    year: {
        color: '#aaa',
        fontSize: 16,
    },
    ratingBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 5,
        borderRadius: 2,
    },
    ratingText: {
        color: '#eee',
        fontSize: 14,
    },
    duration: {
        color: '#aaa',
        fontSize: 16,
    },
    playButton: {
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
        marginBottom: 10,
    },
    playText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    downloadButton: {
        backgroundColor: '#333',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
        marginBottom: 20,
    },
    downloadText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    overview: {
        color: 'white',
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 15,
    },
    castLabel: {
        color: '#777',
        fontSize: 14,
        marginBottom: 5,
    },
    castText: {
        color: '#aaa',
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
        color: '#777',
        marginTop: 5,
        fontSize: 12,
    },
    text: {
        color: 'white',
    },
});

export default MovieDetailScreen;
