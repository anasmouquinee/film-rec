import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ChatScreen = ({ onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: "Hey! 👋 I'm your movie buddy. Tell me what kind of movies you're in the mood for, and I'll find the perfect picks for you!",
            isUser: false,
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.text,
                    userId: user?.userId,
                }),
            });

            const data = await response.json();

            const aiMessage = {
                id: (Date.now() + 1).toString(),
                text: data.response || "Sorry, I couldn't process that. Try asking about movies!",
                isUser: false,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: "Oops! Something went wrong. Please try again.",
                    isUser: false,
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View
            style={[
                styles.messageBubble,
                item.isUser ? styles.userBubble : styles.aiBubble,
            ]}
        >
            {!item.isUser && (
                <View style={styles.aiAvatar}>
                    <Ionicons name="sparkles" size={16} color="#00C2FF" />
                </View>
            )}
            <Text style={[styles.messageText, item.isUser && styles.userText]}>
                {item.text}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#0A1628', '#050A18']}
                style={styles.gradient}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <LinearGradient
                            colors={['#00C2FF', '#0066FF']}
                            style={styles.avatarGradient}
                        >
                            <Ionicons name="sparkles" size={20} color="#fff" />
                        </LinearGradient>
                        <View>
                            <Text style={styles.headerTitle}>Movie AI</Text>
                            <Text style={styles.headerSubtitle}>Your personal recommender</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                    showsVerticalScrollIndicator={false}
                />

                {/* Typing Indicator */}
                {isLoading && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingBubble}>
                            <ActivityIndicator size="small" color="#00C2FF" />
                            <Text style={styles.typingText}>Thinking...</Text>
                        </View>
                    </View>
                )}

                {/* Input */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={10}
                >
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask for movie recommendations..."
                            placeholderTextColor="#64748B"
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={sendMessage}
                            returnKeyType="send"
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isLoading}
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                            ]}
                        >
                            <LinearGradient
                                colors={inputText.trim() && !isLoading ? ['#00C2FF', '#0066FF'] : ['#1E293B', '#1E293B']}
                                style={styles.sendButtonGradient}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color={inputText.trim() && !isLoading ? '#fff' : '#64748B'}
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050A18',
    },
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarGradient: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: '#64748B',
        fontSize: 12,
    },
    closeButton: {
        padding: 8,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#0066FF',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1E293B',
        borderBottomLeftRadius: 4,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    aiAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 194, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        color: '#E2E8F0',
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    userText: {
        color: '#fff',
    },
    typingContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1E293B',
        padding: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    typingText: {
        color: '#64748B',
        fontSize: 13,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
    },
    input: {
        flex: 1,
        backgroundColor: '#1E293B',
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 12,
        color: '#fff',
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonGradient: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
