import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import BackgroundLayout from '../components/BackgroundLayout';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [likes, setLikes] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const API_URL = API_BASE_URL;

    const fetchLikes = async () => {
        if (!user) return;
        try {
            const response = await fetch(`${API_URL}/user/likes/${user.id}`);
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
    }, [user]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchLikes);
        return unsubscribe;
    }, [navigation, user]);

    if (!user) return null;

    return (
        <BackgroundLayout>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${user.username}&background=00C2FF&color=fff` }}
                        style={styles.avatar}
                    />
                    <Text style={styles.username}>{user.username}</Text>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
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
        </BackgroundLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    header: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937',
        backgroundColor: '#0B1221',
        marginBottom: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#00C2FF',
    },
    username: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        padding: 15,
    },
    list: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    empty: {
        color: '#8899A6',
        marginTop: 50,
        textAlign: 'center',
        fontSize: 16,
    },
    logoutButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#00C2FF',
        borderRadius: 20,
        backgroundColor: 'rgba(0, 194, 255, 0.1)',
    },
    logoutText: {
        color: '#00C2FF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
