import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';

const SearchScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const API_URL = API_BASE_URL;

    const handleSearch = async (text) => {
        setQuery(text);
        if (text.length > 2) {
            try {
                const response = await fetch(`${API_URL}/search?q=${text}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error(error);
            }
        } else {
            setResults([]);
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
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Search movies, actors, genres..."
                    placeholderTextColor="#aaa"
                    value={query}
                    onChangeText={handleSearch}
                />
            </View>
            <FlatList
                data={results}
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    searchBar: {
        padding: 10,
        backgroundColor: '#111',
    },
    input: {
        backgroundColor: '#333',
        color: 'white',
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    list: {
        alignItems: 'center',
        paddingTop: 10,
    },
});

export default SearchScreen;
