import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MovieCard = ({ movie, onLike, onPress }) => {
    // Optimistic UI for like
    const [liked, setLiked] = React.useState(false);

    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/150';

    const handleLike = () => {
        setLiked(!liked);
        onLike(movie);
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
                <View style={styles.row}>
                    <Text style={styles.rating}>
                        <Ionicons name="star" size={12} color="#FFD700" /> {movie.vote_average}
                    </Text>
                    <TouchableOpacity onPress={handleLike}>
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={20}
                            color={liked ? "#E50914" : "white"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 160,
        margin: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 240,
    },
    info: {
        padding: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rating: {
        fontSize: 12,
        color: '#aaa',
    },
});

export default MovieCard;
