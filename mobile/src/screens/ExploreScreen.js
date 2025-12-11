import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';

const ExploreScreen = ({ navigation }) => {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]); // Changed to array
    const [sortBy, setSortBy] = useState('popularity.desc');
    const [showSortModal, setShowSortModal] = useState(false);
    const API_URL = API_BASE_URL;
    const TMDB_API_KEY = '5324022839b222538aa591c0680a656a';

    useEffect(() => {
        fetchGenres();
        fetchMovies();
    }, [selectedGenres, sortBy]);

    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_URL}/genres`);
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMovies = async () => {
        // Map genres to comma separated string (AND logic)
        // For OR logic use pipe |, but usually standard filter is AND
        const genreQuery = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
        const sortQuery = `&sort_by=${sortBy}`;
        try {
            const response = await fetch(`${API_URL}/discover?${genreQuery}${sortQuery}`);
            const data = await response.json();
            setMovies(data.results || []);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleGenre = (id) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter(gId => gId !== id));
        } else {
            setSelectedGenres([...selectedGenres, id]);
        }
    };

    const sortOptions = [
        { label: 'Popularity', value: 'popularity.desc' },
        { label: 'Top Rated', value: 'vote_average.desc' },
        { label: 'Newest', value: 'primary_release_date.desc' },
        { label: 'Title A-Z', value: 'original_title.asc' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Explore</Text>
                <TouchableOpacity onPress={() => setShowSortModal(true)}>
                    <Ionicons name="filter" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Genres Scroller */}
            <View style={styles.genreContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreList}>
                    <TouchableOpacity
                        style={[styles.genreChip, selectedGenres.length === 0 && styles.selectedChip]}
                        onPress={() => setSelectedGenres([])}
                    >
                        <Text style={[styles.genreText, selectedGenres.length === 0 && styles.selectedGenreText]}>All</Text>
                    </TouchableOpacity>
                    {genres.map(g => (
                        <TouchableOpacity
                            key={g.id}
                            style={[styles.genreChip, selectedGenres.includes(g.id) && styles.selectedChip]}
                            onPress={() => toggleGenre(g.id)}
                        >
                            <Text style={[styles.genreText, selectedGenres.includes(g.id) && styles.selectedGenreText]}>
                                {g.name || 'Unknown'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={movies}
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
            />

            {/* Sort Modal */}
            <Modal visible={showSortModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort By</Text>
                        {sortOptions.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.sortOption}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text style={[styles.sortText, sortBy === option.value && styles.activeSortText]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.value && <Ionicons name="checkmark" size={20} color="#E50914" />}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowSortModal(false)}
                        >
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    genreContainer: {
        height: 50,
        marginBottom: 10,
    },
    genreList: {
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    genreChip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#333',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#444',
    },
    selectedChip: {
        backgroundColor: '#E50914',
        borderColor: '#E50914',
    },
    genreText: {
        color: '#ccc',
        fontWeight: '500',
    },
    selectedGenreText: {
        color: 'white',
        fontWeight: 'bold',
    },
    list: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    sortOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    sortText: {
        color: '#aaa',
        fontSize: 16,
    },
    activeSortText: {
        color: '#E50914',
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
        padding: 15,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ExploreScreen;
