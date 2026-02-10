// api.js
import axios from 'axios';

const BASE_URL = 'https://api.quran.com/api/v4';

// Fetch verses for a specific page with word-level details for layout
export const fetchQuranPage = async (pageNumber) => {
    try {
        const response = await axios.get(`${BASE_URL}/verses/by_page/${pageNumber}`, {
            params: {
                words: true,
                word_fields: 'line_number,text_uthmani,code_v1', // code_v1 for V1 fonts if needed, or text_uthmani
                per_page: 300 // Ensure we get all verses/words (max verses on a page is usually small, but safe side)
            }
        });

        const verses = response.data.verses;

        // Group words by line number to mimic Mushaf layout
        const lines = {};
        const ayahs = [];

        verses.forEach(verse => {
            ayahs.push({
                number: verse.verse_number,
                text: verse.text_uthmani,
                surah: {
                    number: verse.chapter_id || parseInt(verse.verse_key.split(':')[0]),
                },
                numberInSurah: verse.verse_number, // verse_number is usually 1-based index in surah
                verseKey: verse.verse_key,
                audio: null // Audio handled separately or we can fetch here if needed
            });

            verse.words.forEach(word => {
                // Determine line number. QF API returns line_number_mushaf (or similar depending on fields).
                // API field requested: 'line_number'. 
                // Note: v4 standardizes on 15-line mushaf usually.
                const lineNum = word.line_number;

                if (!lines[lineNum]) {
                    lines[lineNum] = [];
                }
                lines[lineNum].push({
                    id: word.id,
                    text: word.text_uthmani,
                    charType: word.char_type_name, // 'word' or 'end'
                    verseKey: verse.verse_key,
                    verseId: verse.id,
                    codeV1: word.code_v1,
                    isSajdah: false // TODO: check if simple field exists
                });
            });
        });

        return { lines, ayahs };
    } catch (error) {
        console.error('Error fetching Quran page:', error);
        throw error;
    }
};

// Map Reciter IDs (QF uses IDs like 7 for Mishary)
// We might need to look up these IDs. For now, defaulting to Mishary (7).
const RECITER_ID = 7; // Mishary Rashid Alafasy

export const fetchAudioForPage = async (pageNumber, reciterId = RECITER_ID) => {
    try {
        const response = await axios.get(`${BASE_URL}/recitations/${reciterId}/by_page/${pageNumber}`);

        const audioFiles = response.data.audio_files;
        if (!audioFiles || audioFiles.length === 0) {
            console.warn('No audio files found for page', pageNumber);
            return { ayahs: [] };
        }

        // Ensure audio files are ordered by verse key (e.g., "2:255")
        const sorted = [...audioFiles].sort((a, b) => {
            const [sa, va] = a.verse_key.split(':').map(Number);
            const [sb, vb] = b.verse_key.split(':').map(Number);
            if (sa !== sb) return sa - sb;
            return va - vb;
        });

        const ayahsMap = sorted.map(file => {
            const audioUrl = file.url.startsWith('http')
                ? file.url
                : `https://verses.quran.com/${file.url}`;
            return {
                audio: audioUrl,
                verseKey: file.verse_key
            };
        });

        console.log('Loaded audio for page', pageNumber, ':', ayahsMap.length, 'verses');
        return { ayahs: ayahsMap };
    } catch (error) {
        console.error('Error fetching audio for page:', error);
        // Fallback or empty
        return { ayahs: [] };
    }
};

export const fetchReciters = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/resources/recitations`);
        return response.data.recitations;
    } catch (error) {
        console.error('Error fetching reciters:', error);
        throw error;
    }
};

export const fetchSurahs = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/chapters`);
        return response.data.chapters.map(ch => ({
            number: ch.id,
            name: ch.name_arabic,
            englishName: ch.name_simple,
            englishNameTranslation: ch.translated_name.name
        }));
    } catch (error) {
        console.error('Error fetching surahs:', error);
        throw error;
    }
};

// Helper to get Juz start page (Static for standard Madani Mushaf)
export const getJuzStartPage = (juzNumber) => {
    const juzPages = [
        1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
        202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
        402, 422, 442, 462, 482, 502, 522, 542, 562, 582
    ];
    return juzPages[juzNumber - 1] || 1;
};

export const getSurahStartPage = async (surahNumber) => {
    try {
        const response = await axios.get(`${BASE_URL}/chapters/${surahNumber}`);
        // response.data.chapter.pages -> [start, end]
        return response.data.chapter.pages[0];
    } catch (error) {
        console.error('Error getting surah start page:', error);
        return 1;
    }
};
