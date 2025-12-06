import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const GenreSelectionScreen = ({ navigation, route }) => {
    const { userId } = route.params;
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const API_URL = 'http://192.168.11.106:3000/api';

    useEffect(() => {
        fetchGenres();
    }, []);

    const fetchGenres = async () => {
        try {
            const response = await fetch(`${API_URL}/genres`);
            const data = await response.json();
            setGenres(data);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleGenre = (id) => {
        if (selectedGenres.includes(id)) {
            setSelectedGenres(selectedGenres.filter(g => g !== id));
        } else {
            setSelectedGenres([...selectedGenres, id]);
        }
    };

    const handleContinue = async () => {
        try {
            await fetch(`${API_URL}/user/genres`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, genreIds: selectedGenres }),
            });
            alert('Preferences saved! Please log in.');
            navigation.navigate('Login');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Choose Your Favorites</Text>
            <Text style={styles.subHeader}>Select at least 3 genres to get better recommendations.</Text>

            <FlatList
                data={genres}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isSelected = selectedGenres.includes(item.id);
                    return (
                        <TouchableOpacity
                            style={[styles.genreItem, isSelected && styles.selectedGenre]}
                            onPress={() => toggleGenre(item.id)}
                        >
                            <Text style={[styles.genreText, isSelected && styles.selectedGenreText]}>
                                {item.name}
                            </Text>
                            {isSelected && <Ionicons name="checkmark-circle" size={16} color="white" style={styles.icon} />}
                        </TouchableOpacity>
                    );
                }}
            />

            <TouchableOpacity
                style={[styles.button, selectedGenres.length < 3 && styles.disabledButton]}
                onPress={handleContinue}
                disabled={selectedGenres.length < 3}
            >
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 16,
        color: '#aaa',
        marginBottom: 30,
        textAlign: 'center',
    },
    list: {
        alignItems: 'center',
    },
    genreItem: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 50,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedGenre: {
        backgroundColor: '#E50914',
        borderColor: 'white',
    },
    genreText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    selectedGenreText: {
        color: 'white',
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
    },
    button: {
        backgroundColor: '#E50914',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#555',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default GenreSelectionScreen;
