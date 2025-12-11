import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
    const [likes, setLikes] = useState([]);
    const [userId] = useState('user1'); // Hardcoded for now
    const [refreshing, setRefreshing] = useState(false);
    const API_URL = API_BASE_URL;

    const fetchLikes = async () => {
        try {
            const response = await fetch(`${API_URL}/user/likes/${userId}`);
            const data = await response.json();
            setLikes(data);
        } catch (error) {
            console.error('Error fetching likes:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchLikes();
        setRefreshing(false);
    }, [userId]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchLikes);
        return unsubscribe;
    }, [navigation, userId]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: 'https://ui-avatars.com/api/?name=User+One&background=E50914&color=fff' }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>User One</Text>
            </View>
            <Text style={styles.sectionTitle}>My List ({likes.length})</Text>
            <FlatList
                data={likes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        onLike={() => { }} // Already liked
                        onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
                    />
                )}
                numColumns={2}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No movies liked yet.</Text>}
                refreshing={refreshing}
                onRefresh={onRefresh}
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
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    username: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 15,
    },
    list: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    empty: {
        color: '#aaa',
        marginTop: 50,
        textAlign: 'center',
    },
});

export default ProfileScreen;
